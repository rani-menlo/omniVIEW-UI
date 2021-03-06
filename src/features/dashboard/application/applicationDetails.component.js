import React, { Component } from "react";
import { Modal } from "antd";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  InputField,
  OmniButton,
  SelectField,
  NumericInput,
} from "../../../uikit/components";
import { translate } from "../../../translations/translator";

class ApplicationDetails extends Component {
  static propTypes = {
    cancel: PropTypes.func,
    submit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      region: {
        value: "",
        error: "",
      },
      submissionCenter: {
        value: "",
        error: "",
      },
      applicationType: {
        value: "",
        error: "",
      },
      applicationNo: {
        value: "",
        error: "",
      },
      sequences: {
        value: "",
        error: "",
      },
    };
  }

  componentDidMount() {
    const { appType, appNumber, selectedRegion } = this.props;
    const { applicationType, applicationNo, region } = this.state;
    this.setState({
      applicationType: { ...applicationType, value: appType },
      region: { ...region, value: selectedRegion },
      applicationNo: { ...applicationNo, value: appNumber },
    });
  }

  onSelect = (field, array) => (val) => {
    const value = _.find(array, (item) => item.key == val);
    this.setState({ [field]: { value, error: "" } });
  };

  onInputChange = (field) => (e) => {
    const { value } = e.target;
    if (value === " ") {
      return;
    }
    this.setState({
      [field]: { ...this.state[field], value, error: "" },
    });
  };

  onSubmit = () => {
    Modal.info({
      className: "omni-info-modal",
      content:
        "The Application Number and Application Type are fetched from the US Regional file of the highest numbered Sequence. The same Application Number and Type will be used for all the validations on this Submission after this step. ",
      okText: translate("label.generic.ok"),
      okButtonProps: { className: "omniButton-primary" },
      onOk: () => {
        this.submit();
      },
    });
  };

  submit = () => {
    const { submit } = this.props;
    const state = { ...this.state };
    let error = false;
    if (!state.region.value) {
      error = true;
      state.region.error = translate("error.form.required", {
        type: translate("label.newapplication.region"),
      });
    }
    if (!state.submissionCenter.value) {
      error = true;
      state.submissionCenter.error = translate("error.form.required", {
        type: translate("label.newapplication.submissioncenter"),
      });
    }
    if (!state.applicationType.value) {
      error = true;
      state.applicationType.error = translate("error.form.required", {
        type: translate("label.newapplication.applicationtype"),
      });
    }
    if (!state.applicationNo.value) {
      error = true;
      state.applicationNo.error = translate("error.form.required", {
        type: translate("label.newapplication.applicationnumber"),
      });
    }
    if (error) {
      this.setState(state);
      return;
    }

    Modal.info({
      className: "omni-info-modal",
      content:
        "The Application Number and Application Type are fetched from the US Regional file of the highest numbered Sequence. The same Application Number and Type will be used for all the validations on this Submission after this step. ",
      okText: translate("label.generic.ok"),
      okButtonProps: { className: "omniButton-primary" },
      onOk: () => {
        const obj = {
          region_id: state.region.value.key,
          submission_center: state.submissionCenter.value.value,
          application_type_id: state.applicationType.value.key,
          app_number: state.applicationNo.value,
          no_of_sequences: this.props.validSequences,
        };
        submit(obj);
      },
    });
  };

  render() {
    const {
      applicationNo,
      sequences,
      region,
      submissionCenter,
      applicationType,
    } = this.state;
    const { cancel, regions, centers, types, validSequences } = this.props;
    const style = { marginBottom: "10%" };
    return (
      <div className="addnewapplication__remote">
        <SelectField
          key={_.get(region, "value.key")}
          style={style}
          selectFieldClassName="newlicence__field-select"
          selectedValue={_.get(region, "value.value")}
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
          selectedValue={_.get(submissionCenter, "value.value")}
          error={submissionCenter.error}
          onChange={this.onSelect("submissionCenter", centers)}
          label={`${translate("label.newapplication.submissioncenter")}*`}
          placeholder={translate("label.newapplication.submissioncenter")}
        />
        <SelectField
          disabled
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
          disabled
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
