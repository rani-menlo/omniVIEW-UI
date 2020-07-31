import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { CustomerActions } from "../../redux/actions";
import Header from "../header/header.component";
import {
  Loader,
  ContentLayout,
  Row,
  Text,
  SubHeader,
  TableHeader,
  Pagination,
} from "../../uikit/components";
import { Popover, Switch, Icon } from "antd";
import PopoverCustomers from "../usermanagement/popoverCustomers.component";
import { isLoggedInOmniciaAdmin } from "../../utils";
import { get, find, memoize, map, filter, every, set } from "lodash";
import styled from "styled-components";
import { translate } from "../../translations/translator";

class ApplicationManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      itemsPerPage: 5,
      checkedSequences: [],
      selectedCustomer: this.props.selectedCustomer,
      selectedApplication: {},
      TableColumns: [
        {
          name: TableColumnNames.CUSTOMER,
          key: "type_name",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.APPLICATION,
          key: "duration",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.SEQUENCE,
          key: "expired_date",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.WIP,
          key: "first_name",
          width: "20%",
        },
        {
          name: TableColumnNames.LASTUPDATED,
          key: "first_name",
          sort: true,
          width: "20%",
        },
      ],
      applications: [
        {
          id: 1,
          sequence_count: 5,
          uploaded_sequences: 2,
          errors: 2,
          isViewable: false,
          customer_name: "LOXO",
          name: "ind000001",
        },
        {
          id: 2,
          sequence_count: 5,
          uploaded_sequences: 1,
          errors: 0,
          isViewable: true,
          customer_name: "LOXO",
          name: "ind000002",
        },
        {
          id: 1,
          sequence_count: 5,
          uploaded_sequences: 3,
          errors: 0,
          isViewable: false,
          customer_name: "LOXO",
          name: "ind000003",
        },
      ],
    };
  }

  componentDidMount() {
    let selectedCustomer = {
      id: 0,
      company_name: "All Customers",
    };
    this.setState({ selectedCustomer });
  }

  /**
   * get each column width
   */
  getColumnWidth = memoize((name) => {
    const col = find(this.state.TableColumns, (col) => col.name === name);
    return get(col, "width");
  });

  /**
   * On customer selection in the subheader
   * @param {*} customer
   */
  onCustomerSelected = (customer) => {
    this.setState({ selectedCustomer: customer });
    this.props.dispatch(CustomerActions.setSelectedCustomer(customer));
  };

  /**
   *
   * @param {*} sortBy
   * @param {*} orderBy
   */
  sortColumn = (sortBy, orderBy) => {};

  render() {
    const { loading } = this.props;
    const {
      applications,
      itemsPerPage,
      pageNo,
      TableColumns,
      selectedCustomer,
    } = this.state;
    let applicationsCount = 3;
    return (
      <>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          {isLoggedInOmniciaAdmin(this.props.role) && (
            <Popover
              trigger="click"
              placement="bottom"
              content={
                <PopoverCustomers
                  onCustomerSelected={this.onCustomerSelected}
                  showAll={true}
                />
              }
            >
              <Row style={{ margin: "auto" }}>
                <Text
                  type="extra_bold"
                  size="20px"
                  className="userManagement-subheader-title"
                  text={selectedCustomer.company_name}
                />
                <img
                  className="global__cursor-pointer"
                  src="/images/caret-inactive.svg"
                  style={{ marginLeft: "5px" }}
                />
              </Row>
            </Popover>
          )}
        </SubHeader>
        <ContentLayout className="applications-management-layout">
          <div className="applications-management-layout__header">
            <Text
              type="bold"
              size="24px"
              textStyle={{ paddingLeft: "12px" }}
              text={translate("label.submissions.applicationManagement")}
            />
          </div>

          <div className="applications-management-layout__list">
            <TableHeader columns={TableColumns} sortColumn={this.sortColumn} />
            {map(applications, (application) => (
              <Row
                key={application.id}
                className="applications-management-layout__list__item global__cursor-pointer"
                style={{ justifyContent: "normal" }}
              >
                <Column
                  width={this.getColumnWidth(TableColumnNames.CUSTOMER)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(application, "customer_name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.APPLICATION)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(application, "name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.SEQUENCE)}
                  className="applications-management-layout__list__item-text"
                >
                  {`${get(application, "uploaded_sequences", 0)} of ${get(
                    application,
                    "sequence_count",
                    0
                  )}`}
                </Column>

                <Column
                  width={this.getColumnWidth(TableColumnNames.WIP)}
                  className="applications-management-layout__list__item-text-status"
                >
                  <Switch
                    size="small"
                    className="applications-management-layout__list__item-text"
                  ></Switch>
                  <span
                    className="applications-management-layout__list__item-text"
                    style={{ paddingLeft: "12px" }}
                  >
                    {application.isViewable ? "Yes" : "No"}
                  </span>
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.LASTUPDATED)}
                  className="applications-management-layout__list__item-text"
                >
                  <span
                    className={`${get(application, "errors") != 0 &&
                      "applications-management-layout__list__item-text-link"}`}
                  >
                    {get(application, "errors", 0)}
                  </span>
                </Column>
              </Row>
            ))}
          </div>
          {/* {!get(this.props, "users.length") && (
              <Row className="applications-management-layout__nodata">
                <Icon
                  style={{ fontSize: "20px" }}
                  type="exclamation-circle"
                  className="applications-management-layout__nodata-icon"
                />
                {translate("error.dashboard.notfound", {
                  type: translate("label.dashboard.applications"),
                })}
              </Row>
            )} */}
          <Pagination
            key={applicationsCount}
            containerStyle={
              applicationsCount > 4 ? { marginTop: "1%" } : { marginTop: "20%" }
            }
            total={applicationsCount}
            showTotal={(total, range) =>
              translate("text.pagination", {
                top: range[0],
                bottom: range[1],
                total,
                type: translate("label.dashboard.applications"),
              })
            }
            pageSize={itemsPerPage}
            current={pageNo}
            onPageChange={this.onPageChange}
            onPageSizeChange={this.onPageSizeChange}
          />
        </ContentLayout>
      </>
    );
  }
}

const Column = styled.div`
  width: ${(props) => props.width};
`;

const TableColumnNames = {
  CUSTOMER: translate("label.dashboard.customer"),
  APPLICATION: translate("label.dashboard.application"),
  SEQUENCE: translate("label.dashboard.sequence"),
  WIP: translate("label.generic.wip"),
  LASTUPDATED: translate("label.generic.lastUpdated"),
};

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    selectedCustomer: state.Customer.selectedCustomer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationManagement);
