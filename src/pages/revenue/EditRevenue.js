/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Spin,
  message,
  Select,
  Button,
  Row,
  Col,
  InputNumber,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { isEmpty } from "../../utils/helpers";
import { actionEditRevenue, getRevenueDetail } from "./RevenueAction";
import { getCourseList } from "../course/CourseAction";
import { REVENUE_STATUS, routes } from "../../utils/constants/config";
import { PageHeader } from "../../components";
import "./AddOrEditRevenue.scss";
import { getVoucherList } from "../voucher/VoucherAction";
import { getUserList } from "../user/UserAction";

let timeoutSearchCourse;
let timeoutSearchVoucher;
let timeoutSearchSaler;
let timeoutSearchUser;
let timeoutSearchRef;

export default function EditRevenue(props) {
  const { match, history } = props;
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [refData, setRefData] = useState([]);
  const [voucherData, setVoucherData] = useState([]);
  const [salerData, setSalerData] = useState([]);
  const [revenueDetail, setRevenueDetail] = useState({});
  const [currentCourse, setCurrentCourse] = useState({});
  const [currentVoucher, setCurrentVoucher] = useState({});
  useEffect(() => {
    if (match?.params?.revenueId) {
      handleFetchRevenueDetail(match?.params?.revenueId);
    }
  }, [match]);
  useEffect(() => {
    const total = currentTotal();
    form.setFieldsValue({ total: total || 0 });
    form.setFieldsValue({ amount: total || 0 });
        form.setFieldsValue({ debit: total || 0 });
    if(currentCourse && currentVoucher) {
      const tmp = voucherData.find(item =>item.id === currentVoucher)
      if(tmp){
        form.setFieldsValue({ amount: total - total*tmp.discount/100 || 0 });
        form.setFieldsValue({ debit: total - total*tmp.discount/100 || 0 });
      }
    }
  }, [currentCourse, currentVoucher])

  const currentTotal = () => {
    if(currentCourse) {
      const tmp = courseData.find(item =>item.id === currentCourse)
      if(tmp){
        return tmp.promotionPrice
      }
    }
    return 0;
  }
  const handleFetchRevenueDetail = async (revenueId) => {
    try {
      setProcessing(true);
      const { data } = await getRevenueDetail(revenueId);
      if (data?.data?.length > 0) {
        setRevenueDetail(data?.data[0]);
        if (!isEmpty(data?.data[0])) {
          form.setFieldsValue({
            ...data?.data[0],
          });
        }
      }
      setProcessing(false);
    } catch (error) {
      message.error("Doanh thu kh??ng t???n t???i!");
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutSearchCourse);
      clearTimeout(timeoutSearchVoucher);
      clearTimeout(timeoutSearchSaler);
      clearTimeout(timeoutSearchUser);
      clearTimeout(timeoutSearchRef);
    };
  }, []);

  useEffect(() => {
    if (revenueDetail?.courseId) {
      handleFetchCourseData("id", revenueDetail?.courseId);
    } else {
      handleFetchCourseData();
    }
    if (revenueDetail?.voucherId) {
      handleFetchVoucherData("id", revenueDetail?.voucherId);
    } else {
      handleFetchVoucherData();
    }
    if (revenueDetail?.userId) {
      handleFetchUserData("id", revenueDetail?.userId);
    } else {
      handleFetchUserData();
    }
    if (revenueDetail?.salerId) {
      handleFetchSalerData("id", revenueDetail?.salerId);
    } else {
      handleFetchSalerData();
    }
    if (revenueDetail?.refId) {
      handleFetchRefData("id", revenueDetail?.refId);
    } else {
      handleFetchRefData();
    }
  }, [revenueDetail]);

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

  const handleFetchVoucherData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getVoucherList(rqParams);
      setVoucherData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchVoucher = (value) => {
    clearTimeout(timeoutSearchVoucher);
    timeoutSearchVoucher = setTimeout(() => {
      handleFetchVoucherData("voucherCode", value);
    }, 300);
  };

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
    clearTimeout(timeoutSearchUser);
    timeoutSearchUser = setTimeout(() => {
      handleFetchUserData("fullName", value);
    }, 300);
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

  const handleSearchSaler = (value) => {
    clearTimeout(timeoutSearchSaler);
    timeoutSearchSaler = setTimeout(() => {
      handleFetchSalerData("fullName", value);
    }, 300);
  };

  const handleFetchRefData = async (field, value) => {
    try {
      let rqParams = { page: 0, size: 50, query: "" };
      if (field && value) {
        rqParams.query = isNaN(value)
          ? `${field}=="*${value}*"`
          : `${field}==${value}`;
      }

      const { data } = await getUserList(rqParams);
      setRefData(data?.data || []);
    } catch (error) {}
  };

  const handleSearchRef = (value) => {
    clearTimeout(timeoutSearchRef);
    timeoutSearchRef = setTimeout(() => {
      handleFetchRefData("fullName", value);
    }, 300);
  };

  const handleOk = () => {
    if (processing) return;
    form
      .validateFields()
      .then(async (values) => {
        try {
          setProcessing(true);
          await actionEditRevenue(values, revenueDetail?.id);
          message.success("S???a doanh thu th??nh c??ng!");
          history?.push(routes.REVENUE);
          setProcessing(false);
        } catch (error) {
          setProcessing(false);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <div className="common-page">
      <div className="revenue-detail-content">
        <Spin spinning={processing}>
          <PageHeader
            pageTitle={
              <div>
                <span
                  className="back-to-revenue"
                  onClick={() => {
                    history?.push(routes.REVENUE);
                  }}
                >{`Doanh thu / `}</span>
                <span>C???p nh???t</span>
              </div>
            }
          />
          <div className="add-edit-revenue-content">
            <Form
              form={form}
              layout="vertical"
              name="formRevenue"
              initialValues={{ status: REVENUE_STATUS.DRAFF, ...revenueDetail }}
              hideRequiredMark
              size="large"
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item
                    name="userId"
                    label="H???c sinh"
                    rules={[
                      {
                        required: true,
                        message: "Vui l??ng ch???n h???c sinh!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="T??m ki???m h???c sinh"
                      filterOption={false}
                      allowClear
                      defaultActiveFirstOption={true}
                      onSearch={handleSearchUser}
                    >
                      {userData.map((it) => (
                        <Select.Option key={it.id} value={it.id}>
                          {it?.fullName || ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} lg={8}>
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
                      allowClear
                      defaultActiveFirstOption={true}
                      onSearch={handleSearchCourse}
                      onChange={(item) => setCurrentCourse(item)}
                    >
                      {courseData.map((it) => (
                        <Select.Option key={it.id} value={it.id}>
                          {it?.courseName || ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item
                    name="salerId"
                    label="Nh??n vi??n"
                    rules={[
                      {
                        required: true,
                        message: "Vui l??ng ch???n nh??n vi??n!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="T??m ki???m nh??n vi??n"
                      filterOption={false}
                      allowClear
                      defaultActiveFirstOption={true}
                      onSearch={handleSearchSaler}
                    >
                      {salerData.map((it) => (
                        <Select.Option key={it.id} value={it.id}>
                          {it?.fullName || ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item name="refId" label="Ng?????i gi???i thi???u">
                    <Select
                      showSearch
                      placeholder="T??m ki???m ng?????i gi???i thi???u"
                      filterOption={false}
                      allowClear
                      defaultActiveFirstOption={true}
                      onSearch={handleSearchRef}
                    >
                      {refData.map((it) => (
                        <Select.Option key={it.id} value={it.id}>
                          {it?.fullName || ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item
                    name="voucherId"
                    label="Khuy???n m??i"
                  >
                    <Select
                      showSearch
                      placeholder="T??m ki???m khuy???n m??i"
                      filterOption={false}
                      allowClear
                      defaultActiveFirstOption={true}
                      onSearch={handleSearchVoucher}
                      onChange={(item) => setCurrentVoucher(item)}
                    >
                      {voucherData.map((it) => (
                        <Select.Option key={it.id} value={it.id}>
                          {it?.voucherCode || ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item name="amount" label="T???ng t???m t??nh">
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item name="debit" label="Ghi n???">
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} lg={8}>
                  <Form.Item name="total" label="T???ng ti???n">
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="noted" label="Ghi ch??">
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
                  <Select.Option value={REVENUE_STATUS.DRAFF}>
                    B???n nh??p
                  </Select.Option>
                  <Select.Option value={REVENUE_STATUS.ACTIVE}>
                    Ho???t ?????ng
                  </Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </div>
          <div className="footer-revenue">
            <Button
              className="btn-action"
              onClick={() => history?.push(routes.REVENUE)}
            >
              H???y
            </Button>
            <Button
              className="btn-action btn-add-new"
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleOk}
            >
              C???p nh???t doanh thu
            </Button>
          </div>
        </Spin>
      </div>
    </div>
  );
}
