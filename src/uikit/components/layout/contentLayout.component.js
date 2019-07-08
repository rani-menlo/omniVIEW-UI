import React from "react";
import PropTypes from "prop-types";
import Footer from "../footer/footer.component";

const ContentLayout = ({ children, className, childStyle }) => {
  return (
    <React.Fragment>
      <div className="maincontent">
        <div
          className={`maincontent__children ${className}`}
          style={{...childStyle}}
        >
          {children}
        </div>
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
  className: PropTypes.string,
  childStyle: PropTypes.object
};

ContentLayout.defaultProps = {
  className: ""
};

export default React.memo(ContentLayout);
