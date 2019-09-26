import React, { Component } from "react";
import PropTypes from "prop-types";
import { InputField, OmniButton } from "../../../uikit/components";
import { translate } from "../../../translations/translator";

class ApplicationDetails extends Component {
  static propTypes = {
    cancel: PropTypes.func,
    submit: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      region: {
        value: "",
        error: ""
      },
      submissionCenter: {
        value: "",
        error: ""
      },
      applicationType: {
        value: "",
        error: ""
      },
      applicationNo: {
        value: "",
        error: ""
      },
      sequences: {
        value: "",
        error: ""
      }
    };
  }

  onInputChange = field => e => {
    const { value } = e.target;
    if (value === " ") {
      return;
    }
    this.setState({
      [field]: { ...this.state[field], value, error: "" }
    });
  };

  render() {
    const { region, submissionCenter, applicationType, applicationNo, sequences } = this.state;
    const { cancel, submit } = this.props;
    return (
      <div className="addnewapplication__remote">
        <InputField
          label={`${translate("label.newapplication.region")}*`}
          value={region.value}
          placeholder={translate("label.newapplication.region")}
          error={region.error}
          onChange={this.onInputChange("region")}
        />
        <InputField
          label={`${translate("label.newapplication.submissioncenter")}*`}
          value={applicationType.value}
          placeholder={translate("label.newapplication.submissioncenter")}
          error={applicationType.error}
          onChange={this.onInputChange("applicationType")}
        />
        <InputField
          label={`${translate("label.newapplication.applicationtype")}*`}
          value={submissionCenter.value}
          placeholder={translate("label.newapplication.applicationtype")}
          error={submissionCenter.error}
          onChange={this.onInputChange("submissionCenter")}
        />
        <InputField
          label={`${translate("label.newapplication.applicationnumber")}*`}
          value={applicationNo.value}
          placeholder={translate("label.newapplication.applicationnumber")}
          error={applicationNo.error}
          onChange={this.onInputChange("applicationNo")}
        />
        <InputField
          label={`${translate("label.newapplication.noofsequences")}*`}
          value={sequences.value}
          placeholder={translate("label.newapplication.noofsequences")}
          error={sequences.error}
          onChange={this.onInputChange("sequences")}
        />
        <div style={{ textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            buttonStyle={{ marginRight: "10px" }}
            onClick={cancel}
          />
          <OmniButton
            type="primary"
            label={translate("label.button.upload")}
            onClick={submit}
          />
        </div>
      </div>
    );
  }
}

export default ApplicationDetails;
