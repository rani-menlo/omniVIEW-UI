import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import _ from "lodash";
import Loader from "../../uikit/components/loader";
import Header from "../header/header.component";
import {
  SubHeader,
  SearchBox,
  ContentLayout,
  OmniButton,
  DeactivateModal
} from "../../uikit/components";
import { DEBOUNCE_TIME } from "../../constants";
import { UsermanagementActions } from "../../redux/actions";
import { Avatar } from "antd";

class UserManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      showDeactivateModal: false,
      selectedUser: null
    };
    this.searchUsers = _.debounce(this.searchUsers, DEBOUNCE_TIME);
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = () => {
    const { selectedCustomer } = this.props;
    selectedCustomer &&
      this.props.dispatch(
        UsermanagementActions.fetchUsers(
          selectedCustomer.id,
          this.state.searchText
        )
      );
  };

  handleSearch = e => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchUsers();
    }
  };

  searchUsers = () => {
    this.fetchUsers();
  };

  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchUsers();
  };

  getLabel = key => {
    if (_.includes(key, "admin")) {
      return "Administrators";
    } else if (_.includes(key, "publisher")) {
      return "Publishers";
    } else {
      return "Authors";
    }
  };

  openAdduser = () => {
    this.props.history.push("/usermanagement/add");
  };

  editUser = usr => () => {
    this.props.dispatch(UsermanagementActions.setSelectedUser(usr));
    this.props.history.push("/usermanagement/edit");
  };

  closeModal = () => {
    this.setState({ showDeactivateModal: false });
  };

  deactivate = () => {
    const { selectedCustomer } = this.props;
    this.props.dispatch(
      UsermanagementActions.deactivateUser(
        { userId: this.state.selectedUser.user_id, is_active: 0 },
        selectedCustomer.id,
        this.state.searchText
      )
    );
    this.closeModal();
  };

  openModal = usr => () => {
    const isActive = _.get(usr, "is_active", false);
    isActive && this.setState({ showDeactivateModal: true, selectedUser: usr });
  };

  render() {
    const { searchText } = this.state;
    const { loading, users, selectedCustomer } = this.props;
    if (!selectedCustomer) {
      return <Redirect to="/customers" />;
    }
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          <div style={{ marginLeft: "auto" }}>
            <SearchBox
              placeholder="Search Users..."
              searchText={searchText}
              clearSearch={this.clearSearch}
              onChange={this.handleSearch}
            />
          </div>
        </SubHeader>
        <ContentLayout className="userManagement">
          <div className="userManagement__header">
            User Management
            <OmniButton
              type="add"
              label="Add New User"
              className="userManagement__header-addButton"
              onClick={this.openAdduser}
            />
          </div>
          {_.map(users, (user, key) => {
            return (
              <div key={key} className="userManagement__group">
                <p className="userManagement__group-label">
                  {this.getLabel(key)}
                </p>
                <div className="userManagement__group__users">
                  {_.map(user, usr => {
                    const isActive = _.get(usr, "is_active", false);
                    return (
                      <div
                        key={usr.user_id}
                        className="userManagement__group__users__user"
                      >
                        <Avatar size={48} icon="user" />
                        <div className="userManagement__group__users__user__info">
                          <p className="userManagement__group__users__user__info-name">{`${_.get(
                            usr,
                            "first_name",
                            ""
                          )} ${_.get(usr, "last_name", "")}`}</p>
                          <p className="userManagement__group__users__user__info-text">
                            Department: {_.get(usr, "department_name", "")}
                          </p>
                          <p className="userManagement__group__users__user__info-text">
                            Subscription Status:
                            <span
                              className={`userManagement__group__users__user__info-text-${
                                isActive ? "active" : "inactive"
                              }`}
                            >
                              {isActive ? " Active" : " Inactive"}
                            </span>
                          </p>
                          <p className="userManagement__group__users__user__info-text">
                            {isActive ? "Expires" : "Expired"}
                            {_.get(usr, "expire")}
                          </p>
                          <p className="userManagement__group__users__user__info-text">
                            {_.get(usr, "email", "")}
                          </p>
                          <div className="global__center-vert">
                            <p
                              className="userManagement__group__users__user__info-link"
                              onClick={this.editUser(usr)}
                            >
                              Edit
                            </p>
                            <div className="userManagement__group__users__user__info-dot" />
                            <p className="userManagement__group__users__user__info-link">
                              Assign License
                            </p>
                            <div className="userManagement__group__users__user__info-dot" />
                            <p
                              className="userManagement__group__users__user__info-link"
                              onClick={this.openModal(usr)}
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <DeactivateModal
            visible={this.state.showDeactivateModal}
            title="Deactivate Account?"
            content="This user will no longer be able to access the system until an
            Omnicia administrator enables their account again. Any remaining
            time from the assigned subscription license can be applied to
            another user within 30 days."
            closeModal={this.closeModal}
            deactivate={this.deactivate}
          />
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    selectedCustomer: state.Customer.selectedCustomer,
    users: state.Usermanagement.users
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
)(UserManagementContainer);