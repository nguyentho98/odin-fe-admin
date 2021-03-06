/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Spin,
  message,
  Select,
  Button,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { isEmpty } from "../../utils/helpers";
import {
  actionAddUser,
  actionEditUser,
  actionGetDetailUser,
  actionUploadUserAvatar,
} from "./UserAction";
import { USER_STATUS } from "../../utils/constants/config";
import { getRoleList } from "../role/RoleAction";
let timeoutSearchRole;
export default function AddEditUserModal(props) {
  const { visible = true, onCancel, item = {} } = props;
  const isAddNew = isEmpty(item);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [roleData, setRoleData] = useState([]);
  useEffect(() => {
    if ((fileList || []).length > 0) {
      handleUploadFile(fileList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileList]);
  useEffect(async () => {
    if (item?.id) {
      const { data } = await actionGetDetailUser("id", item?.id);
      const dataRole = data?.data?.roles || [];
      const tmp = [];
      if (dataRole.length > 0) {
        dataRole.forEach((item) => {
          tmp.push(item.id);
        });
      }
      form.setFieldsValue({ roleIds: tmp });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    if (item?.roleId) {
      handleFetchRoleData("id", item?.roleId);
    } else {
      handleFetchRoleData();
    }
  }, [item]);

  const handleFetchRoleData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getRoleList(rqParams);
      setRoleData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchRole = (value) => {
    clearTimeout(timeoutSearchRole);
    timeoutSearchRole = setTimeout(() => {
      handleFetchRoleData("roleName", value);
    }, 300);
  };
  const handleUploadFile = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);
      const { data } = await actionUploadUserAvatar(formData);
      console.log(data);
      form.setFieldsValue({ avatar: data.data[0] || "" });
      setUploading(false);
    } catch (error) {
      setUploading(false);
    }
  };

  const handleOk = () => {
    if (processing || uploading) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          if (isAddNew) {
            await actionAddUser(values);
            message.success("Th??m t??i kho???n th??nh c??ng!");
          } else {
            await actionEditUser(values, item?.id);
            message.success("S???a t??i kho???n th??nh c??ng!");
          }
          setProcessing(false);
          onCancel(true);
        } catch (error) {
          setProcessing(false);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const propsUpload = {
    name: "files",
    showUploadList: false,
    fileList: fileList,
    accept: "image/png, image/jpeg",
    beforeUpload(file) {
      const fileType = file.type;
      const isJpgOrPng =
        fileType === "image/jpeg" ||
        fileType === "image/jpg" ||
        fileType === "image/png";

      if (!isJpgOrPng) {
        message.error("B???n ch??? c?? th??? t???i l??n file c?? ?????nh d???ng JPG/PNG!");
      }

      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error("Ph???i ph???i nh??? h??n 20MB!");
      }

      if (isJpgOrPng && isLt20M) {
        setFileList([file]);
      }

      return false;
    },
  };

  return (
    <Modal
      visible={visible}
      title={isAddNew ? "Th??m t??i kho???n" : "Ch???nh s???a t??i kho???n"}
      okText={isAddNew ? "Th??m" : "L??u"}
      cancelText="H???y b???"
      onCancel={() => onCancel()}
      onOk={handleOk}
      maskClosable={false}
      width="600px"
      className="common-form-modal add-edit-user-modal"
      centered
      okButtonProps={{ className: "btn-ok", size: "large" }}
      cancelButtonProps={{ className: "btn-cancel", size: "large" }}
    >
      <Spin spinning={processing || uploading}>
        <div className="add-edit-user-content">
          <Form
            form={form}
            layout="vertical"
            name="formUser"
            initialValues={{ status: USER_STATUS.DRAFF, ...item }}
            hideRequiredMark
            size="large"
          >
            <Form.Item
              name="roleIds"
              label="Quy???n"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n quy???n!",
                },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="T??m ki???m quy???n"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchRole}
              >
                {roleData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.roleName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="userName"
              label="T??n t??i kho???n"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p t??n t??i kho???n!",
                },
              ]}
            >
              <Input disabled={!isAddNew} />
            </Form.Item>
            <Form.Item
              name="password"
              label="M???t kh???u"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p m???t kh???u!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="fullName"
              label="H??? v?? t??n"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p t??n!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="avatar" label="???nh" className="upload-user-item">
              <Input
                addonAfter={
                  <Upload {...propsUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />} type="link" size="small">
                      T???i l??n
                    </Button>
                  </Upload>
                }
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: "email",
                  message: "Vui l??ng nh???p ????ng ?????nh d???ng E-mail!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="S??? ??i???n tho???i"
              rules={[
                {
                  pattern: new RegExp(
                    /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
                  ),
                  message: "Vui l??ng nh???p ????ng ?????nh d???ng!",
                },
              ]}
            >
              <Input style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="address" label="?????a ch???">
              <Input />
            </Form.Item>
            <Form.Item
              name="status"
              label="Tr???ng th??i"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n tr???ng th??i!",
                },
              ]}
            >
              <Select>
                <Select.Option value={USER_STATUS.DRAFF}>
                  B???n nh??p
                </Select.Option>
                <Select.Option value={USER_STATUS.ACTIVE}>
                  Ho???t ?????ng
                </Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
}
