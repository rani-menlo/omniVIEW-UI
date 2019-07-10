import React, { Component } from "react";
import { SERVER_URL, VIEWER } from "../../constants";
import API from "../../redux/api";
import { URI } from "../../constants";
import _ from "lodash";
import Loader from "../../uikit/components/loader";

class PdfViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      url: "",
      type: "",
      largeFile: false
    };
  }

  async componentDidMount() {
    const { params } = this.props.match;
    let largeFile = false;
    this.setState({ loading: true });
    if (params.fileId) {
      const res = await API.get(URI.GET_FILE_SIZE, {
        params: {
          fileId: params.fileId
        }
      });
      const { data } = res.data;
      const fileSize = Number(data);
      if (
        params.type === "doc" ||
        params.type === "docx" ||
        params.type === "ppt"
      ) {
        if (fileSize > VIEWER.OFFICE_VIEWER_MAX_SIZE) {
          largeFile = true;
        }
      } else if (params.type === "xml") {
        if (fileSize > VIEWER.GOOGLE_VIEWER_MAX_SIZE) {
          largeFile = true;
        }
      }
    }
    let reqParam = this.props.location.search;
    const hash = this.props.location.hash || "";
    let url = `${SERVER_URL}${URI.GET_RESOURCE_FILE}/${params.fileId}`;
    if (reqParam) {
      reqParam = reqParam.substring(1);
      const paths = reqParam.split("&");
      let fileId = paths[0].split("=")[1];
      let path = paths[1].split("=")[1];
      const fileName = path.substring(path.lastIndexOf("/") + 1);
      if (fileName) {
        window.document.title = fileName;
      }
      path = path.split("/").join("$$$@@@$$$");

      url = `${SERVER_URL}${URI.GET_NEW_PATH}/${fileId}$$$***$$$${path}`;
      const res = await API.get(url);
      const { data } = res.data;
      fileId = _.get(data, "fileID");
      if (fileId) {
        url = `${SERVER_URL}${URI.GET_RESOURCE_FILE}/${fileId}${hash}`;
      }
    }
    url = `${url}?token=${localStorage.getItem("omniview_user_token")}`;
    this.setState({ url, type: params.type, loading: false, largeFile });
  }

  render() {
    const { url: mainFileUrl, type, loading, largeFile } = this.state;
    let url = `${window.location.origin}/web/viewer.html?file=${mainFileUrl}`;

    if (loading) {
      return <Loader loading={loading} />;
    }

    if (largeFile) {
      window.location = mainFileUrl;
      return null;
    }

    if (type === "pdf") {
      url = url.substring(0, url.lastIndexOf("?"));
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
