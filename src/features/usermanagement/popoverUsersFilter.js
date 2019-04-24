import React, { Component } from "react";
import UsersFilter from "./usersFilter.component";
import _ from "lodash";
import { connect } from "react-redux";
import styled from "styled-components";
import { Popover } from "antd";
import { UsermanagementActions } from "../../redux/actions";
import { translate } from "../../translations/translator";
import { ROLES } from "../../constants";

const initialFiltersState = {
  selectedSortBy: "",
  selectedRoles: [],
  selectedDepts: []
};
let clonedFiltersState = _.cloneDeep(initialFiltersState);

class PopoverUsersFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      filters: _.cloneDeep(clonedFiltersState)
    };
  }

  componentDidMount() {
    this.props.dispatch(UsermanagementActions.getDepartments());
  }

  onRoleChange = checkedValues => {
    this.setState({
      filters: { ...this.state.filters, selectedRoles: checkedValues }
    });
  };

  onDeptChange = checkedValues => {
    this.setState({
      filters: { ...this.state.filters, selectedDepts: checkedValues }
    });
  };

  onSortChange = sortBy => {
    this.setState({
      filters: { ...this.state.filters, selectedSortBy: sortBy }
    });
  };

  reset = () => {
    this.setState({ filters: _.cloneDeep(initialFiltersState) });
  };

  cancel = () => {
    this.setState({ filters: _.cloneDeep(clonedFiltersState) });
    this.closePopover();
  };

  openPopover = () => {
    if (this.state.visible) {
      this.cancel();
      return;
    }
    this.setState({ visible: true });
  };

  closePopover = () => {
    this.setState({ visible: false });
  };

  update = () => {
    clonedFiltersState = _.cloneDeep(this.state.filters);
    this.props.onFiltersUpdate &&
      this.props.onFiltersUpdate(this.state.filters);
    this.closePopover();
  };

  render() {
    const {
      visible,
      filters: { selectedRoles, selectedDepts, selectedSortBy }
    } = this.state;
    const { departments, selectedCustomer } = this.props;
    const roles = _.get(selectedCustomer, "is_omnicia", false)
      ? ROLES.OMNICIA
      : ROLES.CUSTOMER;
    const checkboxRoles = _.map(roles, r => ({
      label: r.name,
      value: r.id
    }));
    const checkboxDepts = _.map(departments, dept => ({
      ...dept,
      label: dept.name,
      value: dept.id
    }));

    const resetDisabled = _.isEqual(this.state.filters, initialFiltersState);

    return (
      <Popover
        content={
          <UsersFilter
            roles={checkboxRoles}
            selectedSortBy={selectedSortBy}
            selectedRoles={selectedRoles}
            selectedDepts={selectedDepts}
            resetDisabled={resetDisabled}
            departments={checkboxDepts}
            reset={this.reset}
            cancel={this.cancel}
            update={this.update}
            onSortChange={this.onSortChange}
            onRoleChange={this.onRoleChange}
            onDeptChange={this.onDeptChange}
          />
        }
        visible={visible}
        overlayStyle={{ width: "400px", padding: "10px" }}
      >
        <Image
          src={`/images/filter${resetDisabled ? ".svg" : "-active.svg"}`}
          onClick={this.openPopover}
          style={{
            borderColor: resetDisabled ? "rgba(74, 74, 74, 0.25)" : "#00a0ff"
          }}
        />
        <span style={{ marginLeft: "16px" }}>{`${translate(
          "label.filter.filters"
        )}: ${
          resetDisabled
            ? translate("label.switch.off")
            : translate("label.switch.on")
        }`}</span>
      </Popover>
    );
  }
}

const Image = styled.img`
  cursor: pointer;
  padding: 9px;
  border-radius: 4px;
  border: solid 1px rgba(74, 74, 74, 0.25);
`;

function mapStateToProps(state) {
  return {
    departments: state.Usermanagement.departments,
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
)(PopoverUsersFilter);
