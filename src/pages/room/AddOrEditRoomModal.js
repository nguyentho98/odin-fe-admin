import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Spin, message, Select, DatePicker } from "antd";
import moment from "moment";
import { isEmpty } from "../../utils/helpers";
import { actionAddRoom, actionEditRoom } from "./RoomAction";
import { getCourseList } from "../course/CourseAction";
import { ROOM_STATUS } from "../../utils/constants/config";

let timeoutSearchCourse;

export default function AddOrEditRoomModal(props) {
  const { visible = true, onCancel, item = {} } = props;
  const isAddNew = isEmpty(item);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [courseData, setCourseData] = useState([]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutSearchCourse);
    };
  }, []);

  useEffect(() => {
    if (item?.courseId) {
      handleFetchCourseData("id", item?.courseId);
    } else {
      handleFetchCourseData();
    }
  }, [item]);

  const handleFetchCourseData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getCourseList(rqParams);
      setCourseData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchCourse = (value) => {
    clearTimeout(timeoutSearchCourse);
    timeoutSearchCourse = setTimeout(() => {
      handleFetchCourseData("courseName", value);
    }, 300);
  };

  const handleOk = () => {
    if (processing) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          const postData = {
            ...values,
            startDate: moment(values?.rangeDate[0])
              .startOf("day")
              .format("YYYY-MM-DDTHH:mm:ssZ"),
            endDate: moment(values?.rangeDate[1])
              .endOf("day")
              .format("YYYY-MM-DDTHH:mm:ssZ"),
          };
          delete postData.rangeDate;
          setProcessing(true);
          if (isAddNew) {
            await actionAddRoom(postData);
            message.success("Th??m ph??ng h???c th??nh c??ng!");
          } else {
            await actionEditRoom(postData, item?.id);
            message.success("S???a ph??ng h???c th??nh c??ng!");
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
      title={isAddNew ? "Th??m ph??ng h???c" : "Ch???nh s???a ph??ng h???c"}
      okText={isAddNew ? "Th??m" : "L??u"}
      cancelText="H???y b???"
      onCancel={() => onCancel()}
      onOk={handleOk}
      maskClosable={false}
      width="600px"
      className="common-form-modal add-edit-room-modal"
      centered
      okButtonProps={{ className: "btn-ok", size: "large" }}
      cancelButtonProps={{ className: "btn-cancel", size: "large" }}
    >
      <Spin spinning={processing}>
        <div className="add-edit-room-content">
          <Form
            form={form}
            layout="vertical"
            name="formRoom"
            initialValues={{
              status: ROOM_STATUS.DRAFF,
              ...item,
              rangeDate: [
                moment(item?.startDate || new Date()),
                moment(item?.endDate || new Date()),
              ],
            }}
            hideRequiredMark
            size="large"
          >
            <Form.Item
              name="courseId"
              label="Kh??a h???c"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n kh??a h???c!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="T??m ki???m kh??a h???c"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchCourse}
              >
                {courseData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.courseName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="roomName"
              label="T??n ph??ng h???c"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p t??n ph??ng h???c!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="roomDescription"
              label="M?? t???"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui l??ng nh???p m?? ph??ng h???c!",
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="rangeDate"
              label="Th???i gian"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n kho???ng th???i gian l???p h???c!",
                },
              ]}
            >
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                ranges={{
                  "H??m nay": [moment(), moment()],
                  "Tu???n n??y": [
                    moment().startOf("weeks"),
                    moment().endOf("weeks"),
                  ],
                  "Th??ng n??y": [
                    moment().startOf("month"),
                    moment().endOf("month"),
                  ],
                  "Qu?? n??y": [
                    moment().startOf("quarters"),
                    moment().endOf("quarters"),
                  ],
                  "N??m nay": [
                    moment().startOf("years"),
                    moment().endOf("years"),
                  ],
                }}
              />
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
                <Select.Option value={ROOM_STATUS.DRAFF}>
                  B???n nh??p
                </Select.Option>
                <Select.Option value={ROOM_STATUS.ACTIVE}>
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
