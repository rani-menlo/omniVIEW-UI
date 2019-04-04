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
    width: PropTypes.string,
    height: PropTypes.string,
    draggableAreaClass: PropTypes.string,
    visible: PropTypes.bool
  };

  render() {
    const { draggableAreaClass, width, height, visible } = this.props;
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
            minWidth="29%"
            minHeight="26%"
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
