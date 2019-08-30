import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import {
  Loader,
  ContentLayout,
  Text,
  InputField,
  PhoneField,
  OmniButton,
  CircularLocalImageFile,
  ImageLoader
} from "../../uikit/components";
import Header from "../header/header.component";
import { translate } from "../../translations/translator";
import { isEmail, isPhone, isValidPwd } from "../../utils";
import { LoginActions } from "../../redux/actions";
import { Upload, Avatar, Checkbox } from "antd";
import { IMAGE_SUPPORT_TYPES } from "../../constants";

class CreateProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editProfile: false,
      showChangePassword: false,
      username: {
        value: "",
        error: ""
      },
      password: {
        value: "",
        error: ""
      },
      oldPassword: {
        value: "",
        error: ""
      },
      confirmPwd: {
        value: "",
        error: ""
      },
      fname: {
        value: "",
        error: ""
      },
      lname: {
        value: "",
        error: ""
      },
      email: {
        value: "",
        error: ""
      },
      phone: {
        value: "",
        error: ""
      },
      selectedFile: null,
      existingProfileImageChanged: false
    };
    this.uploadContainer = React.createRef();
  }

  componentDidMount() {
    const { history } = this.props;
    const state = this.populateState();
    this.setState({
      ...state,
      editProfile: history.location.pathname.includes("/edit")
    });
  }

  populateState = () => {
    const { user } = this.props;
    const state = { ...this.state };
    state.username.value = isNaN(user.user_name) ? user.user_name : "";
    state.fname.value = user.first_name;
    state.lname.value = user.last_name;
    state.email.value = user.email;
    state.phone.value = user.phone;
    if (user.profile) {
      state.selectedFile = user.profile;
    }
    return state;
  };

  onInputChange = field => e => {
    const { value } = e.target;
    this.setState({
      [field]: { ...this.state[field], value, error: "" }
    });
  };

  onPhoneChange = value => {
    this.setState({ phone: { ...this.state.phone, value, error: "" } });
  };

  goBack = () => {
    this.props.history.push("/customers");
  };

  save = () => {
    const state = { ...this.state };
    let error = false;
    if (!state.username.value) {
      error = true;
      state.username.error = translate("error.form.required", {
        type: translate("label.form.username")
      });
    }
    if (!state.editProfile) {
      if (!state.password.value) {
        error = true;
        state.password.error = translate("error.form.required", {
          type: translate("label.form.password")
        });
      }
      if (state.password.value) {
        const valid = isValidPwd(state.password.value);
        if (valid) {
          if (!state.confirmPwd.value) {
            error = true;
            state.confirmPwd.error = translate("error.form.required", {
              type: translate("label.form.password")
            });
          }
          if (state.password.value !== state.confirmPwd.value) {
            error = true;
            state.confirmPwd.error = translate("error.form.pwdmismatch");
          }
        } else {
          error = true;
          state.password.error = translate("error.form.pwdreq");
        }
      }
    }
    if (state.showChangePassword) {
      if (
        state.oldPassword.value ||
        state.password.value ||
        state.confirmPwd.value
      ) {
        if (!state.oldPassword.value) {
          error = true;
          state.oldPassword.error = translate("error.form.required", {
            type: `${translate("label.generic.current")} ${translate(
              "label.form.password"
            )}`
          });
        }
        if (!state.password.value) {
          error = true;
          state.password.error = translate("error.form.required", {
            type: `${translate("label.generic.new")} ${translate(
              "label.form.password"
            )}`
          });
        }
        if (state.password.value) {
          const valid = isValidPwd(state.password.value);
          if (valid) {
            if (!state.confirmPwd.value) {
              error = true;
              state.confirmPwd.error = translate("error.form.required", {
                type: `${translate("label.generic.new")} ${translate(
                  "label.form.password"
                )} ${translate("label.generic.again")}`
              });
            }
            if (state.password.value !== state.confirmPwd.value) {
              error = true;
              state.confirmPwd.error = translate("error.form.pwdmismatch");
            }
          } else {
            error = true;
            state.password.error = translate("error.form.pwdreq");
          }
        }
      }
    }
    if (!state.fname.value) {
      error = true;
      state.fname.error = translate("error.form.required", {
        type: translate("label.form.fname")
      });
    }
    if (!state.lname.value) {
      error = true;
      state.lname.error = translate("error.form.required", {
        type: translate("label.form.lname")
      });
    }
    if (state.email.value) {
      const valid = isEmail(state.email.value);
      if (!valid) {
        error = true;
        state.email.error = translate("error.form.invalid", {
          type: translate("label.form.email")
        });
      }
    } else {
      error = true;
      state.email.error = translate("error.form.required", {
        type: translate("label.form.email")
      });
    }
    if (state.phone.value) {
      const valid = isPhone(state.phone.value);
      if (!valid) {
        error = true;
        state.phone.error = translate("error.form.invalid", {
          type: translate("label.form.phone")
        });
      }
    } else {
      error = true;
      state.phone.error = translate("error.form.required", {
        type: translate("label.form.phone")
      });
    }

    if (error) {
      this.setState(state);
      return;
    }

    const reqObject = new FormData();
    reqObject.append("user_name", state.username.value);
    reqObject.append("firstname", state.fname.value);
    reqObject.append("lastname", state.lname.value);
    reqObject.append("emailaddress", state.email.value);
    reqObject.append("phonenumber", state.phone.value);

    if (state.editProfile) {
      if (state.showChangePassword && state.oldPassword.value) {
        reqObject.append("oldpassword", state.oldPassword.value);
        reqObject.append("password", state.password.value);
      }
      if (state.existingProfileImageChanged) {
        reqObject.append("profileimage", this.state.selectedFile);
        reqObject.append("profile", this.props.user.profile);
      } else {
        if (this.state.selectedFile) {
          reqObject.append("profileimage", this.state.selectedFile);
        }
      }
    } else {
      reqObject.append("password", state.password.value);
      if (this.state.selectedFile) {
        reqObject.append("profileimage", this.state.selectedFile);
      }
    }

    this.props.dispatch(
      LoginActions.createOrUpdateProfile(reqObject, this.props.history)
    );
  };

  showPasswordFields = () => {
    this.setState({ showChangePassword: true });
  };

  onFileSelected = info => {
    const { file, target } = info;
    if (target) {
      this.setState({
        selectedFile: target.files[0],
        existingProfileImageChanged: this.props.user.profile ? true : false
      });
      return;
    }
    if (file.status === "uploading") {
      this.setState({ selectedFile: file.originFileObj });
    }
  };

  deletePhoto = () => {
    this.setState({
      selectedFile: null,
      existingProfileImageChanged: this.props.user.profile ? true : false
    });
  };

  replacePhoto = () => {
    this.uploadContainer.current.click();
  };

  render() {
    const {
      editProfile,
      username,
      oldPassword,
      password,
      confirmPwd,
      fname,
      lname,
      email,
      phone,
      showChangePassword
    } = this.state;
    return (
      <React.Fragment>
        <Loader loading={this.props.loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="createProfile">
          <div style={{ marginBottom: "15px" }}>
            <Text
              type="extra_bold"
              size="24px"
              text={
                editProfile
                  ? translate("label.profile.edit")
                  : translate("label.profile.create")
              }
            />
            <Text
              type="regular"
              opacity={0.5}
              size="16px"
              text={
                editProfile
                  ? translate("text.profile.editmsg")
                  : translate("text.profile.addmsg")
              }
            />
            <div className="global__hr-line" style={{ margin: "15px 0px" }} />
            <Text
              type="regular"
              size="16px"
              text={`${translate("label.form.username")} ${translate(
                "label.generic.and"
              )} ${translate("label.form.password")}`}
            />
            <Text
              type="regular"
              size="14px"
              opacity={0.5}
              text={`${translate("text.profile.uniqueuserpwd")} ${translate(
                "text.form.pwdreq"
              )}`}
            />
            <div
              className="createProfile__fields"
              style={{ marginTop: "12px" }}
            >
              <InputField
                className="createProfile__fields-field"
                style={{ marginRight: "14px" }}
                label={`${translate("label.form.username")}*`}
                value={username.value}
                placeholder={translate("label.form.username")}
                error={username.error}
                onChange={this.onInputChange("username")}
              />
            </div>
            {editProfile && !showChangePassword && (
              <OmniButton
                type="primary"
                label="Change Password"
                buttonStyle={{ marginBottom: "20px" }}
                onClick={this.showPasswordFields}
              />
            )}
            {showChangePassword && (
              <React.Fragment>
                <div className="createProfile__fields">
                  <InputField
                    type="password"
                    className="createProfile__fields-field"
                    label={`${translate("label.generic.current")} ${translate(
                      "label.form.password"
                    )}`}
                    value={oldPassword.value}
                    placeholder={`${translate(
                      "label.generic.current"
                    )} ${translate("label.form.password")}`}
                    error={oldPassword.error}
                    onChange={this.onInputChange("oldPassword")}
                  />
                </div>
                <div className="createProfile__fields">
                  <InputField
                    type="password"
                    className="createProfile__fields-field"
                    style={{ marginRight: "14px" }}
                    label={`${translate("label.generic.new")} ${translate(
                      "label.form.password"
                    )}`}
                    value={password.value}
                    placeholder={`${translate("label.generic.new")} ${translate(
                      "label.form.password"
                    )}`}
                    error={password.error}
                    onChange={this.onInputChange("password")}
                  />
                  <InputField
                    type="password"
                    className="createProfile__fields-field"
                    label={`${translate("label.generic.new")} ${translate(
                      "label.form.password"
                    )} ${translate("label.generic.again")}`}
                    value={confirmPwd.value}
                    placeholder={`${translate("label.generic.new")} ${translate(
                      "label.form.password"
                    )} ${translate("label.generic.again")}`}
                    error={confirmPwd.error}
                    onChange={this.onInputChange("confirmPwd")}
                  />
                </div>
              </React.Fragment>
            )}
            {!editProfile && (
              <div className="createProfile__fields">
                <InputField
                  type="password"
                  className="createProfile__fields-field"
                  style={{ marginRight: "14px" }}
                  label={`${translate("label.form.password")}*`}
                  value={password.value}
                  placeholder={translate("label.form.password")}
                  error={password.error}
                  onChange={this.onInputChange("password")}
                />
                <InputField
                  type="password"
                  className="createProfile__fields-field"
                  label={`${translate("label.form.password")} ${translate(
                    "label.generic.again"
                  )}*`}
                  value={confirmPwd.value}
                  placeholder={translate("label.form.password")}
                  error={confirmPwd.error}
                  onChange={this.onInputChange("confirmPwd")}
                />
              </div>
            )}
            <Text
              textStyle={{ marginBottom: "12px" }}
              type="regular"
              size="16px"
              text={translate("label.user.details", {
                type: translate("label.dashboard.user")
              })}
            />
            <div className="createProfile__fields">
              <InputField
                className="createProfile__fields-field"
                style={{ marginRight: "14px" }}
                label={`${translate("label.form.fname")}*`}
                value={fname.value}
                placeholder={translate("label.form.fname")}
                error={fname.error}
                onChange={this.onInputChange("fname")}
              />
              <InputField
                className="createProfile__fields-field"
                label={`${translate("label.form.lname")}*`}
                value={lname.value}
                placeholder={translate("label.form.lname")}
                error={lname.error}
                onChange={this.onInputChange("lname")}
              />
            </div>
            <div className="createProfile__fields">
              <InputField
                className="createProfile__fields-field"
                style={{ marginRight: "14px" }}
                label={`${translate("label.form.email")}*`}
                value={email.value}
                placeholder={translate("placeholder.form.email")}
                error={email.error}
                onChange={this.onInputChange("email")}
              />
              <PhoneField
                className="createProfile__fields-field"
                error={phone.error}
                label={`${translate("label.form.phone")}*`}
                value={phone.value}
                onChange={this.onPhoneChange}
              />
            </div>
            <Checkbox
              key={0}
              style={{ marginBottom: "24px" }}
              checked={this.props.user.is_secondary_contact}
              disabled
            >
              <p
                className="addUser__section-label"
                style={{ display: "inline" }}
              >
                {translate("label.user.seccontact")}
              </p>
            </Checkbox>
            <Text
              textStyle={{ marginBottom: "12px" }}
              type="regular"
              size="16px"
              text="Profile Picture"
            />
            {!this.state.selectedFile && (
              <Upload.Dragger
                className="createProfile__upload"
                multiple={false}
                showUploadList={false}
                onChange={this.onFileSelected}
                accept={IMAGE_SUPPORT_TYPES}
              >
                <p className="createProfile__upload-inner">
                  <img
                    src="/images/upload.svg"
                    className="createProfile__upload-inner-image"
                  />
                  <span className="createProfile__upload-inner-drag">
                    Drag & Drop or{" "}
                  </span>
                  <span className="createProfile__upload-inner-choose">
                    Choose File
                  </span>
                </p>
              </Upload.Dragger>
            )}
            <input
              type="file"
              accept={IMAGE_SUPPORT_TYPES}
              ref={this.uploadContainer}
              style={{ display: "none" }}
              onChange={this.onFileSelected}
            />
            {this.state.selectedFile && (
              <div className="createProfile__fields">
                {!this.state.existingProfileImageChanged &&
                this.props.user.profile ? (
                  <ImageLoader
                    path={this.state.selectedFile}
                    type="circle"
                    width="100px"
                    height="100px"
                  />
                ) : (
                  <CircularLocalImageFile
                    file={this.state.selectedFile}
                    className="createProfile__fields-image"
                  />
                )}
                <div className="createProfile__fields__vertical">
                  <Text
                    className="global__link"
                    textStyle={{ marginBottom: "12px" }}
                    type="regular"
                    size="12px"
                    text="Replace Photo"
                    onClick={this.replacePhoto}
                  />
                  <Text
                    className="global__link"
                    type="regular"
                    size="12px"
                    text="Delete Photo"
                    onClick={this.deletePhoto}
                  />
                </div>
              </div>
            )}
            <div className="createProfile__buttons">
              <OmniButton
                className="createProfile__buttons-btn"
                type="secondary"
                label={translate("label.button.cancel")}
                onClick={this.goBack}
              />
              <OmniButton
                type="primary"
                className="createProfile__buttons-btn"
                label={
                  editProfile
                    ? translate("label.button.savechanges")
                    : translate("label.button.savesubmit")
                }
                buttonStyle={{ marginLeft: "16px" }}
                onClick={this.save}
              />
            </div>
          </div>
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    user: state.Login.user
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
)(CreateProfile);
