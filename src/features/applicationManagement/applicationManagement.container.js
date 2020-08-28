import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  CustomerActions,
  ApplicationActions,
  SubmissionActions,
  ApiActions,
} from "../../redux/actions";
import Header from "../header/header.component";
import {
  Loader,
  ContentLayout,
  Row,
  Text,
  SubHeader,
  TableHeader,
  Pagination,
  SelectField,
  Toast,
} from "../../uikit/components";
import { Popover, Switch, Icon, Menu } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import PopoverCustomers from "../usermanagement/popoverCustomers.component";
import { isLoggedInOmniciaAdmin, getFormattedDate, isToday } from "../../utils";
import {
  get,
  find,
  memoize,
  map,
  filter,
  every,
  set,
  sortBy,
} from "lodash";
import styled from "styled-components";
import { translate } from "../../translations/translator";
import { ApplicationApi } from "../../redux/api";

class ApplicationManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      limit: 5,
      submissionSequnces: [],
      sequences: [],
      checkedSequences: [],
      selectedUploadedCustomer: this.props.selectedUploadedCustomer,
      bulkUploadedSubmissions: [],
      allSubmissionSequences: [],
      selectedSubmission: this.props.selectedSubmission,
      selectedSequence: this.props.selectedSequence,
      TableColumns: [
        {
          name: TableColumnNames.CUSTOMER,
          key: 1,
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.APPLICATION,
          key: 2,
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.SEQUENCE,
          key: 3,
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.WIP,
          key: 4,
          width: "20%",
          toggle: true,
          allViewable: false,
          onStatusClick: this.checkAll,
        },
        {
          name: TableColumnNames.LASTUPDATED,
          key: 5,
          sort: true,
          width: "20%",
        },
        // TODO - This will use it in the next sprint so commented this piece of code
        // {
        //   name: "",
        //   key: "",
        //   width: "5%",
        // },
      ],
    };
  }

  /**
   * Fetch sequences per each submission
   */
  fetchAppSequences = (sortByColumnId = 5, order = "DESC") => {
    this.props.dispatch(SubmissionActions.resetApplicationSequences());
    this.setState({ submissionSequnces: [] });
    const {
      pageNo,
      limit,
      selectedSubmission,
      selectedSequence,
      TableColumns,
      selectedUploadedCustomer,
    } = this.state;
    let submissionId =
      selectedSubmission.submissionId || selectedSubmission.id || 0;
    let sequenceId = get(selectedSequence, "id", 0);
    this.props.dispatch(
      SubmissionActions.fetchSubmissionSequences(
        {
          submissionId: Number(submissionId),
          pageNo: Number(pageNo),
          limit: Number(limit),
          sortByColumnId: sortByColumnId,
          order: order,
          sequenceId: Number(sequenceId),
          customerId: Number(selectedUploadedCustomer.id),
        },
        () => {
          let sequences = [...this.props.submissionSequnces];
          filter(sequences, (seq) => {
            return seq.id !== 0;
          });
          TableColumns[3].allViewable = sequences.length
            ? every(sequences, ["isWIP", true])
            : false;
          this.setState({ TableColumns });
        }
      )
    );
  };

  static getDerivedStateFromProps(props, state) {
    if (
      get(props, "submissionSequnces.length") &&
      !get(state, "submissionSequnces.length")
    ) {
      return {
        submissionSequnces: [...props.submissionSequnces],
      };
    }
    if (
      get(props, "allSubmissionSequences.length") &&
      !get(state, "allSubmissionSequences.length")
    ) {
      let allSubmissionSequences = [...props.allSubmissionSequences];
      //Adding key and values to the sequences to set in the Select field
      map(allSubmissionSequences, (seq) => {
        seq.key = seq.id;
        seq.value = seq.sequence;
      });

      allSubmissionSequences = sortBy(allSubmissionSequences, (seq) => {
        return seq.sequence !== "All" && seq.sequence;
      });

      return {
        allSubmissionSequences: allSubmissionSequences,
      };
    }
    if (
      get(props, "bulkUploadedSubmissions.length") &&
      !get(state, "bulkUploadedSubmissions.length")
    ) {
      let bulkUploadedSubmissions = [...props.bulkUploadedSubmissions];
      //filtering submissions without errors
      bulkUploadedSubmissions = filter(bulkUploadedSubmissions, [
        "errorCount",
        0,
      ]);
      //Adding key and values to the submissions to set in the Select field
      map(bulkUploadedSubmissions, (submission) => {
        submission.key = submission.submissionId;
        submission.value = submission.name;
      });
      return {
        bulkUploadedSubmissions: [
          { submissionId: 0, key: 0, name: "All", value: "All" },
          ...bulkUploadedSubmissions,
        ],
      };
    }
    return null;
  }

  fetchAppAllSequences(sortByColumnId = 5, order = "DESC") {
    this.props.dispatch(SubmissionActions.resetSubmissionSequencecs());
    this.setState({ allSubmissionSequences: [] });
    const {
      pageNo,
      limit,
      selectedSubmission,
      selectedSequence,
      TableColumns,
      selectedUploadedCustomer,
    } = this.state;
    let submissionId =
      selectedSubmission.submissionId || selectedSubmission.id || 0;
    let sequenceId = get(selectedSequence, "id", 0);
    this.props.dispatch(
      SubmissionActions.fetchSubmissionSequencesWithoutLimit(
        {
          submissionId: Number(submissionId),
          pageNo: Number(pageNo),
          limit: Number(selectedSubmission.seqCount),
          sortByColumnId: sortByColumnId,
          order: order,
          sequenceId: Number(sequenceId),
          customerId: Number(selectedUploadedCustomer.id),
        },
        () => {
          const selectedSequence = {
            id: 0,
            name: "All",
            key: 0,
            value: "All",
          };
          this.setState({ selectedSequence }, () => {
            this.props.dispatch(
              SubmissionActions.setSelectedSequence(selectedSequence)
            );
          });
        }
      )
    );
  }

  /**
   * Fetching applications for the selected customer
   * @param {*} sortBy
   * @param {*} orderBy
   */
  fetchingBulkuploadedApplications = (sortByColumnId = 2, orderBy = "ASC") => {
    this.props.dispatch(ApplicationActions.resetbulkUploadedSubmissions());
    this.setState({ bulkUploadedSubmissions: [] });
    let postObj = {
      limit: Number(this.props.bulkUploadedSubmissionsCount),
      page: 1,
      order: orderBy,
      sortByColumnId: Number(sortByColumnId),
      customerId: Number(get(this.state.selectedUploadedCustomer, "id", 0)),
    };
    this.props.dispatch(
      ApplicationActions.fetchBulkUploadedApplications(postObj)
    );
  };

  componentDidMount() {
    let { selectedSubmission } = this.state;
    selectedSubmission.key = selectedSubmission.submissionId;
    selectedSubmission.value = selectedSubmission.name;
    this.fetchingBulkuploadedApplications();
    this.setState({ selectedSubmission }, () => {
      this.fetchAppSequences();
      this.fetchAppAllSequences();
    });
  }

  /**
   * get each column width
   */
  getColumnWidth = memoize((name) => {
    const col = find(this.state.TableColumns, (column) => column.name === name);
    return get(col, "width");
  });

  /**
   * On customer selection in the subheader
   * @param {*} customer
   */
  onCustomerSelected = (customer) => {
    this.setState({ selectedUploadedCustomer: customer });
    this.props.dispatch(
      CustomerActions.setBulkUploadedSelectedCustomer(customer, () => {
        this.props.dispatch(SubmissionActions.resetSubmissionSequencecs());
        this.props.dispatch(SubmissionActions.setSelectedSequence(null));
        this.props.dispatch(ApplicationActions.setSelectedSubmission(null));
        this.setState(
          { selectedSequence: null, selectedSubmission: null },
          () => {
            this.props.history.push("/applicationStatus");
          }
        );
      })
    );
  };

  componentWillUnmount() {
    this.props.dispatch(SubmissionActions.resetSubmissionSequencecs());
    this.props.dispatch(SubmissionActions.setSelectedSequence(null));
    this.props.dispatch(ApplicationActions.setSelectedSubmission(null));
  }

  /**
   * On changing the page in the list view
   * @param {*} pageNo
   */
  onPageChange = (pageNo) => {
    this.setState({ pageNo }, () => this.fetchAppSequences());
  };
  /**
   * On changing the size of the records per the page to display
   * @param {*} limit
   */
  onPageSizeChange = (limit) => {
    this.setState({ limit }, () => this.fetchAppSequences());
  };

  /**
   * Sorting the columns in the list view
   * @param {*} sortBy
   * @param {*} orderBy
   */
  sortColumn = (sortBy, orderBy) => {
    this.fetchAppSequences(sortBy, orderBy);
  };

  /**
   * Refresh sequence for the latest file changes
   * @param {*} seq
   */
  refreshSequence = (seq) => () => {};

  /**
   * Context menu options
   * @param {*} application
   */
  getMenu = (application) => () => {
    return (
      <Menu className="maindashboard__list__item-dropdown-menu">
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item-refresh"
          style={{ borderBottom: "0 !important" }}
          onClick={this.refreshSequence(application)}
        >
          <p>
            <img src="/images/refresh-black.svg" alt="Refresh"/>
            <span>{translate("label.submissions.refresh")}</span>
          </p>
        </Menu.Item>
      </Menu>
    );
  };

  /**
   *
   * @param {*} checked
   */
  checkAll = (checked, event) => {
    // Returing if there are no sequences
    let isWIP = checked;
    if (!this.state.submissionSequnces.length) {
      event.preventDefault();
      return;
    }
    let checkedSequences = [];
    let submissionSequnces = this.state.submissionSequnces.slice(
      0,
      this.state.limit
    );
    if (isWIP) {
      map(submissionSequnces, (sequence) => {
        set(sequence, "isWIP", isWIP);
      });
      checkedSequences = [...submissionSequnces];
    } else {
      submissionSequnces = map(submissionSequnces, (sequence) => ({
        ...sequence,
        isWIP,
      }));
      checkedSequences.length = 0;
    }
    const TableColumns = [...this.state.TableColumns];
    TableColumns[3].allViewable = submissionSequnces;
    submissionSequnces = [...submissionSequnces];
    this.setState(
      {
        submissionSequnces,
        TableColumns,
        checkedSequences,
      },
      () => {
        let sequences = checked ? checkedSequences : submissionSequnces;
        this.changeSequenceStatus(sequences, checked);
      }
    );
  };

  /**
   *
   * @param {*} sequence
   */
  onStatusClick = (sequence) => (checked) => {
    let uncheckedSequences = [];
    const TableColumns = [...this.state.TableColumns];
    let checkedSequences = [...this.state.checkedSequences];
    let submissionSequnces = this.state.submissionSequnces.slice(
      0,
      this.state.limit
    );
    sequence.isWIP = checked;
    // If WIP is selected
    if (checked) {
      checkedSequences.push(sequence);
    } else {
      checkedSequences = filter(checkedSequences, (checkedSeq) => {
        return checkedSeq.id !== sequence.id;
      });
      uncheckedSequences.push(sequence);
    }
    //Checking if the emails not customers all are selected or not
    TableColumns[3].allViewable = every(submissionSequnces, ["isWIP", true]);
    this.setState(
      {
        submissionSequnces,
        TableColumns,
        checkedSequences,
      },
      () => {
        let sequences = checked ? checkedSequences : uncheckedSequences;
        this.changeSequenceStatus(sequences, checked);
      }
    );
  };

  /**
   * Toggling sequence status
   * @param {*} selectedApplications
   */
  changeSequenceStatus = async (selectedSequences, status) => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.updateusequenceStatus({
      state: status ? 1 : 0,
      sequenceIds:
        selectedSequences.length > 0 ? map(selectedSequences, "id") : [],
    });
    if (!res.data.error) {
      this.props.dispatch(ApiActions.successOnDemand());
      this.fetchAppSequences();
    } else {
      Toast.error(res.data.message);
      this.props.dispatch(ApiActions.successOnDemand());
    }
  };

  onSelect = (field, array) => (val) => {
    const value = find(array, (item) => Number(item.key) == Number(val));
    this.setState({ [field]: value }, () => {
      if (field === "selectedSubmission") {
        let selectedSequence = {
          id: 0,
          name: "All",
          key: 0,
          value: "All",
        };
        // this.props.actions.resetApplications();
        this.setState(
          { selectedSequence: selectedSequence, selectedSubmission: value },
          () => {
            this.props.dispatch(
              ApplicationActions.setSelectedSubmission(value)
            );
            this.fetchAppAllSequences();
            this.fetchAppSequences();
          }
        );
      } else {
        this.props.dispatch(SubmissionActions.setSelectedSequence(value));
        this.fetchAppSequences();
      }
    });
  };

  render() {
    const { loading, count } = this.props;
    let {
      applications,
      limit,
      pageNo,
      TableColumns,
      selectedUploadedCustomer,
      bulkUploadedSubmissions,
      submissionSequnces,
      selectedSubmission,
      selectedSequence,
      sequences,
      allSubmissionSequences,
    } = this.state;

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
                  text={selectedUploadedCustomer.company_name}
                />
                <img
                  className="global__cursor-pointer"
                  alt="caret-icon"
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
              className="applications-management-layout__header-title"
              text={translate("label.submissions.applicationManagement")}
            />
            <div className="applications-management-layout__header__selectOptions">
              <SelectField
                className="applications-management-layout__header__selectOptions__field"
                selectFieldClassName="applications-management-layout__header__selectOptions__field-select"
                selectedValue={
                  allSubmissionSequences.length
                    ? `${get(selectedSequence, "key", "")}`
                    : "All"
                }
                disabled={
                  get(selectedSubmission, "submissionId") === 0 ||
                  !allSubmissionSequences.length
                }
                suffixIcon={<CaretDownOutlined />}
                options={allSubmissionSequences || []}
                onChange={this.onSelect(
                  "selectedSequence",
                  allSubmissionSequences
                )}
                style={{ marginRight: "0" }}
                label={translate("label.dashboard.sequence")}
                placeholder={translate("label.generic.all")}
              />
              <SelectField
                className="applications-management-layout__header__selectOptions__field"
                selectFieldClassName="applications-management-layout__header__selectOptions__field-select"
                selectedValue={`${get(selectedSubmission, "key", "")}`}
                suffixIcon={<CaretDownOutlined />}
                options={bulkUploadedSubmissions || []}
                onChange={this.onSelect(
                  "selectedSubmission",
                  bulkUploadedSubmissions
                )}
                label={translate("label.dashboard.application")}
                placeholder={translate("label.generic.all")}
              />
            </div>
          </div>

          <div className="applications-management-layout__list">
            <TableHeader
              columns={TableColumns}
              sortColumn={this.sortColumn}
              checkAll={this.checkAll}
              viewAll={TableColumns[3].allViewable}
            />
            {map(submissionSequnces, (sequence) => (
              <Row
                key={sequence.id}
                className="applications-management-layout__list__item"
                style={{ justifyContent: "normal" }}
              >
                <Column
                  width={this.getColumnWidth(TableColumnNames.CUSTOMER)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(sequence, "company_name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.APPLICATION)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(sequence, "submission", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.SEQUENCE)}
                  className="applications-management-layout__list__item-text"
                >
                  <span
                    style={{
                      width: "72px",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    {get(sequence, "sequence", "N/A")}
                  </span>
                </Column>

                <Column
                  width={this.getColumnWidth(TableColumnNames.WIP)}
                  className="applications-management-layout__list__item-text-status"
                >
                  <Switch
                    size="small"
                    className="applications-management-layout__list__item-text global__cursor-pointer"
                    checked={get(sequence, "isWIP", false)}
                    onClick={this.onStatusClick(sequence)}
                  ></Switch>
                  <span
                    className="applications-management-layout__list__item-text"
                    style={{ paddingLeft: "12px" }}
                  >
                    {sequence.isWIP ? "Yes" : "No"}
                  </span>
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.LASTUPDATED)}
                  className="applications-management-layout__list__item-text"
                >
                  <span
                    className={`${isToday(sequence.updated_at) &&
                      "applications-management-layout__list__item-text-link"}`}
                  >
                    {isToday(sequence.updated_at)
                      ? "Today"
                      : getFormattedDate(sequence.updated_at)}
                  </span>
                </Column>
                {/* TODO-Will use this in the later sprint mostly in Sprint-32 or Sprint-33 so commented*/}
                {/* {sequence.isWIP && (
                  <Column>
                    <Dropdown
                      overlay={this.getMenu(sequence)}
                      trigger={["click"]}
                      overlayClassName="maindashboard__list__item-dropdown"
                    >
                      <img
                        className="global__cursor-pointer"
                        src="/images/overflow-black.svg"
                        style={{ width: "18px", height: "18px" }}
                      />
                    </Dropdown>
                  </Column>
                )} */}
              </Row>
            ))}
          </div>
          {!get(this.props, "submissionSequnces.length") && !loading && (
            <Row className="applications-management-layout__nodata">
              <Icon
                style={{ fontSize: "20px" }}
                type="exclamation-circle"
                className="applications-management-layout__nodata-icon"
              />
              {translate("error.dashboard.notfound", {
                type: translate("label.dashboard.sequences"),
              })}
            </Row>
          )}
          <Pagination
            key={count}
            total={count}
            showTotal={(total, range) =>
              translate("text.pagination", {
                top: range[0],
                bottom: range[1],
                total,
                type: translate("label.dashboard.applications"),
              })
            }
            pageSize={limit}
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
    selectedUploadedCustomer: state.Customer.selectedUploadedCustomer,
    selectedSubmission: state.Application.selectedSubmission,
    selectedSequence: state.Submission.selectedSequence,
    bulkUploadedSubmissions: state.Application.bulkUploadedSubmissions, //getSubmissionsByCustomer(state),
    submissionCount: state.Application.submissionCount,
    submissionSequnces: state.Submission.submissionSequnces,
    allSubmissionSequences: state.Submission.allSubmissionSequences,
    count: state.Submission.count,
    bulkUploadedSubmissionsCount:
      state.Application.bulkUploadedSubmissionsCount,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...CustomerActions, ...ApplicationActions, ...SubmissionActions },
      dispatch
    ),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationManagement);
