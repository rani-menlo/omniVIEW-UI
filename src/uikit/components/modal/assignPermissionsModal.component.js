import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";
import { Modal, Dropdown, Icon, Menu, Avatar } from "antd";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";
import { ROLES, ROLE_IDS } from "../../../constants";
import PermissionCheckbox from "../checkbox/permissionCheckbox.component";
import { UsermanagementActions } from "../../../redux/actions";
import { Loader, OmniButton, ImageLoader } from "..";
import { getRoleNameByRoleId, getRoleName, isAdmin } from "../../../utils";
import submissionActions from "../../../redux/actions/submission.actions";
import Row from "../row/row.component";

class AssignPermissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      selectedRole: "",
      order: "asc",
      noUsersError: false
    };
  }

  componentDidMount() {
    const {
      submissions,
      selectedCustomer,
      fileLevelAccessObj,
      assignGlobalPermissions
    } = this.props;
    if (fileLevelAccessObj) {
      this.props.dispatch(
        UsermanagementActions.fetchUsersOfFiles(
          selectedCustomer.id,
          fileLevelAccessObj.fileIds
        )
      );
    } else {
      const submissionIds = _.map(submissions, submission => submission.id);
      if (assignGlobalPermissions) {
        this.props.dispatch(
          UsermanagementActions.fetchUsers({
            customerId: selectedCustomer.id
          })
        );
        return;
      }
      this.props.dispatch(
        UsermanagementActions.fetchUsersOfSubmissions(
          selectedCustomer.id,
          submissionIds
        )
      );
    }
  }

  static getMainUsers = props => {
    return props.assignGlobalPermissions
      ? props.users
      : props.usersOfFileOrSubmission;
  };

  static getDerivedStateFromProps(props, state) {
    const usersList = AssignPermissions.getMainUsers(props);
    if (usersList.length && !state.users.length) {
      let roles = _.map(ROLES.CUSTOMER, role => {
        const newRole = { ...role };
        newRole.name = getRoleName(newRole.name, true);
        return newRole;
      });
      roles = [
        {
          id: -1,
          name: `${translate("label.generic.all")} ${translate(
            "label.dashboard.users"
          )}`
        }
      ].concat(roles);
      return {
        users: _.orderBy(
          _.map(usersList, user => {
            user.mutated = false;
            user.checked = props.assignGlobalPermissions
              ? user.has_global_access
              : user.hasAccess;
            return user;
          }),
          ["first_name"]
        ),
        roles,
        selectedRole: roles[0]
      };
    }
    return null;
  }

  static propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    closeModal: PropTypes.func,
    assignGlobalPermissions: PropTypes.bool,
    submissions: PropTypes.arrayOf([PropTypes.object]),
    fileLevelAccessObj: PropTypes.object
  };

  getMenu = () => {
    return (
      <Menu selectedKeys={[`${this.state.selectedRole.id}`]}>
        {_.map(this.state.roles, role => (
          <Menu.Item key={role.id} onClick={this.onMenuClick(role)}>
            {role.name}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  onMenuClick = role => e => {
    let users = [...AssignPermissions.getMainUsers(this.props)];
    users =
      role.id == -1
        ? users
        : _.filter(
            users,
            usr =>
              (_.get(usr, "roles[0].id") || _.get(usr, "role_id")) === role.id
          );
    users = _.orderBy(users, ["first_name"], [this.state.order]);
    if (users.length) {
      this.setState({ users, selectedRole: role, noUsersError: false });
      return;
    }
    this.setState({ noUsersError: true, selectedRole: role });
  };

  onCheckboxChange = user => e => {
    const checked = e.target.checked;
    const users = [...this.state.users];
    user.checked = checked;
    user.mutated = true;
    this.setState({ users });
  };

  update = () => {
    const granted_user_ids = [];
    const revoked_user_ids = [];
    _.map(AssignPermissions.getMainUsers(this.props), user => {
      if (user.mutated) {
        if (user.checked) {
          granted_user_ids.push(user.id || user.user_id);
        } else {
          revoked_user_ids.push(user.id || user.user_id);
        }
      }
    });
    if (granted_user_ids.length || revoked_user_ids.length) {
      if (this.props.fileLevelAccessObj) {
        this.props.dispatch(
          submissionActions.assignFolderPermissions({
            granted_user_ids,
            revoked_user_ids,
            file_ids: this.props.fileLevelAccessObj.fileIds
          })
        );
      } else {
        if (this.props.assignGlobalPermissions) {
          this.props.dispatch(
            submissionActions.assignGlobalPermissions({
              granted_user_ids,
              revoked_user_ids
            })
          );
        } else {
          const submission_ids = _.map(
            this.props.submissions,
            submission => submission.id
          );
          this.props.dispatch(
            submissionActions.assignSubmissionPermissions({
              granted_user_ids,
              revoked_user_ids,
              submission_ids
            })
          );
        }
      }
      this.props.closeModal && this.props.closeModal();
    }
  };

  sort = () => {
    let { order } = this.state;
    order = order === "asc" ? "desc" : "asc";
    const users = _.orderBy(
      this.state.users,
      user => {
        return _.toLower(user.first_name);
      },
      [order]
    );
    this.setState({ users, order });
  };

  render() {
    const {
      visible,
      closeModal,
      assignGlobalPermissions,
      submissions,
      fileLevelAccessObj
    } = this.props;
    return (
      <Modal
        destroyOnClose
        visible={visible}
        closable={false}
        footer={null}
        wrapClassName="assign-permissions-modal"
      >
        <div className="assign-permissions-modal__header">
          <img
            src={`/images/${
              assignGlobalPermissions ? "global-permissions" : "assign"
            }.svg`}
            style={{ marginRight: "8px" }}
          />
          <Text
            type="extra_bold"
            size="16px"
            text={
              assignGlobalPermissions
                ? translate("label.dashboard.assignglobalpermissions")
                : translate("label.dashboard.assignpermissions")
            }
          />
          <img
            src="/images/close.svg"
            className="assign-permissions-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <Text
          type="regular"
          opacity={0.5}
          size="14px"
          text={
            assignGlobalPermissions
              ? translate("text.permissions.global")
              : fileLevelAccessObj
              ? translate("text.permissions.filelevel")
              : translate("text.permissions.individual")
          }
        />
        <div className="assign-permissions-modal__columns">
          {!assignGlobalPermissions && (
            <div className="assign-permissions-modal__columns-left">
              <Text
                type="bold"
                opacity={0.5}
                size="14px"
                text={`Assigning to:`}
              />
              <div
                className="assign-permissions-modal__columns-content"
                style={{ marginTop: "12px" }}
              >
                {fileLevelAccessObj ? (
                  <div className="assign-permissions-modal__columns-content-item global__center-vert">
                    {fileLevelAccessObj.isFolder ? (
                      <Icon
                        type="folder"
                        theme="filled"
                        className="global__file-folder"
                      />
                    ) : (
                      <img
                        src="/images/file-new.svg"
                        className="global__file-folder"
                        style={{ width: "18px", height: "21px" }}
                      />
                    )}
                    <Text
                      type="medium"
                      size="14px"
                      text={fileLevelAccessObj.label}
                    />
                  </div>
                ) : (
                  _.map(submissions, submission => (
                    <Text
                      key={submission.id}
                      type="medium"
                      size="14px"
                      text={submission.name}
                      className="assign-permissions-modal__columns-content-item"
                    />
                  ))
                )}
              </div>
            </div>
          )}
          <div className="assign-permissions-modal__columns-right">
            <div className="assign-permissions-modal__subheader">
              <Dropdown
                overlay={this.getMenu}
                trigger={["click"]}
                className="assign-permissions-modal__subheader__dropdown"
              >
                <div>
                  <Text
                    type="bold"
                    opacity={0.5}
                    textStyle={{ marginRight: "4px" }}
                    size="14px"
                    text={`${translate("label.generic.view")}:`}
                  />
                  <Text
                    type="extra_bold"
                    opacity={0.5}
                    textStyle={{ marginRight: "4px" }}
                    size="14px"
                    text={this.state.selectedRole.name}
                  />
                  <Icon type="down" />
                </div>
              </Dropdown>
              <Icon
                type={
                  this.state.order === "asc"
                    ? "sort-ascending"
                    : "sort-descending"
                }
                onClick={this.sort}
                style={{ fontSize: "24px", marginRight: "10px" }}
              />
            </div>
            <div className="assign-permissions-modal__columns-content">
              {!this.state.noUsersError &&
                _.map(this.state.users, user => {
                  return (
                    <div
                      key={user.id}
                      className={`assign-permissions-modal__columns-content-user ${user.checked &&
                        "assign-permissions-modal__columns-content-user-selected"}`}
                    >
                      <ImageLoader
                        path={_.get(user, "profile")}
                        width="36px"
                        height="36px"
                        type="circle"
                        style={{ marginRight: "10px" }}
                        globalAccess={_.get(user, "has_global_access")}
                      />
                      {/* <Avatar size={36} icon="user" /> */}
                      <div>
                        <Text
                          type="regular"
                          size="14px"
                          text={`${user.first_name} ${user.last_name}`}
                        />
                        <Text
                          type="regular"
                          size="14px"
                          opacity={0.5}
                          text={_.capitalize(
                            getRoleNameByRoleId(
                              _.get(user, "roles[0].id") ||
                                _.get(user, "role_id")
                            )
                          )}
                        />
                      </div>
                      <Text
                        type="regular"
                        size="14px"
                        opacity={0.5}
                        text={
                          (assignGlobalPermissions
                            ? user.has_global_access
                            : user.hasAccess) && user.checked
                            ? translate("label.generic.assigned")
                            : ""
                        }
                        textStyle={{ marginLeft: "auto", marginRight: "10px" }}
                      />
                      <PermissionCheckbox
                        disabled={isAdmin(
                          _.get(user, "roles[0].slug") ||
                            _.get(user, "role_name")
                        )}
                        value={+user.checked}
                        onChange={this.onCheckboxChange(user)}
                      />
                    </div>
                  );
                })}
              {this.state.noUsersError && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("label.dashboard.users")
                  })}
                </Row>
              )}
            </div>
          </div>
          <div />
        </div>
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label="Cancel"
            onClick={closeModal}
            buttonStyle={{ width: "120px", marginRight: "12px" }}
          />
          <OmniButton
            label="Update"
            buttonStyle={{ width: "120px" }}
            onClick={this.update}
          />
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedCustomer: state.Customer.selectedCustomer,
    users: state.Usermanagement.users,
    usersOfFileOrSubmission: state.Usermanagement.usersOfFileOrSubmission
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
)(AssignPermissions);
