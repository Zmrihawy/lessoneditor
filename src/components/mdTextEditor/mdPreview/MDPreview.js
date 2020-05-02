import React from "react";
import { connect } from "react-redux";

const MDPreview = props => {
  return (
    <div
      className="MDPreview"
      id="mdpreview"
      dangerouslySetInnerHTML={{ __html: props.parseMD }}
    />
  );
};

const mapStateToProps = state => {
  return { parseMD: state.parseMD };
};

export default connect(mapStateToProps)(MDPreview);
