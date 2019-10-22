import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { OmniButton } from "../../../uikit/components";
import { CLOUDS } from "../../../constants";

const onSelect = (cb, cloud) => () => {
  cb && cb(cloud);
};

const ChooseCloud = ({ onCloudSelect }) => {
  const buttonStyle = {
    width: "12%",
    height: "100px"
  };
  return (
    <div className="addnewapplication__cloud">
      {_.map(CLOUDS, (val, key) => (
        <OmniButton
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
  onCloudSelect: PropTypes.func
};

export default ChooseCloud;
