import { Checkbox, Icon } from "antd";
import _ from "lodash";
import React, { Component } from "react";
import { translate } from "../../../translations/translator";
import { OmniButton, Text } from "../../../uikit/components";
import { minFourDigitsInString } from "../../../utils";

class RemoteFiles extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: null };
  }

  select = file => () => {
    this.setState({ selected: file });
  };

  openContents = file => () => {
    this.props.openContents && this.props.openContents(file);
  };

  goBack = () => {
    this.props.openContents && this.props.goBack();
  };

  submit = () => {
    this.props.submit && this.props.submit(this.state.selected);
  };

  //triggers when a checkbox is checked
  selectFolder = (file, e) => {
    this.props.selectFolder && this.props.selectFolder(file, e);
  };

  selectAll = event => {
    this.props.selectAll && this.props.selectAll(event);
  };

  render() {
    const {
      cancel,
      remoteFiles,
      rootPath,
      currentPath,
      isSequence,
      checkedAll,
      showCheckAll
    } = this.props;
    const { selected } = this.state;
    return (
      <React.Fragment>
        <div className="addnewapplication__remotefiles">
          {(rootPath != currentPath || (isSequence && showCheckAll)) && (
            <div className="addnewapplication__remotefiles-file global__center-vert global__cursor-pointer">
              {rootPath != currentPath && (
                <div onDoubleClick={this.goBack} style={{ display: "flex" }}>
                  <img
                    src="/images/folder-back.svg"
                    className="global__file-folder"
                    style={{ width: "22px", height: "22px" }}
                  />
                  <Text type="extra_bold" size="14px" text=".." />
                </div>
              )}
              {isSequence && showCheckAll && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%"
                  }}
                >
                  <Text type="extra_bold" size="14px" text="Select All" />
                  <Checkbox
                    style={{ margin: "2px 5px 0 5px" }}
                    onChange={this.selectAll}
                    checked={checkedAll}
                  />
                </div>
              )}
            </div>
          )}

          {_.map(remoteFiles, (file, index) => {
            return (
              <div
                key={index}
                className={`addnewapplication__remotefiles-file global__center-vert global__cursor-pointer ${(_.get(
                  selected,
                  "name"
                ) === file.name ||
                  file.checked) &&
                  "global__node-selected"}`}
                onClick={!isSequence && this.select(file)}
                onDoubleClick={this.openContents(file)}
              >
                <div style={{ display: "flex", width: "98%" }}>
                  {file.type === "d" ? (
                    <Icon
                      type="folder"
                      theme="filled"
                      global__node-selected
                      className="global__file-folder"
                    />
                  ) : (
                    <img
                      src="/images/file-new.svg"
                      className="global__file-folder"
                      style={{ width: "18px", height: "21px" }}
                    />
                  )}
                  <Text type="regular" size="14px" text={file.name} />
                </div>
                {isSequence && minFourDigitsInString(file.name) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end"
                    }}
                  >
                    <Checkbox
                      style={{ margin: "2px 5px 0 5px" }}
                      onChange={e => this.selectFolder(file, e)}
                      checked={file.checked}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            buttonStyle={{ marginRight: "10px" }}
            onClick={cancel}
          />
          <OmniButton
            type="primary"
            label={
              isSequence
                ? translate("label.button.upload")
                : translate("label.button.continue")
            }
            onClick={this.submit}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default RemoteFiles;
