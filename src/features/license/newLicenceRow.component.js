import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { Row, SelectField, NumericInput } from "../../uikit/components";
import { translate } from "../../translations/translator";
import { Icon } from "antd";

class NewLicenceRow extends Component {
  static propTypes = {
    applications: PropTypes.array,
    durations: PropTypes.array,
    id: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      application: {
        optionObject: null,
        value: "",
        error: ""
      },
      duration: {
        optionObject: null,
        value: "",
        error: ""
      },
      quantity: {
        optionObject: null,
        value: "",
        error: ""
      }
    };
  }

  onApplicationChange = value => {
    const optionObject = _.find(
      this.props.applications,
      app => app.key == value
    );
    this.setState({ application: { value, optionObject, error: "" } });
  };

  onDurationChange = value => {
    const optionObject = _.find(
      this.props.durations,
      duration => duration.key == value
    );
    this.setState({ duration: { value, optionObject, error: "" } });
  };

  onQuantityChange = event => {
    const { value } = event.target;
    this.setState({ quantity: { value, error: "" } });
  };

  remove = () => {
    this.props.removeRow && this.props.removeRow(this.props.id);
  };

  validate = () => {
    const state = { ...this.state };
    let error = false;
    if (!state.application.value) {
      error = true;
      state.application.error = translate("error.form.required", {
        type: translate("label.dashboard.application")
      });
    }
    if (!state.duration.value) {
      error = true;
      state.duration.error = translate("error.form.required", {
        type: translate("label.licence.duration")
      });
    }

    error && this.setState({ state });
    return error
      ? null
      : {
          application: state.application.optionObject,
          duration: state.duration.optionObject,
          quantity: +state.quantity.value || 1
        };
  };

  render() {
    const { applications, durations } = this.props;
    const { application, duration, quantity } = this.state;
    return (
      <div className="newlicence">
        {applications && (
          <SelectField
            className="newlicence__field"
            selectFieldClassName="newlicence__field-select"
            label={`${translate("label.dashboard.application")}*`}
            selectedValue={application.value}
            error={application.error}
            options={applications}
            onChange={this.onApplicationChange}
          />
        )}
        {durations && (
          <SelectField
            className="newlicence__field"
            selectFieldClassName="newlicence__field-select"
            label={`${translate("label.licence.duration")}*`}
            selectedValue={duration.value}
            error={duration.error}
            options={durations}
            onChange={this.onDurationChange}
          />
        )}
        <NumericInput
          className="newlicence__field-input"
          style={{ marginTop: "-4px" }}
          label={`${translate("label.generic.quantity")}`}
          value={quantity.value}
          onChange={this.onQuantityChange}
          limit={999}
        />
        <Icon
          type="minus-circle"
          theme="filled"
          onClick={this.remove}
          className="newlicence-remove"
        />
      </div>
    );
  }
}

export default NewLicenceRow;
