import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { OmniButton } from "../../../uikit/components";
import { CLOUDS } from "../../../constants";
import { connect } from "react-redux";
import { isLoggedInOmniciaAdmin } from "../../../utils";

const onSelect = (cb, cloud) => () => {
  cb && cb(cloud);
};

const ChooseCloud = ({ onCloudSelect, role }) => {
  const buttonStyle = {
    width: "107px",
    height: "100px",
  };
  let clouds = CLOUDS;
  //omitting the afs cloud if the logged in user is not o_odmin
  if (!isLoggedInOmniciaAdmin(role)) {
    clouds = _.omit(clouds, "siteTosite");
  }

  return (
    <div className="addnewapplication__cloud">
      {_.map(clouds, (val, key) => (
        <OmniButton
          key={key}
          disabled={val.disabled}
          type="primary"
          label={val.name}
          buttonStyle={buttonStyle}
          onClick={onSelect(onCloudSelect, val)}
        />
      ))}
    </div>
  );
};

ChooseCloud.propTypes = {
  onCloudSelect: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    role: state.Login.role,
  };
}

export default connect(mapStateToProps)(ChooseCloud);
