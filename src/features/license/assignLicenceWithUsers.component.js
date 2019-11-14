import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import { Modal, Checkbox, Icon } from "antd";
import { UsermanagementActions } from "../../redux/actions";
import { ROLE_IDS } from "../../constants";
import {
  IconText,
  Text,
  ImageLoader,
  OmniButton,
  Row
} from "../../uikit/components";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";

class AssignLicenceWithUsers extends Component {
  static propTypes = {
    licence: PropTypes.object,
    selectedUsers: PropTypes.arrayOf(PropTypes.object),
    closeModal: PropTypes.func,
    onUserSelect: PropTypes.func,
    multiSelection: PropTypes.bool
  };

  static defaultProps = {
    multiSelection: true
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: new Set()
    };
  }

  componentDidMount() {
    const { selectedCustomer, selectedUsers } = this.props;
    selectedUsers &&
      this.setState({ selected: new Set(_.map(selectedUsers, "user_id")) });
      if(selectedCustomer.is_omnicia == true) {
        this.props.dispatch(
          UsermanagementActions.fetchUsers({
            customerId: this.props.selectedCustomer.id,
            roles: _.values(ROLE_IDS.OMNICIA) 
          })
        ); 
      } else {
        this.props.dispatch(
          UsermanagementActions.fetchUsers({
            customerId: selectedCustomer.id,
            roles: _.values(ROLE_IDS.CUSTOMER)
          })
        );
      }

  }

  select = user => () => {
    const { selected } = this.state;
    const { multiSelection } = this.props;
    if (selected.has(user.user_id)) {
      selected.delete(user.user_id);
    } else {
      multiSelection && selected.add(user.user_id);
      if (!multiSelection) {
        selected.clear();
        selected.add(user.user_id);
      }
    }
    this.setState({ selected });
  };

  next = () => {
    const users = _.map([...this.state.selected], userId => {
      return _.find(this.props.users, { user_id: userId });
    });
    this.props.onUserSelect && this.props.onUserSelect(users);
  };

  render() {
    const { licence, users, closeModal, multiSelection } = this.props;
    return (
      <Modal
        destroyOnClose
        visible={true}
        closable={false}
        footer={null}
        wrapClassName="licence-modal"
      >
        <div
          className="licence-modal__header"
          style={{ marginBottom: "unset" }}
        >
          <Text
            type="extra_bold"
            size="16px"
            text={`${translate("label.generic.assign")} ${_.get(
              licence,
              "licenceType",
              ""
            ) || _.get(licence, "type_name", "")} - ${_.get(
              licence,
              "name",
              ""
            ) || _.get(licence, "duration_name", "")}`}
          />
          <img
            src="/images/close.svg"
            className="licence-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <Text
          type="regular"
          size="14px"
          opacity={0.5}
          text={translate("text.licence.chooseuser")}
        />
        {/* <div style={{ marginBottom: "15px", textAlign: "right" }}>
          <IconText
            text={translate("label.licence.expirationdate")}
            image="/images/sort-result.svg"
            imageStyle={{ width: "12px", height: "12px" }}
            onClick={this.orderByExpireDate}
          />
        </div> */}

        {(_.get(users, "length") || "") && (
          <div className="licence-modal__content" style={{ marginTop: "15px" }}>
            {_.map(users, user => {
              return (
                <div
                  key={user.user_id}
                  className={`licence-modal__content__row global__cursor-pointer ${this.state.selected.has(
                    user.user_id
                  ) && "licence-modal__content__row-selected"}`}
                  style={{ justifyContent: "unset" }}
                  onClick={this.select(user)}
                >
                  <ImageLoader
                    type="circle"
                    width="40px"
                    height="40px"
                    path={user.profile}
                  />
                  <div style={{ marginLeft: "8px" }}>
                    <Text
                      type="bold"
                      size="14px"
                      text={`${_.get(user, "first_name", "")} ${_.get(
                        user,
                        "last_name",
                        ""
                      )}`}
                    />
                    <Text
                      type="regular"
                      size="14px"
                      opacity={0.75}
                      className={`global__text-${
                        _.get(user, "license_status", 0) ? "green" : "red"
                      }`}
                      text={
                        _.get(user, "license_status", 0)
                          ? translate("label.user.active")
                          : translate("label.user.inactive")
                      }
                      textStyle={{ display: "inline" }}
                    />
                    <Text
                      type="regular"
                      size="14px"
                      opacity={0.75}
                      text={`${(_.get(user, "license_status", 0) || "") &&
                        ` - License ${translate(
                          "label.usermgmt.expires"
                        )}`} ${getFormattedDate(_.get(user, "expiryDate"))}`}
                      textStyle={{ display: "inline" }}
                    />
                  </div>
                  <Checkbox
                    checked={this.state.selected.has(user.user_id)}
                    style={{ marginLeft: "auto" }}
                  />
                </div>
              );
            })}
          </div>
        )}
        {!(_.get(users, "length") || "") && (
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
        {multiSelection &&
          _.get(this.state, "selected.size", 0) >
            _.get(licence, "licences.length", 0) && (
            <p
              className="global__field__error-text"
              style={{ marginTop: "10px" }}
            >
              {translate("error.licence.choosenmax")}
            </p>
          )}
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            onClick={closeModal}
            buttonStyle={{ width: "120px", marginRight: "12px" }}
          />
          <OmniButton
            disabled={
              _.get(this.state, "selected.size", 0) === 0 ||
              (multiSelection &&
                _.get(this.state, "selected.size", 0) >
                  _.get(licence, "licences.length", 0))
            }
            label={translate("label.pagination.next")}
            buttonStyle={{ width: "120px", marginRight: "10px" }}
            onClick={this.next}
          />
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    users: state.Usermanagement.users,
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
)(AssignLicenceWithUsers);
