import React, { Component } from "react";
import PropTypes from "prop-types";
import { InputField, OmniButton } from "../../../uikit/components";
import { translate } from "../../../translations/translator";

class RemoteDetails extends Component {
  static propTypes = {
    cancel: PropTypes.func,
    submit: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      host: {
        value: "",
        error: ""
      },
      username: {
        value: "",
        error: ""
      },
      password: {
        value: "",
        error: ""
      },
      port: {
        value: "",
        error: ""
      },
      path: {
        value: "",
        error: ""
      }
    };
  }

  componentDidMount() {
    if (this.props.details) {
      this.initState();
    }
  }

  initState = () => {
    const { details } = this.props;
    this.setState({
      host: { value: details.host },
      username: { value: details.username },
      password: { value: details.password },
      port: { value: details.port },
      path: { value: details.root_path || details.ftp_path }
    });
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
    const state = { ...this.state };
    let error = false;
    if (!state.host.value) {
      error = true;
      state.host.error = translate("error.form.required", {
        type: translate("label.newapplication.host")
      });
    }
    if (!state.username.value) {
      error = true;
      state.username.error = translate("error.form.required", {
        type: translate("label.form.username")
      });
    }
    if (!state.password.value) {
      error = true;
      state.password.error = translate("error.form.required", {
        type: translate("label.form.password")
      });
    }
    if (!state.port.value) {
      error = true;
      state.port.error = translate("error.form.required", {
        type: translate("label.newapplication.port")
      });
    }
    if (!state.path.value) {
      error = true;
      state.path.error = translate("error.form.required", {
        type: translate("label.newapplication.path")
      });
    }

    if (error) {
      this.setState(state);
    } else {
      const object = {
        host: state.host.value,
        username: state.username.value,
        password: state.password.value,
        port: state.port.value,
        ftp_path: state.path.value
      };
      this.props.submit && this.props.submit(object);
    }
  };

  render() {
    const { host, username, password, port, path } = this.state;
    const { cancel } = this.props;
    return (
      <div className="addnewapplication__remote">
        <InputField
          label={`${translate(
            "label.newapplication.host"
          )}* (Ex: ftp.example.com)`}
          value={host.value}
          placeholder={translate("label.newapplication.host")}
          error={host.error}
          onChange={this.onInputChange("host")}
        />
        <InputField
          label={`${translate("label.form.username")}*`}
          value={username.value}
          placeholder={translate("label.form.username")}
          error={username.error}
          onChange={this.onInputChange("username")}
        />
        <InputField
          type="password"
          label={`${translate("label.form.password")}*`}
          value={password.value}
          placeholder={translate("label.form.password")}
          error={password.error}
          onChange={this.onInputChange("password")}
        />
        <InputField
          label={`${translate("label.newapplication.port")}* (Ex: 22)`}
          value={port.value}
          placeholder={translate("label.newapplication.port")}
          error={port.error}
          onChange={this.onInputChange("port")}
        />
        <InputField
          label={`${translate(
            "label.newapplication.path"
          )}* (Ex: /server_path/folder/)`}
          value={path.value}
          placeholder={translate("label.newapplication.path")}
          error={path.error}
          onChange={this.onInputChange("path")}
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
            label={translate("label.button.continue")}
            onClick={this.submit}
          />
        </div>
      </div>
    );
  }
}

export default RemoteDetails;
