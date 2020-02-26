import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import DraggableModal from "./draggableModal.component";
import { isLoggedInOmniciaRole } from "../../../utils";
import { bindActionCreators } from "redux";
import { ApplicationActions, CustomerActions } from "../../../redux/actions";
import Text from "../text/text.component";
import { OmniButton } from "..";
import { translate } from "../../../translations/translator";
import { Tabs, Icon } from "antd";

const { TabPane } = Tabs;

class OpenSubmissionsModal extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    onItemSelected: PropTypes.func,
    onOpenSubmission: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      submissions: [],
      customers: [],
      selectedCustomer: "",
      selectedSubmission: "",
      activeTab: "1"
    };
  }

  fetchCustomers = () => {
    const { searchText } = this.state;
    this.props.actions.fetchCustomers(searchText || "");
  };

  static getDerivedStateFromProps(props, state) {
    if (
      _.get(props, "submissions.length") &&
      !_.get(state, "submissions.length")
    ) {
      const submissions = _.filter(props.submissions, ['is_uploading', false]);
      return {
        submissions: submissions
      };
    }
    if (_.get(props, "customers.length") && !_.get(state, "customers.length")) {
      return {
        customers: props.customers
      };
    }
    return null;
  }

  fetchApplications = () => {
    this.props.actions.resetApplications();
    this.setState({ submissions: [] });
    const { searchText } = this.state;
    const { selectedCustomer } = this.props;
    selectedCustomer &&
      this.props.actions.fetchApplications(
        selectedCustomer.id,
        searchText || ""
      );
  };

  componentDidMount() {
    this.setState({
      selectedSubmission: _.get(this.props, "selectedSubmission", ""),
      selectedCustomer: _.get(this.props, "selectedCustomer", "")
    });

    if (isLoggedInOmniciaRole(this.props.role)) {
      this.fetchCustomers();
    } else {
      const { user } = this.props;
      this.onCustomerSelected({ ...user.customer })();
      this.fetchApplications();
    }
  }

  onCustomerSelected = customer => () => {
    this.setState({ selectedCustomer: customer });
    this.props.actions.setSelectedCustomer(customer);
  };

  onItemSelected = submission => () => {
    this.setState({ selectedSubmission: submission });
    // this.props.dispatch(SubmissionActions.findSelectedResult(item));
    // this.props.onItemSelected && this.props.onItemSelected(item);
  };

  openSubmission = () => {
    const { selectedSubmission } = this.state;
    this.props.actions.setSelectedSubmission(selectedSubmission);
    this.props.onOpenSubmission && this.props.onOpenSubmission();
  };

  changeTab = activeKey => {
    this.setState(
      {
        activeTab: activeKey
      },
      () => {
        this.fetchApplications();
      }
    );
  };

  render() {
    const { visible, onClose, onOpenSubmission } = this.props;
    const {
      submissions,
      customers,
      selectedCustomer,
      selectedSubmission,
      activeTab
    } = this.state;
    console.log(
      this.props,
      this.state,
      submissions,
      selectedCustomer,
      selectedSubmission,
      "thi.state"
    );
    return (
      <div className="open-submissions-modal">
        <div className="open-submissions-modal__header">
          <img class="open-folder" src="/images/open-folder.svg" />
          <Text
            type="regular"
            size="16px"
            text={translate("label.submissions.open")}
          />
          <img
            src="/images/close.svg"
            className="assign-permissions-modal__header-close"
            onClick={onClose}
          />
        </div>
        <div className="open-submissions-modal__tabs">
          <Tabs activeKey={activeTab} onChange={this.changeTab}>
            <TabPane tab={translate("label.submissions.recent")} key="1">
              <div className="open-submissions-moda__tabs__table">
                <div className="open-submissions-modal__tabs__table__body">
                  <table>
                    <tbody>
                      {submissions && submissions.length ? (
                        _.map(submissions, (submission, idx) => {
                          return (
                            <tr
                              key={idx}
                              className={`global__cursor-pointer ${selectedSubmission.id ===
                                submission.id && "global__node-selected"}`}
                              onClick={this.onItemSelected(submission)}
                              key={submission.id}
                            >
                              <td className="">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center"
                                  }}
                                >
                                  <Icon
                                    type="folder"
                                    theme="filled"
                                    className="global__file-folder"
                                  />
                                  <Text
                                    type="regular"
                                    size="14px"
                                    text={submission.name}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="no_validation_sequences">
                          No Submissions Found
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabPane>
            <TabPane tab={translate("label.submissions.customers")} key="2">
              <div className="open-submissions-moda__tabs__table">
                <div className="open-submissions-modal__tabs__table__body">
                  <table>
                    <tbody>
                      {customers && customers.length ? (
                        _.map(customers, (customer, idx) => {
                          return (
                            <tr
                              key={idx}
                              className={`global__cursor-pointer ${selectedCustomer.id ===
                                customer.id && "global__node-selected"}`}
                              onClick={this.onCustomerSelected(customer)}
                              key={customer.id}
                            >
                              <td className="">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center"
                                  }}
                                >
                                  <Icon
                                    type="folder"
                                    theme="filled"
                                    className="global__file-folder"
                                  />
                                  <Text
                                    type="regular"
                                    size="14px"
                                    text={customer.company_name}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="no_validation_sequences">
                          No Customers Found
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>

        <div className="open-submissions-modal__footer">
          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <OmniButton
              type="secondary"
              label="Cancel"
              onClick={onClose}
              buttonStyle={{ width: "80px", marginRight: "12px" }}
            />
            <OmniButton
              label="Open"
              buttonStyle={{ width: "80px" }}
              onClick={
                activeTab == "1" ? this.openSubmission : () => this.changeTab("1")
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    role: state.Login.role,
    user: state.Login.user,
    submissions: state.Application.submissions,
    customers: state.Customer.customers,
    selectedCustomer: state.Customer.selectedCustomer,
    selectedSubmission: state.Application.selectedSubmission
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      { ...ApplicationActions, ...CustomerActions },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OpenSubmissionsModal);
