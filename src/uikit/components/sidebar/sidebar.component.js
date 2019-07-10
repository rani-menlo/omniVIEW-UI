import React, { Component } from "react";
import PropTypes from "prop-types";
import { ResizableBox } from "react-resizable";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: false
    };
  }

  static propTypes = {
    containerStyle: PropTypes.object,
    direction: PropTypes.oneOf(["ltr", "rtl"]),
    expand: PropTypes.bool
  };

  static defaultProps = {
    direction: "ltr"
  };

  componentDidUpdate(prevProps) {
    if (this.props.expand !== prevProps.expand) {
      this.setVisibility();
    }
  }

  setVisibility = () => {
    const { expand } = this.props;
    this.setState({ hide: !expand });
  };

  render() {
    const { containerStyle, children, expand, direction } = this.props;
    return (
      <React.Fragment>
        {!this.state.hide && (
          // <ResizableBox axis="x">
          <div
            style={containerStyle}
            className={`slider ${direction}__${
              expand ? "slide-in" : "slide-out"
            }`}
          >
            {children}
          </div>
          // </ResizableBox>
        )}
      </React.Fragment>
    );
  }
}

export default Sidebar;
