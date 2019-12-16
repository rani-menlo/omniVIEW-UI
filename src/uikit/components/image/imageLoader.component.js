import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { ImageApi } from "../../../redux/api";
import { translate } from "../../../translations/translator";
import { Spin, Icon } from "antd";
import { getImageData, storeImageData } from "../../../utils";

class ImageLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: "/images/fallback-user.png",
      loading: true
    };
  }

  static propTypes = {
    path: PropTypes.string,
    type: PropTypes.oneOf(["", "circle"]),
    height: PropTypes.string,
    width: PropTypes.string,
    globalAccess: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func
  };

  async componentDidMount() {
    const { path } = this.props;
    if (path && typeof path === "string") {
      let imageData = getImageData(path);
      if (!imageData) {
        const ext = path.substring(path.lastIndexOf(".") + 1);
        const res = await ImageApi.fetchImage(path);
        imageData = `data:image/${ext};base64,${_.get(res, "data", "")}`;
        storeImageData(path, imageData);
      }
      this.setState({
        image: imageData,
        loading: false
      });
    } else {
      this.setState({
        image: "/images/fallback-user.png",
        loading: false
      });
    }
  }

  render() {
    const {
      type,
      height,
      width,
      className,
      onClick,
      style,
      globalAccess
    } = this.props;
    const newStyle = {
      height,
      width,
      ...style
    };
    if (this.state.loading) {
      return (
        <Spin
          indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
        />
      );
    }
    return type === "circle" ? (
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          className={className}
          style={{ ...newStyle, borderRadius: "80px" }}
          src={this.state.image}
          onClick={onClick}
        />
        {globalAccess && (
          <img
            src="/images/globe.svg"
            style={{ position: "absolute", bottom: "2px", right: "5px" }}
            title={translate("label.permissions.globalaccess")}
          />
        )}
      </div>
    ) : (
      <img
        className={className}
        style={newStyle}
        src={this.state.image}
        onClick={onClick}
      />
    );
  }
}

export default React.memo(ImageLoader);
