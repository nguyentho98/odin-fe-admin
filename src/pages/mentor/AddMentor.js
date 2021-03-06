import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Spin,
  message,
  Select,
  Button,
  Upload,
  Rate,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { actionAddMentor } from "./MentorAction";
import { ITEM_STATUS, routes } from "../../utils/constants/config";
import { actionUploadFile } from "../system/systemAction";
import TinyEditor from "../../components/tinyEditor";
import { PageHeader } from "../../components";
import { getUserList } from "../user/UserAction";
import "./Mentor.scss";

let timeoutSearchUser;

const AddMentor = (props) => {
  const { history } = props;
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [introduction, setIntroduction] = useState("");

  useEffect(() => {
    if ((fileList || []).length > 0) {
      handleUploadFile(fileList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileList]);

  const [userData, setUserData] = useState([]);

  useEffect(() => {
    handleFetchUserData();
    return () => {
      clearTimeout(timeoutSearchUser);
    };
  }, []);

  const handleFetchUserData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getUserList(rqParams);
      setUserData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchUser = (value) => {
    clearTimeout(timeoutSearchUser);
    timeoutSearchUser = setTimeout(() => {
      handleFetchUserData("fullName", value);
    }, 300);
  };

  const handleUploadFile = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);
      const { data } = await actionUploadFile(formData);
      form.setFieldsValue({ avatar: data.data[0] || "" });
      setUploading(false);
    } catch (error) {
      setUploading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (processing || uploading) return;
    try {
      setProcessing(true);
      await actionAddMentor({ ...values, introduction });
      message.success("Th??m gi???ng vi??n th??nh c??ng!");
      setProcessing(false);
      resetFieldData();
    } catch (error) {
      setProcessing(false);
    }
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

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 24 },
      lg: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 24 },
      lg: { span: 16 },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 24,
        offset: 0,
      },
      md: {
        span: 24,
        offset: 0,
      },
      lg: { offset: 4, span: 16 },
    },
  };

  const resetFieldData = () => {
    setIntroduction("");
    form.resetFields();
  };

  return (
    <div className="add-edit-mentor-page common-page">
      <Spin spinning={processing || uploading}>
        <PageHeader
          pageTitle={
            <div>
              <span
                className="back-to-page"
                onClick={() => {
                  history?.push(routes.MENTOR);
                }}
              >{`Gi???ng vi??n / `}</span>
              <span>Th??m gi???ng vi??n</span>
            </div>
          }
        />

        <div className="add-edit-content">
          <Form
            {...formItemLayout}
            form={form}
            name="form"
            onFinish={handleSubmit}
            scrollToFirstError
            hideRequiredMark
            size="middle"
            initialValues={{ status: ITEM_STATUS.DRAFF }}
          >
            <Form.Item
              name="userId"
              label="T??i kho???n"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n t??i kho???n!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="T??m ki???m t??i kho???n"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchUser}
                // onChange={onChangeUser}
              >
                {userData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.fullName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="avt_img"
              label="???nh gi???ng vi??n"
              className="upload-mentor-item"
              rules={[
                {
                  type: "url",
                  message: "Kh??ng ????ng ?????nh d???ng!",
                },
              ]}
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
              name="video_url"
              label="Video gi???i thi???u"
              rules={[
                {
                  type: "url",
                  message: "Kh??ng ????ng ?????nh d???ng!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="fullName"
              label="T??n gi???ng vi??n"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p t??n gi???ng vi??n!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="M?? t???">
              <Input.TextArea />
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
            <Form.Item name="job" label="Ngh??? nghi???p">
              <Input />
            </Form.Item>
            <Form.Item name="language" label="Ng??n ng???">
              <Input />
            </Form.Item>

            <Form.Item name="stars" label="????nh gi??">
              <Rate />
            </Form.Item>
            <Form.Item label="Gi?? ti???n" style={{ marginBottom: 0 }}>
              <Form.Item
                name="min"
                style={{ display: "inline-block", width: "calc(50% - 8px)" }}
                rules={[
                  {
                    required: true,
                    message: "Vui l??ng nh???p gi?? ti???n th???p nh???t!",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Gi?? th???p nh???t"
                />
              </Form.Item>
              <Form.Item
                name="max"
                style={{
                  display: "inline-block",
                  width: "calc(50% - 8px)",
                  margin: "0 8px",
                }}
                rules={[
                  {
                    required: true,
                    message: "Vui l??ng nh???p gi?? ti???n cao nh???t!",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Gi?? cao nh???t"
                />
              </Form.Item>
            </Form.Item>

            <Form.Item name="totalBookings" label="S??? l?????t ?????t tr?????c">
              <InputNumber min={0} style={{ width: "100%" }} />
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
                <Select.Option value={ITEM_STATUS.DRAFF}>
                  B???n nh??p
                </Select.Option>
                <Select.Option value={ITEM_STATUS.ACTIVE}>
                  Ho???t ?????ng
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Gi???i thi???u">
              <TinyEditor
                value={introduction}
                onChangeValue={(value) => setIntroduction(value)}
                height={250}
              />
            </Form.Item>
            <Form.Item {...tailFormItemLayout} className="action-group-btn">
              <Button type="primary" htmlType="submit" className="action-btn">
                Th??m
              </Button>
              <Button
                type="primary"
                ghost
                htmlType="button"
                className="action-btn"
                onClick={() => {
                  history?.push(routes.MENTOR);
                }}
              >
                Quay l???i
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </div>
  );
};

export default withRouter(AddMentor);
