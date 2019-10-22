import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import { Icon, Button, Checkbox } from "antd";
import { translate } from "../../translations/translator";
import { SearchBox, OmniCheckbox, Text, Row } from "../../uikit/components";
import { SubmissionActions } from "../../redux/actions";

class FindNode extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    onItemSelected: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      searchText: null,
      selected: ""
    };
  }

  componentDidMount() {
    this.setState({
      searchText: this.props.searchText,
      selected: this.props.selected
    });
  }

  handleSearch = e => {
    const searchText = e.target.value;
    this.setState({ searchText });
  };

  clearSearch = () => {
    this.setState({ searchText: "" });
  };

  onCheckboxChange = type => e => {
    this.props.dispatch(SubmissionActions.findMatchBy(type));
    // this.setState({ [type]: e.target.checked });
  };

  search = () => {
    const { searchText } = this.state;
    const {
      selectedSequence,
      selectedSubmission,
      matchCase,
      matchWholeword
    } = this.props;
    const fileID = selectedSequence
      ? selectedSequence.json_path
      : selectedSubmission.life_cycle_json_path;
    this.props.dispatch(SubmissionActions.clearSearchResults());
    this.props.dispatch(
      SubmissionActions.findText({
        fileID,
        text: searchText,
        matchCase,
        wholeWord: matchWholeword
      })
    );
  };

  sortTitle = () => {
    this.props.dispatch(SubmissionActions.findSortByTitle());
  };

  sortFile = () => {
    this.props.dispatch(SubmissionActions.findSortByFile());
  };

  getPathBasedOnOperation = operation => {
    let path = "/images/file-new.svg";
    if (operation === "append") {
      path = "/images/file-append.svg";
    } else if (operation === "replace") {
      path = "/images/file-replace.svg";
    } else {
      path = "/images/file-delete.svg";
    }
    return path;
  };

  onItemSelected = item => () => {
    this.setState({ selected: `${item.ID}_${item.name}_${item.title}` });
    this.props.dispatch(SubmissionActions.findSelectedResult(item));
    this.props.onItemSelected && this.props.onItemSelected(item);
  };

  render() {
    const { searchText } = this.state;
    const {
      onClose,
      searchResults,
      selected,
      matchCase,
      matchWholeword
    } = this.props;
    return (
      <div className="validationResults">
        <div className="validationResults__header">
          <div
            className="validationResults__header__title global__center-horiz-vert"
            style={{ marginBottom: "10px" }}
          >
            <Icon
              type="search"
              style={{ marginRight: "5px", fontSize: "23px" }}
              className="global__color-blue"
            />
            <span className="validationResults__header__title-text">
              {translate("label.submission.find")}
            </span>
          </div>
          <Icon
            type="close"
            className="validationResults__header-close"
            onClick={onClose}
          />
        </div>
        <div className="global__center-vert">
          <SearchBox
            placeholder={translate("placeholder.submission.find")}
            className="validationResults-find"
            searchText={searchText}
            prefixIcon={null}
            /* suffixIcon={
              <Button
                type="primary"
                shape="circle"
                icon="search"
                onClick={this.search}
              />
            } */
            clearSearch={this.clearSearch}
            onPressEnter={this.search}
            onChange={this.handleSearch}
          />
          <Button
            disabled={_.isEmpty(searchText)}
            type="primary"
            icon="search"
            style={{ marginLeft: "10px", color: "white" }}
            onClick={this.search}
          >
            {translate("label.button.search")}
          </Button>
          <div style={{ marginLeft: "10px" }}>
            <Checkbox
              checked={matchWholeword}
              onChange={this.onCheckboxChange("matchWholeword")}
              className="permissionCheckbox"
            >
              <Text
                textStyle={{ display: "inline" }}
                type="regular"
                size="12px"
                text={translate("label.submission.matchwholewords")}
              />
            </Checkbox>
            <Checkbox
              checked={matchCase}
              onChange={this.onCheckboxChange("matchCase")}
              className="permissionCheckbox"
              style={{ marginLeft: "unset" }}
            >
              <Text
                textStyle={{ display: "inline" }}
                type="regular"
                size="12px"
                text={translate("label.submission.matchcase")}
              />
            </Checkbox>
          </div>
        </div>
        {(searchResults.length || "") && (
          <Text
            type="regular"
            size="12px"
            text={translate("text.submission.matchesfound", {
              count: searchResults.length
            })}
            className="global__color-sky"
            textStyle={{ marginLeft: "10px", marginTop: "4px" }}
          />
        )}
        <div
          className="validationResults__table"
          style={{ height: "calc(100% - 140px)" }}
        >
          <div
            className="validationResults__table__body"
            style={{ overflow: "unset" }}
          >
            {searchText !== null && (searchResults.length || "") && (
              <div className="validationResults__table__body__find">
                <div
                  className="validationResults__table__body__find__header global__cursor-pointer"
                  onClick={this.sortTitle}
                >
                  <Text
                    type="extra_bold"
                    size="14px"
                    text={translate("label.generic.title")}
                  />
                  <img
                    src={`/images/sort_${this.props.sortTitle}.svg`}
                    style={{ width: "16px", height: "16px" }}
                  />
                </div>
                <div
                  className="validationResults__table__body__find__header global__cursor-pointer"
                  onClick={this.sortFile}
                  style={{ borderRight: "none" }}
                >
                  <Text
                    type="extra_bold"
                    size="14px"
                    text={translate("label.generic.filename")}
                  />
                  <img
                    src={`/images/sort_${this.props.sortFile}.svg`}
                    style={{ width: "16px", height: "16px" }}
                  />
                </div>
              </div>
            )}
            {!(searchResults.length || "") && (
              <Row style={{ flexDirection: "column", marginTop: "28px" }}>
                <img src="/images/search-file.svg" />
                <Text
                  type="regular"
                  size="16px"
                  opacity={0.5}
                  text={
                    searchText === null
                      ? translate("text.submission.findresults")
                      : !searchResults.length
                      ? translate("text.submission.nomatch")
                      : ""
                  }
                />
              </Row>
            )}
            {searchText !== null && (
              <div
                className="validationResults__table__body__find__results"
                key={`${this.props.sortTitle}_${this.props.sortFile}`}
              >
                {_.map(searchResults, search => {
                  return (
                    <div
                      className={`validationResults__table__body__find__result global__center-vert global__cursor-pointer ${selected ===
                        `${search.ID}_${search.name}_${search.title}` &&
                        "global__node-selected"}`}
                      onClick={this.onItemSelected(search)}
                      key={search.name}
                    >
                      <div
                        className="global__center-vert"
                        style={{ width: "50%", padding: "2px 8px" }}
                      >
                        <span>
                          {search.isFile ? (
                            <img
                              src={this.getPathBasedOnOperation(
                                search.operation
                              )}
                              className="global__file-folder"
                              style={{ width: "18px", height: "22px" }}
                            />
                          ) : (
                            <Icon
                              type="folder"
                              theme="filled"
                              className="global__file-folder"
                            />
                          )}
                        </span>
                        <span
                          style={{
                            wordBreak: "break-word"
                          }}
                        >
                          {search.title}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "50%",
                          padding: "2px 16px",
                          wordBreak: "break-word"
                        }}
                      >
                        {search.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div
          className="validationResults__footer"
          style={{ flexDirection: "row-reverse" }}
        >
          <Button
            type="primary"
            onClick={onClose}
            style={{ color: "white", fontWeight: 800, fontSize: "12px" }}
          >
            {translate("label.button.close")}
          </Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    selectedSequence: state.Submission.selectedSequence,
    selectedSubmission: state.Application.selectedSubmission,
    searchResults: state.Submission.find.searchResults,
    selected: state.Submission.find.selected,
    searchText: state.Submission.find.searchText,
    sortFile: state.Submission.find.sortFile,
    sortTitle: state.Submission.find.sortTitle,
    matchCase: state.Submission.find.matchCase,
    matchWholeword: state.Submission.find.matchWholeword
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
)(FindNode);
