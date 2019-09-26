import React, { Component } from "react";
import _ from "lodash";
import { Text, OmniButton } from "../../../uikit/components";
import { translate } from "../../../translations/translator";
import { Icon } from "antd";

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

  render() {
    const { cancel, submit, remoteFiles } = this.props;
    const { selected } = this.state;
    return (
      <React.Fragment>
        <div className="addnewapplication__remotefiles">
          <Text
            type="extra_bold"
            size="14px"
            text=".."
            textStyle={{ cursor: "alias" }}
            className="addnewapplication__remotefiles-file"
            onDoubleClick={this.goBack}
          />
          {_.map(remoteFiles, file => {
            return (
              <div
                className={`addnewapplication__remotefiles-file global__center-vert global__cursor-pointer ${_.get(
                  selected,
                  "name"
                ) === file.name && "global__node-selected"}`}
                onClick={this.select(file)}
                onDoubleClick={this.openContents(file)}
              >
                {file.type === "d" ? (
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
                <Text type="regular" size="14px" text={file.name} />
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
            disabled
            type="primary"
            label={translate("label.button.continue")}
            onClick={this.submit}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default RemoteFiles;
