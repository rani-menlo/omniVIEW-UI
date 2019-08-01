import React, { Component } from "react";
import _ from "lodash";
import uuidv4 from "uuid/v4";
import styled from "styled-components";
import { connect } from "react-redux";
import {
  TableHeader,
  Pagination,
  Row,
  Toast,
  ImageLoader,
} from "../../uikit/components";
import { Icon } from "antd";
import { translate } from "../../translations/translator";
import AssignLicence from "./assignLicence.component";
import AssignLicenceWithUsers from "./assignLicenceWithUsers.component";
import { CustomerActions, UsermanagementActions } from "../../redux/actions";
import { getFormattedDate } from "../../utils";

class Subscriptions extends Component {
  static getDerivedStateFromProps(props, state) {
    if (state.licencesFromProps !== props.allLicences) {
      return {
        licencesFromProps: props.allLicences,
        allLicences: Subscriptions.getItemsBasedOnPagination(
          props.allLicences,
          state.pageNo,
          state.itemsPerPage
        )
        // allLicences: props.allLicences
      };
    }
    return null;
  }

  static getItemsBasedOnPagination(array, pageNo, itemsPerPage) {
    const from = (pageNo - 1) * itemsPerPage;
    const to = pageNo * itemsPerPage;
    const newArray = _.slice(array, from, to);

    return newArray;
  }

  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      itemsPerPage: 5,
      allLicences: null,
      showUsersModal: false,
      showAssignLicenceToUser: false,
      assigningLicence: null,
      licencesFromProps: [],
      selectedUser: null
    };
  }

  componentDidMount() {
    const { selectedCustomer } = this.props;
    selectedCustomer &&
      this.props.dispatch(
        UsermanagementActions.getAllLicences(selectedCustomer.id)
      );
  }

  onPageChange = pageNo => {
    this.setState({
      pageNo,
      allLicences: Subscriptions.getItemsBasedOnPagination(
        this.props.allLicences,
        pageNo,
        this.state.itemsPerPage
      )
    });
  };

  onPageSizeChange = itemsPerPage => {
    this.setState({
      itemsPerPage,
      allLicences: Subscriptions.getItemsBasedOnPagination(
        this.props.allLicences,
        this.state.pageNo,
        itemsPerPage
      )
    });
  };

  sortColumn = (sortBy, orderBy) => {
    const { allLicences } = this.props;
    const sortedLicences = _.orderBy(
      allLicences,
      [sortBy],
      [_.toLower(orderBy)]
    );
    this.setState({
      allLicences: Subscriptions.getItemsBasedOnPagination(
        sortedLicences,
        this.state.pageNo,
        this.state.itemsPerPage
      )
    });
  };

  openUsersModal = license => () => {
    this.setState({
      showAssignLicenceToUser: false,
      showUsersModal: true,
      assigningLicence: license
    });
  };

  goBackToUsersModal = () => {
    this.setState({
      showAssignLicenceToUser: false,
      showUsersModal: true
    });
  };

  closeUsersModal = () => {
    this.setState({
      selectedUser: null,
      showUsersModal: false,
      assigningLicence: null
    });
  };

  closeAssignLicenceToUserModal = () => {
    this.setState({
      selectedUser: null,
      showAssignLicenceToUser: false
    });
  };

  onUserSelect = user => {
    this.setState({
      showAssignLicenceToUser: true,
      showUsersModal: false,
      selectedUser: user
    });
  };

  assignLicence = () => {
    const { assigningLicence, selectedUser } = this.state;
    this.props.dispatch(
      UsermanagementActions.assignLicense(
        {
          ...(_.includes(assigningLicence.type_slug, "view")
            ? { omni_view_license: assigningLicence.id }
            : { omni_file_license: assigningLicence.id }),
          user_id: selectedUser.user_id
        },
        () => {
          Toast.success(
            `License has been assigned to ${_.get(
              selectedUser,
              "first_name",
              ""
            )} ${_.get(selectedUser, "last_name", "")}`
          );
          this.props.dispatch(UsermanagementActions.resetAllLicences());
          this.setState({ selectedUser: null, allLicences: null }, () => {
            this.props.dispatch(
              UsermanagementActions.getAllLicences(
                this.props.selectedCustomer.id
              )
            );
          });
        }
      )
    );
    this.setState({
      selectedUser: null,
      showAssignLicenceToUser: false
    });
  };

  render() {
    const { allLicences } = this.state;
    return (
      <React.Fragment>
        <TableHeader
          columns={TableColumns}
          style={{ marginTop: "10px" }}
          sortColumn={this.sortColumn}
        />
        <div key={uuidv4()}>
          {_.map(allLicences, licence => (
            <Row
              key={licence.id}
              className="maindashboard__list__item"
              style={{ cursor: "auto" }}
            >
              <Column
                width={getColumnWidth(TableColumnNames.APPLICATION)}
                className="maindashboard__list__item-text-bold"
              >
                {_.get(licence, "type_name", "")}
              </Column>
              <Column
                width={getColumnWidth(TableColumnNames.DURATION)}
                className="maindashboard__list__item-text"
              >
                {_.get(licence, "duration_name", "")}
              </Column>
              <Column
                width={getColumnWidth(TableColumnNames.EXPIRATION_DATE)}
                className="maindashboard__list__item-text"
              >
                {getFormattedDate(_.get(licence, "expired_date", ""))}
              </Column>
              <Column
                width={getColumnWidth(TableColumnNames.STATUS)}
                className="maindashboard__list__item-text"
              >
                {_.get(licence, "first_name", "") ? "Assigned" : "Unassigned"}
              </Column>
              <Column
                width={getColumnWidth(TableColumnNames.USER)}
                className="maindashboard__list__item-text"
              >
                {_.get(licence, "first_name", "") && (
                  <ImageLoader
                    style={{ marginRight: "5px" }}
                    type="circle"
                    width="20px"
                    height="20px"
                    path={licence.profile}
                  />
                )}
                {`${_.get(licence, "first_name", "")}  ${_.get(
                  licence,
                  "last_name",
                  ""
                )}`}
              </Column>
              <Column
                width={getColumnWidth(TableColumnNames.ACTIONS)}
                className="maindashboard__list__item-text maindashboard__list__item-text-link global__cursor-pointer"
                onClick={this.openUsersModal(licence)}
              >
                {_.get(licence, "first_name", "") ? "Remove" : "Assign"}
              </Column>
            </Row>
          ))}
        </div>
        {(_.get(this.props.allLicences, "length") || "") && (
          <Pagination
            containerStyle={
              _.get(allLicences, "length", 0) > 4
                ? { marginTop: "1%" }
                : { marginTop: "20%" }
            }
            total={_.get(this.props.allLicences, "length", 0)}
            showTotal={(total, range) =>
              translate("text.pagination", {
                top: range[0],
                bottom: range[1],
                total,
                type: translate("label.dashboard.customers")
              })
            }
            pageSize={this.state.itemsPerPage}
            current={this.state.pageNo}
            onPageChange={this.onPageChange}
            onPageSizeChange={this.onPageSizeChange}
          />
        )}
        {!_.get(allLicences, "length", 0) && (
          <Row className="maindashboard__nodata">
            <Icon
              style={{ fontSize: "20px" }}
              type="exclamation-circle"
              className="maindashboard__nodata-icon"
            />
            {translate("error.dashboard.notfound", {
              type: translate("text.customer.subslicences")
            })}
          </Row>
        )}
        {this.state.showUsersModal && (
          <AssignLicenceWithUsers
            licence={this.state.assigningLicence}
            selectedUser={this.state.selectedUser}
            closeModal={this.closeUsersModal}
            onUserSelect={this.onUserSelect}
          />
        )}
        <AssignLicence
          visible={this.state.showAssignLicenceToUser}
          licence={this.state.assigningLicence}
          user={this.state.selectedUser}
          closeModal={this.closeAssignLicenceToUserModal}
          back={this.goBackToUsersModal}
          submit={this.assignLicence}
        />
      </React.Fragment>
    );
  }
}

const getColumnWidth = _.memoize(name => {
  const col = _.find(TableColumns, col => col.name === name);
  return _.get(col, "width");
});

const Column = styled.div`
  width: ${props => props.width};
`;

const TableColumnNames = {
  APPLICATION: translate("label.dashboard.application"),
  DURATION: translate("label.licence.duration"),
  EXPIRATION_DATE: translate("label.licence.expirationdate"),
  STATUS: translate("label.user.status"),
  USER: translate("label.dashboard.user"),
  ACTIONS: translate("label.generic.actions")
};

const TableColumns = [
  {
    name: TableColumnNames.APPLICATION,
    key: "type_name",
    sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.DURATION,
    key: "duration",
    sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.EXPIRATION_DATE,
    key: "expired_date",
    sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.STATUS,
    key: "status",
    sort: true,
    width: "15%"
  },
  {
    name: TableColumnNames.USER,
    key: "first_name",
    sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.ACTIONS,
    width: "10%"
  }
];

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    allLicences: state.Usermanagement.allLicences,
    selectedCustomer: state.Customer.selectedCustomer
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Subscriptions);
