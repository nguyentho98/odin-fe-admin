import React, { useCallback, useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Table, message, Tag, Pagination, Button, Tooltip } from "antd";
import { isEmpty } from "../../utils/helpers";
import {
  actionDeleteItem,
  actionGetBlog,
  actionGetBlogDetail,
} from "./BlogAction";
import { TableCellActions, PageHeader, HeaderAction } from "../../components";
import { ITEM_STATUS, routes } from "../../utils/constants/config";
import PreviewImage from "../../components/previewImage";
import "./Blog.scss";
import PreviewContent from "./PreviewContent";
import ApproveOrRejectModal from "./ApproveOrRejectModal";

let params = {
  page: 1,
  size: 20,
  query: "",
};

const TYPE = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
};

const Blog = (props) => {
  const { profile = {}, history } = props;
  const [processing, setProcessing] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState([]);
  const [searchData, setSearchData] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [blogs, setBlogs] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [itemDetail, setItemDetail] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [typeModal, setTypeModal] = useState();

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
      handleFetchData(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleFetchData = async (params = {}) => {
    try {
      setIsFetching(true);
      const { data } = await actionGetBlog({
        ...params,
        page: params.page - 1,
      });
      setBlogs(data || {});
      setIsFetching(false);
    } catch (error) {
      console.log(error);
      setIsFetching(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (processing || !id) return;
    try {
      setProcessing(true);
      await actionDeleteItem(id);
      handleFetchData({ ...params, page: 1 });
      message.success("X??a b??i vi???t th??nh c??ng!");
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
    }
  };

  const handleEditItem = (items = {}) => {
    history.push(routes.BLOG + "/" + items.id);
  };

  const handleApproveItem = async () => {
    if (processing) return;
    setTypeModal(TYPE.APPROVE);
    setVisibleModal(true);
  };

  const handleRejectItem = async () => {
    if (processing) return;
    setTypeModal(TYPE.REJECT);
    setVisibleModal(true);
  };

  const disableBtnAction = useCallback(() => {
    return !selectedRows.find((it) => it.status === ITEM_STATUS.DRAFF);
  }, [selectedRows]);

  const customActions = [
    {
      name: "T??? ch???i",
      danger: true,
      action: handleRejectItem,
      disabled: disableBtnAction(),
    },
    {
      name: "Ph?? duy???t",
      action: handleApproveItem,
      disabled: disableBtnAction(),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (rowKeys, rows) => {
      setSelectedRowKeys(rowKeys || []);
      setSelectedRows(rows);
    },
  };

  const resetSelectedItems = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const handlePreviewContent = async (item) => {
    try {
      const { data } = await actionGetBlogDetail(item?.id);
      setItemDetail(data?.data || {});
      setShowPreview(true);
    } catch (error) {}
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      width: 80,
    },
    {
      title: "H??nh ???nh",
      dataIndex: "avatar",
      key: "avatar",
      width: 130,
      render: (srcUrl) => (srcUrl ? <PreviewImage srcImg={srcUrl} /> : null),
    },
    {
      title: "Ti??u ?????",
      dataIndex: "title",
      key: "title",
      render: (title, item) => (
        <Tooltip title="Xem chi ti???t n???i dung">
          <Button type="link" onClick={() => handlePreviewContent(item)}>
            {title || ""}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "M?? t???",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Th??? lo???i",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "L?????t th??ch",
      dataIndex: "likePost",
      key: "likePost",
      align: "center",
    },
    {
      title: "L?????t xem",
      dataIndex: "viewPost",
      key: "viewPost",
      align: "center",
    },
    {
      title: "T??c gi???",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Tr???ng th??i",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: "150px",
      sorter: true,
      filterMultiple: false,
      filteredValue: filteredStatus,
      filters: [
        {
          text: "???? ph?? duy???t",
          value: ITEM_STATUS.ACTIVE,
        },
        {
          text: "Ch??a ph?? duy???t",
          value: ITEM_STATUS.DRAFF,
        },
        {
          text: "???? t??? ch???i",
          value: ITEM_STATUS.REJECTED,
        },
      ],
      render: (status) => (
        <Tag
          color={
            status === ITEM_STATUS.ACTIVE
              ? "success"
              : status === ITEM_STATUS.REJECTED
              ? "error"
              : "warning"
          }
          className="cell-status"
        >
          {status === ITEM_STATUS.ACTIVE
            ? "???? ph?? duy???t"
            : status === ITEM_STATUS.REJECTED
            ? "???? t??? ch???i"
            : "Ch??a ph?? duy???t"}
        </Tag>
      ),
    },
  ];

  columns.push({
    title: "Actions",
    key: "action",
    align: "center",
    width: "100px",
    render: (_, record) => (
      <TableCellActions
        isHasPermissonUpdate={record?.status !== ITEM_STATUS.DRAFF}
        isHasPermissonDelete={true}
        onEdit={() => handleEditItem(record)}
        onDelete={() => handleDeleteItem(record.id)}
        deleteNessage="B???n c?? ch???c ch???n mu???n x??a b??i vi???t n??y?"
      />
    ),
  });

  const handleSearch = useCallback(
    (type, value) => {
      const status =
        filteredStatus.length > 0 ? `status=="${filteredStatus[0]}"` : "";
      if (!value) {
        params = { ...params, page: 1, query: status };
        setSearchData({});
      } else {
        setSearchData({ type, value });
        params = {
          ...params,
          page: 1,
          query: `${type}=="${value}"`.trim() + (status ? `;${status}` : ""),
        };
      }
      handleFetchData(params);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredStatus]
  );

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
    handleFetchData(params);
  };

  const handleAddNew = useCallback(() => {
    history.push(routes.BLOG_ADD);
  }, [history]);

  const searchFields = useMemo(() => {
    return [
      { label: "Th??? lo???i", value: "categoryId" },
      { label: "M?? t???", value: "description" },
    ];
  }, []);

  return (
    <div className="blog-page common-page">
      <div className="blog-content">
        <PageHeader pageTitle="B??i vi???t" />
        <HeaderAction
          searchFields={searchFields}
          defaultSearchType={searchFields[0]?.value}
          onSearch={handleSearch}
          onAction={handleAddNew}
          isHasPermissonAdd={true}
          customActions={customActions}
        />
        <Table
          className="table-content"
          columns={columns}
          dataSource={blogs?.data || []}
          loading={isFetching || processing}
          pagination={false}
          rowKey={(record) => record?.id}
          scroll={{ x: true }}
          size="middle"
          onChange={handleOnChangeTable}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
        />
        {blogs?.page?.total_elements > 0 && (
          <Pagination
            size="small"
            className="pagination-table"
            defaultCurrent={params.page}
            defaultPageSize={params.size}
            total={blogs?.page?.total_elements || 0}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `T???ng s??? ${total} ph???n t???`}
            onChange={(page, size) => {
              params = { ...params, page: page, size: size };
              handleFetchData(params);
            }}
          />
        )}
      </div>
      {showPreview && (
        <PreviewContent
          item={itemDetail}
          onCancel={(isRefresh) => {
            setItemDetail({});
            setShowPreview(false);
            if (isRefresh) {
              handleFetchData(params);
            }
          }}
        />
      )}
      {visibleModal && (
        <ApproveOrRejectModal
          selectedRows={selectedRows}
          type={typeModal}
          onCancel={(isRefresh) => {
            setVisibleModal(false);
            if (isRefresh) {
              resetSelectedItems();
              handleFetchData(params);
            }
          }}
        />
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    profile: state.system?.profile,
  }),
  {}
)(withRouter(Blog));
