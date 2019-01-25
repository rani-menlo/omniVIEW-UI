import React from "react";

const Footer = ({ alignToBottom }) => (
  <div
    className="footer"
    style={alignToBottom && { position: "absolute", bottom: 0, width: "100%" }}
  >
    Copyright &copy; 2003-2019 Omnicia Inc. &nbsp;&nbsp;&nbsp;&nbsp; Terms of
    Use &nbsp;&nbsp;&nbsp;&nbsp; Privacy Policy
  </div>
);

export default Footer;
