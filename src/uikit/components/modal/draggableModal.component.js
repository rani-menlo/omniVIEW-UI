import React, { Component } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import Resizable from "re-resizable";
// import { Resizable, ResizableBox } from "react-resizable";

class DraggableModal extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    defaultWidth: PropTypes.string,
    defaultHeight: PropTypes.string,
    minWidth: PropTypes.string,
    minHeight: PropTypes.string,
    draggableAreaClass: PropTypes.string,
    visible: PropTypes.bool
  };

  static defaultProps = {
    defaultWidth: "70%",
    defaultHeight: "70%",
    minWidth: "29%",
    minHeight: "26%"
  };

  render() {
    const { draggableAreaClass, minWidth, minHeight, visible } = this.props;
    return (
      visible && (
        <Draggable
          defaultClassName="draggable-modal"
          handle={draggableAreaClass}
          bounds="parent"
        >
          <Resizable
            defaultSize={{
              width: "70%",
              height: "70%"
            }}
            minWidth={minWidth}
            minHeight={minHeight}
            bounds="parent"
          >
            {this.props.children}
          </Resizable>
        </Draggable>
      )
    );
  }
}

export default DraggableModal;
