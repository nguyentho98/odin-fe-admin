import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Spin,
  message,
  Select,
  InputNumber,
  Upload,
  Button,
} from "antd";
import { isEmpty } from "../../utils/helpers";
import {
  actionAddBilling,
  actionEditBilling,
  actionUploadBillingAvatar,
} from "./BillingAction";
import { getUserList } from "../user/UserAction";
import { BILLING_STATUS } from "../../utils/constants/config";
import { UploadOutlined } from "@ant-design/icons";
let timeoutSearchUser;

export default function AddOrEditBillingModal(props) {
  const { visible = true, onCancel, item = {} } = props;
  const isAddNew = isEmpty(item);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [userData, setUserData] = useState([]);
  const [salerData, setSalerData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [fileListBillImg, setFileListBillImg] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if ((fileList || []).length > 0) {
      handleUploadFileReceipts(fileList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileList]);

  useEffect(() => {
    if ((fileListBillImg || []).length > 0) {
      handleUploadFileBillImg(fileListBillImg[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileListBillImg]);

  const handleUploadFileReceipts = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);
      const { data } = await actionUploadBillingAvatar(formData);
      console.log(data);
      form.setFieldsValue({ receipts: data.data[0] || "" });
      setUploading(false);
    } catch (error) {
      setUploading(false);
    }
  };
  const handleUploadFileBillImg = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);
      const { data } = await actionUploadBillingAvatar(formData);
      console.log(data);
      form.setFieldsValue({ billImg: data.data[0] || "" });
      setUploading(false);
    } catch (error) {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutSearchUser);
    };
  }, []);

  useEffect(() => {
    if (item?.userId) {
      handleFetchUserData("id", item?.userId);
    } else {
      handleFetchUserData();
    }
  }, [item]);

  useEffect(() => {
    if (item?.userId) {
      handleFetchSalerData("id", item?.salerId);
    } else {
      handleFetchSalerData();
    }
  }, [item]);

  const handleFetchUserData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "type==STUDENT" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getUserList(rqParams);
      setUserData(data?.data || []);
    } catch (error) {}
  };

  const handleFetchSalerData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "type==MENTOR" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getUserList(rqParams);
      setSalerData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchUser = (value) => {
    clearTimeout(timeoutSearchUser);
    timeoutSearchUser = setTimeout(() => {
      handleFetchUserData("fullName", value);
    }, 300);
  };

  const handleOk = () => {
    if (processing || uploading) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          if (isAddNew) {
            await actionAddBilling(values);
            message.success("Th??m ho?? ????n th??nh c??ng!");
          } else {
            await actionEditBilling(values, item?.id);
            message.success("S???a ho?? ????n th??nh c??ng!");
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
  const onChangeUser = (value) => {
    const userTmp = userData.find((item) => item.id === value);
    form.setFieldsValue({ studentName: userTmp?.fullName || "" });
  };

  const onChangeSaler = (value) => {
    const userTmp = userData.find((item) => item.id === value);
    form.setFieldsValue({ salerName: userTmp?.fullName || "" });
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

  const propsUploadBillImg = {
    name: "files",
    showUploadList: false,
    fileList: fileListBillImg,
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
        setFileListBillImg([file]);
      }

      return false;
    },
  };

  return (
    <Modal
      visible={visible}
      title={isAddNew ? "Th??m ho?? ????n" : "Ch???nh s???a ho?? ????n"}
      okText={isAddNew ? "Th??m" : "L??u"}
      cancelText="H???y b???"
      onCancel={() => onCancel()}
      onOk={handleOk}
      maskClosable={false}
      width="600px"
      className="common-form-modal add-edit-billing-modal"
      centered
      okButtonProps={{ className: "btn-ok", size: "large" }}
      cancelButtonProps={{ className: "btn-cancel", size: "large" }}
    >
      <Spin spinning={processing || uploading}>
        <div className="add-edit-billing-content">
          <Form
            form={form}
            layout="vertical"
            name="formBilling"
            initialValues={{ status: BILLING_STATUS.DRAFF, ...item }}
            hideRequiredMark
            size="large"
          >
            <Form.Item
              name="userId"
              label="H???c vi??n"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n h???c vi??n!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="T??m ki???m h???c vi??n"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchUser}
                onChange={onChangeUser}
              >
                {userData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.fullName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="salerId"
              label="Nh??n vi??n sales"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n nh??n vi??n sales!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="T??m ki???m nh??n vi??n sales"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchUser}
                onChange={onChangeSaler}
              >
                {salerData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.fullName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="T???ng ti???n"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng nh???p t??n t???ng ti???n!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item
              name="receipts"
              label="???nh bi??n lai thu ti???n"
              className="upload-course-item"
            >
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
              name="billImg"
              label="???nh thu ti???n"
              className="upload-course-item"
            >
              <Input
                addonAfter={
                  <Upload {...propsUploadBillImg} showUploadList={false}>
                    <Button icon={<UploadOutlined />} type="link" size="small">
                      T???i l??n
                    </Button>
                  </Upload>
                }
              />
            </Form.Item>
            <Form.Item name="noted" label="Ghi ch??">
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              style={{ display: "none" }}
              name="studentName"
            ></Form.Item>
            <Form.Item style={{ display: "none" }} name="salerName"></Form.Item>
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
                <Select.Option value={BILLING_STATUS.DRAFF}>
                  B???n nh??p
                </Select.Option>
                <Select.Option value={BILLING_STATUS.ACTIVE}>
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
