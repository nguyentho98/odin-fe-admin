import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Spin, message, Select, InputNumber } from "antd";
import { isEmpty } from "../../utils/helpers";
import {
  actionAddOrdersMentor,
  actionEditOrdersMentor,
} from "./OrdersMentorAction";
import { getUserList } from "../user/UserAction";
import { ORDERS_STATUS } from "../../utils/constants/config";
import { getMentorList } from "../mentor/MentorAction";

let timeoutSearchUser;
let timeoutSearchMentor;

export default function AddOrEditOrdersMentor(props) {
  const { visible = true, onCancel, item = {} } = props;
  const isAddNew = isEmpty(item);
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [userData, setUserData] = useState([]);
  const [mentorData, setMentorData] = useState([]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutSearchUser);
      clearTimeout(timeoutSearchMentor);
    };
  }, []);

  useEffect(() => {
    if (item?.userId) {
      handleFetchUserData("id", item?.userId);
    } else {
      handleFetchUserData();
    }
    if (item?.mentorId) {
      handleFetchMentorData("id", item?.mentorId);
    } else {
      handleFetchMentorData();
    }
  }, [item]);

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

  const handleFetchMentorData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getMentorList(rqParams);
      setMentorData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchMentor = (value) => {
    clearTimeout(timeoutSearchMentor);
    timeoutSearchMentor = setTimeout(() => {
      handleFetchMentorData("fullName", value);
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
            await actionAddOrdersMentor(values);
            message.success("Th??m ????n h??ng th??nh c??ng!");
          } else {
            await actionEditOrdersMentor(values, item?.id);
            message.success("???? c???p nh???t ????n h??ng!");
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
    form.setFieldsValue({ userName: userTmp?.userName || "" });
  };

  return (
    <Modal
      visible={visible}
      title={isAddNew ? "Th??m ????n h??ng" : "C???p nh???t ????n h??ng"}
      okText={isAddNew ? "Th??m" : "L??u"}
      cancelText="H???y b???"
      onCancel={() => onCancel()}
      onOk={handleOk}
      maskClosable={false}
      width="600px"
      className="common-form-modal"
      centered
      okButtonProps={{ className: "btn-ok", size: "large" }}
      cancelButtonProps={{ className: "btn-cancel", size: "large" }}
    >
      <Spin spinning={processing}>
        <div className="add-edit-order-content">
          <Form
            form={form}
            layout="vertical"
            name="formOrder"
            initialValues={{ status: ORDERS_STATUS.PENDING, ...item }}
            hideRequiredMark
            size="middle"
          >
            <Form.Item
              name="userId"
              label="H???c vi??n"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n t??i kho???n!",
                },
              ]}
            >
              <Select
                showSearch
                disabled={!isAddNew}
                placeholder="T??m ki???m t??i kho???n"
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
              name="mentorId"
              label="Gi???ng vi??n"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng ch???n gi???ng vi??n!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="T??m ki???m gi???ng vi??n"
                filterOption={false}
                defaultActiveFirstOption={true}
                onSearch={handleSearchMentor}
              >
                {mentorData.map((it) => (
                  <Select.Option key={it.id} value={it.id}>
                    {it?.fullName || ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="schedule" label="L???ch tr??nh">
              <Input />
            </Form.Item>
            <Form.Item name="totalStudent" label="S??? l?????ng h???c vi??n">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item
              name="price"
              label="????n gi??"
              rules={[
                {
                  required: true,
                  message: "Vui l??ng nh???p s??? ti???n!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item name="payments" label="H??nh th???c thanh to??n">
              <Input />
            </Form.Item>
            <Form.Item name="note" label="Ghi ch??">
              <Input.TextArea />
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
                <Select.Option value={ORDERS_STATUS.PENDING}>
                  Ch??? ph?? duy???t
                </Select.Option>
                <Select.Option value={ORDERS_STATUS.DONE}>
                  X??c nh???n ????n h??ng
                </Select.Option>
                <Select.Option value={ORDERS_STATUS.REJECTED}>
                  H???y ????n h??ng
                </Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
}
