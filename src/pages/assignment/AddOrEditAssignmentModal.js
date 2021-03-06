import React, { useState, useEffect } from "react";
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
import { isEmpty } from "../../utils/helpers";
import {
  actionAddAssignment,
  actionEditAssignment,
  actionUploadAssignmentLink,
} from "./AssignmentAction";
import {
  ASSIGNMENT_STATUS,
  ASSIGNMENT_TYPE,
} from "../../utils/constants/config";
import { getLessonList } from "../lesson/LessonAction";
import { UploadOutlined } from "@ant-design/icons";

let timeoutSearchLesson;

export default function AddOrEditAssignmentModal(props) {
  const { visible = true, onCancel, item = {} } = props;
  const isAddNew = isEmpty(item);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [lessonData, setLessonData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutSearchLesson);
    };
  }, []);

  useEffect(() => {
    if (item?.lessonId) {
      handleFetchLessonData("id", item?.lessonId);
    } else {
      handleFetchLessonData();
    }
  }, [item]);

  useEffect(() => {
    if ((fileList || []).length > 0) {
      handleUploadFile(fileList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileList]);

  const handleUploadFile = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);
      const { data } = await actionUploadAssignmentLink(formData);
      console.log(data);
      form.setFieldsValue({ assignmentLink: data.data[0] || "" });
      setUploading(false);
    } catch (error) {
      setUploading(false);
    }
  };

  const handleFetchLessonData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getLessonList(rqParams);
      setLessonData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchAssignment = (value) => {
    clearTimeout(timeoutSearchLesson);
    timeoutSearchLesson = setTimeout(() => {
      handleFetchLessonData("lessonName", value);
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
            await actionAddAssignment(values);
            message.success("Th??m b??i t???p th??nh c??ng!");
          } else {
            await actionEditAssignment(values, item?.id);
            message.success("S???a b??i t???p th??nh c??ng!");
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
    accept: "application/pdf",
    beforeUpload(file) {
      const fileType = file.type;
      const isJpgOrPng = fileType === "application/pdf";
      if (!isJpgOrPng) {
        message.error("B???n ch??? c?? th??? t???i l??n file c?? ?????nh d???ng PDF!");
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
      title={isAddNew ? "Th??m b??i t???p" : "Ch???nh s???a b??i t???p"}
      okText={isAddNew ? "Th??m" : "L??u"}
      cancelText="H???y b???"
      onCancel={() => onCancel()}
      onOk={handleOk}
      maskClosable={false}
      width="600px"
      className="common-form-modal add-edit-assignment-modal"
      centered
      okButtonProps={{ className: "btn-ok", size: "large" }}
      cancelButtonProps={{ className: "btn-cancel", size: "large" }}
    >
      <Spin spinning={processing || uploading}>
        <div className="add-edit-assignment-content">
          <Form
            form={form}
            layout="vertical"
            name="formAssignment"
            initialValues={{ status: ASSIGNMENT_STATUS.DRAFF, ...item }}
            hideRequiredMark
            size="large"
          >
            <Form.Item
              name="lessonId"
              label="B??i h???c"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n b??i h???c!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="T??m ki???m b??i h???c"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchAssignment}
              >
                {lessonData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.lessonName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="assignmentTitle"
              label="T??n b??i t???p"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p t??n b??i t???p!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="assignmentLink"
              label="File PDF b??i t???p"
              className="upload-assignment-item"
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
              name="assignmentType"
              label="Th??? lo???i"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng ch???n th??? lo???i!",
                },
              ]}
            >
              <Select>
                <Select.Option value={ASSIGNMENT_TYPE.NORMAL}>
                  NORMAL
                </Select.Option>
                <Select.Option value={ASSIGNMENT_TYPE.ADVANCE}>
                  ADVANCE
                </Select.Option>
              </Select>
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
                <Select.Option value={ASSIGNMENT_STATUS.DRAFF}>
                  B???n nh??p
                </Select.Option>
                <Select.Option value={ASSIGNMENT_STATUS.ACTIVE}>
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
