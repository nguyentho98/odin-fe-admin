import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Spin,
  message,
  Select,
} from "antd";
import { isEmpty } from "../../utils/helpers";
import {
  actionAddUserLesson,
  actionEditUserLesson,
} from "./UserLessonAction";
import {
  USER_LESSON_STATUS,
} from "../../utils/constants/config";
import { getUserList } from "../user/UserAction";
import { getRoomList } from "../room/RoomAction";
import { getLessonList } from "../lesson/LessonAction";

let timeoutSearchLesson;

export default function AddOrEditUserLessonModal(props) {
  const { visible = true, onCancel, item = {} } = props;
  const isAddNew = isEmpty(item);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [userData, setUserData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [lessonData, setLessonData] = useState([]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutSearchLesson);
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
    if (item?.roomId) {
      handleFetchRoomData("id", item?.roomId);
    } else {
      handleFetchRoomData();
    }
  }, [item]);

  useEffect(() => {
    if (item?.lessonId) {
      handleFetchLessonData("id", item?.lessonId);
    } else {
      handleFetchLessonData();
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

  const handleSearchUser = (value) => {
    clearTimeout(timeoutSearchLesson);
    timeoutSearchLesson = setTimeout(() => {
      handleFetchUserData("userName", value);
    }, 300);
  };
  const handleFetchRoomData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getRoomList(rqParams);
      setRoomData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchRoom = (value) => {
    clearTimeout(timeoutSearchLesson);
    timeoutSearchLesson = setTimeout(() => {
      handleFetchRoomData("roomName", value);
    }, 300);
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

  const handleSearchLesson = (value) => {
    clearTimeout(timeoutSearchLesson);
    timeoutSearchLesson = setTimeout(() => {
      handleFetchLessonData("lessonName", value);
    }, 300);
  };
  const handleOk = () => {
    if (processing) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          if (isAddNew) {
            await actionAddUserLesson(values);
            message.success("Th??m ??i???m danh th??nh c??ng!");
          } else {
            await actionEditUserLesson(values, item?.id);
            message.success("S???a ??i???m danh th??nh c??ng!");
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

  return (
    <Modal
      visible={visible}
      title={isAddNew ? "Th??m ??i???m danh" : "Ch???nh s???a ??i???m danh"}
      okText={isAddNew ? "Th??m" : "L??u"}
      cancelText="H???y b???"
      onCancel={() => onCancel()}
      onOk={handleOk}
      maskClosable={false}
      width="600px"
      className="common-form-modal add-edit-userLesson-modal"
      centered
      okButtonProps={{ className: "btn-ok", size: "large" }}
      cancelButtonProps={{ className: "btn-cancel", size: "large" }}
    >
      <Spin spinning={processing}>
        <div className="add-edit-userLesson-content">
          <Form
            form={form}
            layout="vertical"
            name="formUserLesson"
            initialValues={{ status: USER_LESSON_STATUS.DRAFF, ...item }}
            hideRequiredMark
            size="large"
          >
            <Form.Item
              name="userId"
              label="H???c vi??n"
            >
              <Select
                showSearch
                placeholder="T??m ki???m"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchUser}
              >
                {userData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.userName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="lessonId"
              label="B??i h???c"
            >
              <Select
                showSearch
                placeholder="T??m ki???m"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchLesson}
              >
                {lessonData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.lessonName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="roomId"
              label="Ph??ng h???c"
            >
              <Select
                showSearch
                placeholder="T??m ki???m"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchRoom}
              >
                {roomData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.roomName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="attendStatus"
              label="T??nh tr???ng"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="comment"
              label="B??nh lu???n"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="score"
              label="L?? do"
            >
              <Input />
            </Form.Item>
            {/* <Form.Item
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
                <Select.Option value={USER_LESSON_STATUS.DRAFF}>
                  B???n nh??p
                </Select.Option>
                <Select.Option value={USER_LESSON_STATUS.ACTIVE}>
                  Ho???t ?????ng
                </Select.Option>
              </Select>
            </Form.Item> */}
          </Form>
        </div>
      </Spin>
    </Modal>
  );
}
