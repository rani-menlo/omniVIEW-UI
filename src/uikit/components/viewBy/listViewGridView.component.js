import React from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";

const ListViewGridView = ({ viewBy, changeView }) => {
  return (
    <div className="listViewGridView">
      <div
        className={`listViewGridView__icon listViewGridView__lists ${viewBy ===
          "lists" && "listViewGridView__selected"}`}
        onClick={onViewChange("lists", changeView)}
        title="List"
      >
        <img
          src={
            viewBy === "lists"
              ? "/images/list-view-active.svg"
              : "/images/list-view.svg"
          }
        />
      </div>
      <div
        className={`listViewGridView__icon listViewGridView__cards ${viewBy ===
          "cards" && "listViewGridView__selected"}`}
        onClick={onViewChange("cards", changeView)}
        title="Cards"
      >
        <Icon
          type="appstore"
          theme="filled"
          className={`listViewGridView__cards-icon ${viewBy === "cards" &&
            "listViewGridView__cards-icon-colored"}`}
        />
      </div>
    </div>
  );
};

const onViewChange = (viewBy, callback) => () => {
  callback && callback(viewBy);
};

ListViewGridView.propTypes = {
  viewBy: PropTypes.oneOf(["cards", "lists"]),
  changeView: PropTypes.func
};

export default React.memo(ListViewGridView);
