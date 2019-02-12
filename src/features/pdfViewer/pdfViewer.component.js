import React, { Component } from "react";
import { SERVER_URL } from "../../constants";
import API from "../../redux/api";
import { URI } from "../../constants";
import _ from "lodash";

class PdfViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      url: "",
      type: ""
    };
  }

  async componentDidMount() {
    const { params } = this.props.match;
    /* if (params.fileId) {
      const res = await API.get(URI.GET_FILE_SIZE, {
        params: {
          fileId: params.fileId
        }
      });
      console.log(res);
    } */
    let reqParam = this.props.location.search;
    let url = `${SERVER_URL}/api/v1/getResourceFile/${params.fileId}`;
    if (reqParam) {
      reqParam = reqParam.substring(1);
      const paths = reqParam.split("&");
      let fileId = paths[0].split("=")[1];
      let path = paths[1].split("=")[1];
      path = path.split("/").join("$$$@@@$$$");

      url = `${SERVER_URL}${URI.GET_NEW_PATH}/${fileId}$$$***$$$${path}`;
      const res = await API.get(url);
      const { data } = res.data;
      fileId = _.get(data, "fileID");
      if (fileId) {
        url = `${SERVER_URL}/api/v1/getResourceFile/${fileId}`;
      }
      console.log(res);
    }
    this.setState({ url, type: params.type });
  }

  render() {
    const mainFileUrl = this.state.url;
    const type = this.state.type;
    let url = `${window.location.origin}/web/viewer.html?file=${mainFileUrl}`;

    if (type === "pdf") {
      return <iframe width="100%" height="100%" src={url} />;
    }

    if (type === "doc" || type === "docx" || type === "ppt") {
      url = `https://view.officeapps.live.com/op/embed.aspx?src=${mainFileUrl}`;
    } else if (type === "xml") {
      url = `https://docs.google.com/viewer?url=${mainFileUrl}&embedded=true`;
    } else {
      url = mainFileUrl;
    }

    if (type) {
      window.location = url;
    }

    return null;
  }
}

export default PdfViewer;
