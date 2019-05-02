import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import PopoverUsersFilter from "../usermanagement/popoverUsersFilter";
import { Avatar } from "antd";
import { Text, SearchBox } from "../../uikit/components";
import { translate } from "../../translations/translator";
import { getRoleName } from "../../utils";

class SubmissionViewUsers extends Component {
  constructor(props) {
    super(props);
    this.filters = "";
    this.state = {
      serachText: ""
    };
  }

  static propTypes = {
    selectedUser: PropTypes.object,
    onUserSelected: PropTypes.func
  };

  onFiltersUpdate = filters => {
    this.filters = filters;
    this.searchUsers();
  };

  searchUsers = () => {
    this.props.searchUsers &&
      this.props.searchUsers({
        ...this.filters,
        search: this.state.searchText
      });
  };

  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchUsers();
  };

  handleSearch = e => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchUsers();
    }
  };

  setSelectedUser = user => () => {
    this.props.onUserSelected && this.props.onUserSelected(user);
  };

  render() {
    const { searchText } = this.state;
    const { selectedUser } = this.props;
    return (
      <div className="submissionViewUsers">
        <div className="submissionViewUsers__filters">
          <PopoverUsersFilter
            placement="left"
            onFiltersUpdate={this.onFiltersUpdate}
            imageClassName="submissionViewUsers__filters-image"
          />
        </div>
        <SearchBox
          className="submissionViewUsers__searchbox"
          placeholder={translate("text.header.search", {
            type: translate("label.dashboard.users")
          })}
          searchText={searchText}
          clearSearch={this.clearSearch}
          onChange={this.handleSearch}
        />
        <div className="submissionViewUsers__users">
          {_.map(this.props.users, user => (
            <div
              className={`submissionViewUsers__users__user ${
                selectedUser === user
                  ? "submissionViewUsers__users__user-selected"
                  : ""
              }`}
              onClick={this.setSelectedUser(user)}
            >
              <Avatar size="small" icon="user" size={35} />
              <div className="submissionViewUsers__users__user__info">
                <Text
                  type="regular"
                  text={`${_.get(user, "first_name", "")} ${_.get(
                    user,
                    "last_name",
                    ""
                  )}`}
                  size="14px"
                />
                <Text
                  type="regualr"
                  text={`${getRoleName(_.get(user, "role_name", ""))} - ${_.get(
                    user,
                    "department_name",
                    ""
                  )}`}
                  opacity={0.75}
                  size="14px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default SubmissionViewUsers;
