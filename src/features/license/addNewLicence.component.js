import React, { Component } from "react";
import _ from "lodash";
import uuidv4 from "uuid/v4";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal, Icon } from "antd";
import { Text, OmniButton } from "../../uikit/components";
import { CustomerActions } from "../../redux/actions";
import { translate } from "../../translations/translator";
import NewLicenceRow from "./newLicenceRow.component";
import LicencePreview from "./licencePreview.component";

class AddNewLicence extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    addNewLicence: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      openPreviewModal: false,
      rows: [{ id: uuidv4(), ref: React.createRef() }],
      addedLicences: []
    };
  }

  componentDidMount() {
    this.props.dispatch(CustomerActions.getLicenceLookUps());
  }

  validateAndGetFieldValues = () => {
    let licences = [];
    _.forEach(this.state.rows, row => {
      const rowObject = row.ref.current;
      const licence = rowObject.validate();
      if (licence) {
        licences.push(licence);
      } else {
        licences.length = 0;
        return false;
      }
    });
    return licences;
  };

  addRow = () => {
    let licences = this.validateAndGetFieldValues();
    licences.length &&
      this.setState({
        rows: [...this.state.rows, { id: uuidv4(), ref: React.createRef() }]
      });
  };

  removeRow = uuid => {
    let rows = [...this.state.rows];
    if (rows.length > 1) {
      _.remove(rows, row => row.id === uuid);
      this.setState({ rows });
    }
  };

  openPreviewModal = () => {
    let licences = this.validateAndGetFieldValues();
    licences.length &&
      this.setState({ openPreviewModal: true, addedLicences: licences });
  };

  closePreviewModal = () => {
    this.setState({ openPreviewModal: false });
  };

  submit = () => {
    this.closePreviewModal();
    this.props.addNewLicence &&
      this.props.addNewLicence(this.state.addedLicences);
  };

  render() {
    const { visible, closeModal, lookupLicences } = this.props;
    return (
      <Modal
        destroyOnClose
        visible={visible}
        closable={false}
        footer={null}
        wrapClassName="licence-modal"
      >
        <div
          className="licence-modal__header"
          style={{ marginBottom: "unset" }}
        >
          <Text
            type="extra_bold"
            size="16px"
            text={`${translate("label.button.add", {
              type: translate("label.licence.licence")
            })}`}
          />
          <img
            src="/images/close.svg"
            className="licence-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <Text
          type="regular"
          size="14px"
          opacity={0.5}
          text={`${translate("text.licence.selectlicenceparams")}`}
        />
        <div className="licence-modal__rows" style={{ marginTop: "20px" }}>
          {_.map(this.state.rows, row => (
            <NewLicenceRow
              ref={row.ref}
              key={row.id}
              id={row.id}
              applications={lookupLicences.types}
              durations={lookupLicences.licences}
              removeRow={this.removeRow}
            />
          ))}
        </div>
        <span onClick={this.addRow} className="global__cursor-pointer">
          <Icon
            type="plus-circle"
            theme="filled"
            style={{ marginRight: "5px" }}
          />
          {translate("label.button.addanother", {
            type: translate("label.licence.licence")
          })}
        </span>
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            onClick={closeModal}
            buttonStyle={{ width: "120px", marginRight: "12px" }}
          />
          <OmniButton
            label={translate("label.pagination.next")}
            buttonStyle={{ width: "120px" }}
            onClick={this.openPreviewModal}
          />
        </div>
        <LicencePreview
          licences={this.state.addedLicences}
          visible={this.state.openPreviewModal}
          closeModal={closeModal}
          back={this.closePreviewModal}
          submit={this.submit}
        />
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    lookupLicences: state.Customer.lookupLicences
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
)(AddNewLicence);
