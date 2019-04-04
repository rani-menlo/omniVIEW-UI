import React from "react";
import PropTypes from "prop-types";
import Footer from "../footer/footer.component";

const ContentLayout = ({ children, className }) => {
  return (
    <React.Fragment>
      <div className="maincontent">
        <div className={`maincontent__children ${className}`}>{children}</div>
      </div>
      <Footer />
    </React.Fragment>
  );
};

ContentLayout.propTypes = {
  children: PropTypes.oneOfType(
    [PropTypes.arrayOf(PropTypes.node)],
    PropTypes.node
  ),
  className: PropTypes.string
};

ContentLayout.defaultProps = {
  className: ""
};

export default React.memo(ContentLayout);
