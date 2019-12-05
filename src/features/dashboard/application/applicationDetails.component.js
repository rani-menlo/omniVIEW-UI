import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  InputField,
  OmniButton,
  SelectField,
  NumericInput
} from "../../../uikit/components";
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

  componentDidMount() {
    const { appType, appNumber } = this.props;
    const { applicationType, applicationNo } = this.state;
    this.setState({
      applicationType: { ...applicationType, value: appType },
      applicationNo: { ...applicationNo, value: appNumber }
    });
  }

  onSelect = (field, array) => val => {
    const value = _.find(array, item => item.key == val);
    this.setState({ [field]: { value, error: "" } });
  };

  onInputChange = field => e => {
    const { value } = e.target;
    if (value === " ") {
      return;
    }
    this.setState({
      [field]: { ...this.state[field], value, error: "" }
    });
  };

  submit = () => {
    const { submit } = this.props;
    const state = { ...this.state };
    let error = false;
    if (!state.region.value) {
      error = true;
      state.region.error = translate("error.form.required", {
        type: translate("label.newapplication.region")
      });
    }
    if (!state.submissionCenter.value) {
      error = true;
      state.submissionCenter.error = translate("error.form.required", {
        type: translate("label.newapplication.submissioncenter")
      });
    }
    if (!state.applicationType.value) {
      error = true;
      state.applicationType.error = translate("error.form.required", {
        type: translate("label.newapplication.applicationtype")
      });
    }
    if (!state.applicationNo.value) {
      error = true;
      state.applicationNo.error = translate("error.form.required", {
        type: translate("label.newapplication.applicationnumber")
      });
    }
    /* if (!state.sequences.value) {
      error = true;
      state.sequences.error = translate("error.form.required", {
        type: translate("label.newapplication.noofsequences")
      });
    } */
    if (error) {
      this.setState(state);
      return;
    }

    const obj = {
      region_id: state.region.value.key,
      submission_center: state.submissionCenter.value.value,
      application_type_id: state.applicationType.value.key,
      app_number: state.applicationNo.value,
      no_of_sequences: this.props.validSequences
    };
    submit(obj);
  };

  render() {
    const {
      applicationNo,
      sequences,
      region,
      submissionCenter,
      applicationType
    } = this.state;
    const { cancel, regions, centers, types, validSequences } = this.props;
    const style = { marginBottom: "10%" };
    console.log("applicationType", applicationType);
    return (
      <div className="addnewapplication__remote">
        <SelectField
          style={style}
          selectFieldClassName="newlicence__field-select"
          options={regions}
          error={region.error}
          onChange={this.onSelect("region", regions)}
          label={`${translate("label.newapplication.region")}*`}
          placeholder={translate("label.newapplication.region")}
        />
        <SelectField
          selectFieldClassName="newlicence__field-select"
          style={style}
          options={centers}
          error={submissionCenter.error}
          onChange={this.onSelect("submissionCenter", centers)}
          label={`${translate("label.newapplication.submissioncenter")}*`}
          placeholder={translate("label.newapplication.submissioncenter")}
        />
        <SelectField
          key={_.get(applicationType, "value.key")}
          selectFieldClassName="newlicence__field-select"
          style={style}
          selectedValue={_.get(applicationType, "value.value")}
          options={types}
          error={applicationType.error}
          onChange={this.onSelect("applicationType", types)}
          label={`${translate("label.newapplication.applicationtype")}*`}
          placeholder={translate("label.newapplication.applicationtype")}
        />
        <NumericInput
          limit={999999}
          value={applicationNo.value}
          label={`${translate("label.newapplication.applicationnumber")}*`}
          value={applicationNo.value}
          placeholder={translate("label.newapplication.applicationnumber")}
          error={applicationNo.error}
          onChange={this.onInputChange("applicationNo")}
        />
        <NumericInput
          disabled
          label={`${translate("label.newapplication.noofsequences")}`}
          value={validSequences}
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
            onClick={this.submit}
          />
        </div>
      </div>
    );
  }
}

export default ApplicationDetails;
