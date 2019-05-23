import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ImageApi } from "../../../redux/api";

class ImageLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: ""
    };
  }

  static propTypes = {
    path: PropTypes.string,
    type: PropTypes.oneOf(["", "circle"]),
    height: PropTypes.string,
    width: PropTypes.string
  };

  async componentDidMount() {
    const { path } = this.props;
    const res = await ImageApi.fetchImage(path);
    console.log(res);
    const fr = new FileReader();
    fr.onload = e => {
      this.setState({ image: e.target.result });
    };
    fr.readAsDataURL(
      new Blob([res.data], {
        type: `image/${path.substring(path.lastIndexOf(".") + 1)}`
      })
    );
  }

  render() {
    const { type, height, width } = this.props;
    const style = {
      //   backgroundImage: `url("${this.state.image}")`,
      height,
      width
    };
    return type === "circle" ? (
      <CircledImage style={style} />
    ) : (
      <img style={style} src={this.state.image} />
    );
  }
}

const CircledImage = styled.img`
  background-size: cover;
  display: block;
  border-radius: 100px;
`;

export default ImageLoader;
