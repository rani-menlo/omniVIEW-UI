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
          type="primary"
          label={val}
          buttonStyle={buttonStyle}
          onClick={onSelect(onCloudSelect, key)}
        />
      ))}
    </div>
  );
};

ChooseCloud.propTypes = {
  onCloudSelect: PropTypes.func
};

export default ChooseCloud;
