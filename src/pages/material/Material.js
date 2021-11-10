import React, { useCallback, useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Table, message, Pagination, Tag } from "antd";
import { hasPermission, isEmpty } from "../../utils/helpers";
import { actionDeleteMaterial, actionGetMaterials } from "./MaterialAction";
import { TableCellActions, PageHeader, HeaderAction } from "../../components";
import AddOrEditMaterialModal from "./AddOrEditMaterialModal";
import "./Material.scss";
import { MATERIAL_STATUS, MATERIAL_TYPE } from "../../utils/constants/config";
import Slide from "../slide/Slide";
import { permission } from "../../utils/constants/permission";

let params = {
  page: 1,
  size: 20,
  query: "",
};

const Material = (props) => {
  const {
    profile = {},
    actionGetMaterials,
    materials = {},
    isFetching,
  } = props;

  const [processing, setProcessing] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [filteredStatus, setFilteredStatus] = useState([]);
  const [searchData, setSearchData] = useState({});

  useEffect(() => {
    return () => {
      params = {
        page: 1,
        size: 20,
        query: "",
      };
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(profile)) {
      handleFetchMaterial(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleFetchMaterial = (params = {}) => {
    actionGetMaterials({ ...params, page: params.page - 1 });
  };

  const handleDeleteMaterial = async (id) => {
    if (processing || !id) return;
    try {
      setProcessing(true);
      await actionDeleteMaterial(id);
      handleFetchMaterial(params);
      message.success("Xóa khóa học thành công!");
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
    }
  };

  const handleEditItem = (items = {}) => {
    setSelectedItem(items);
    setVisibleModal(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
    },
    {
      title: "Tên học liệu",
      dataIndex: "materialName",
      key: "materialName",
      sorter: true,
    },
    {
      title: "Tên học phần",
      dataIndex: "sessionName",
      key: "sessionName",
      sorter: true,
    },
    {
      title: "Thể loại",
      dataIndex: "materialType",
      key: "materialType",
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: "150px",
      sorter: true,
      filterMultiple: false,
      filteredValue: filteredStatus,
      filters: [
        {
          text: "Active",
          value: MATERIAL_STATUS.ACTIVE,
        },
        {
          text: "Draff",
          value: MATERIAL_STATUS.DRAFF,
        },
      ],
      render: (status) => (
        <Tag
          color={status === MATERIAL_STATUS.ACTIVE ? "success" : "warning"}
          className="cell-status"
        >
          {status || ""}
        </Tag>
      ),
    },
  ];

  if (
    hasPermission(profile, [permission.material_update]) ||
    hasPermission(profile, [permission.material_delete])
  ) {
    columns.push({
      title: "Action",
      key: "action",
      align: "center",
      width: "100px",
      render: (_, record) => (
        <TableCellActions
          isHasPermissonUpdate={hasPermission(profile, [
            permission.material_update,
          ])}
          isHasPermissonDelete={hasPermission(profile, [
            permission.material_delete,
          ])}
          onEdit={() => handleEditItem(record)}
          onDelete={() => handleDeleteMaterial(record.id)}
          deleteNessage="Bạn có chắc chắn muốn xóa học liệu này?"
        />
      ),
    });
  }

  const handleOnChangeTable = (_, filters, sorter) => {
    setFilteredStatus([...(filters?.status || [])]);
    const searchContent = isEmpty(searchData)
      ? ""
      : `${searchData.type}=="${searchData.value}"`;

    if (!(filters?.status || []).length) {
      params = { ...params, page: 1, query: searchContent };
    } else if ((filters?.status || []).length > 0) {
      params = {
        ...params,
        page: 1,
        query:
          `status=="${filters?.status[0]}"` +
          (searchContent ? `;${searchContent}` : ""),
      };
    }
    //change sorter
    if (sorter?.order) {
      if (sorter.order === "ascend") {
        params.sort = sorter.field;
        params.direction = "ASC";
      } else {
        params.sort = sorter.field;
        params.direction = "DESC";
      }
    } else {
      delete params.sort;
      delete params.direction;
    }
    handleFetchMaterial(params);
  };

  const handleSearch = useCallback(
    (type, value) => {
      const status =
        filteredStatus.length > 0 ? `status=="${filteredStatus[0]}"` : "";
      if (!value) {
        params = { ...params, page: 1, query: status };
        setSearchData({});
      } else {
        setSearchData({ type, value });
        let a = `${type}=="${value}"`;
        console.log(a);
        params = {
          ...params,
          page: 1,
          query: `${type}=="${value}"`.trim() + (status ? `;${status}` : ""),
        };
      }

      handleFetchMaterial(params);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredStatus]
  );

  const handleAddNew = useCallback(() => {
    setVisibleModal(true);
  }, []);

  const searchFields = useMemo(() => {
    return [{ label: "Tên học liệu", value: "materialName" }];
  }, []);

  const expandedRowRender = (props) => {
    return <Slide idMaterial={props.id} />;
  };

  return (
    <div className="material-page common-page">
      <div className="material-content">
        <PageHeader pageTitle="Học liệu" />
        <HeaderAction
          onSearch={handleSearch}
          onAction={handleAddNew}
          searchFields={searchFields}
          defaultSearchType={searchFields[0]?.value}
          isHasPermissonAdd={hasPermission(profile, [permission.material_add])}
        />
        <Table
          className="table-content"
          columns={columns}
          dataSource={materials?.data || []}
          loading={isFetching || processing}
          pagination={false}
          rowKey={(record) => record?.id}
          onChange={handleOnChangeTable}
          scroll={{ x: true }}
          size="middle"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => {
              return record?.materialType === MATERIAL_TYPE.SLIDE;
            },
          }}
        />
        {materials?.page?.total_elements > 0 && (
          <Pagination
            size="small"
            className="pagination-table"
            defaultCurrent={params.page}
            defaultPageSize={params.size}
            total={materials?.page?.total_elements || 0}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Tổng số ${total} phần tử`}
            onChange={(page, size) => {
              params = { ...params, page: page, size: size };
              handleFetchMaterial(params);
            }}
          />
        )}
      </div>
      {visibleModal && (
        <AddOrEditMaterialModal
          visible={visibleModal}
          onCancel={(isRefreshData) => {
            if (isRefreshData) {
              handleFetchMaterial(params);
            }
            setSelectedItem({});
            setVisibleModal(false);
          }}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    profile: state.system?.profile,
    materials: state.material?.materials,
    isFetching: state.material?.isFetching,
  }),
  { actionGetMaterials }
)(withRouter(Material));
