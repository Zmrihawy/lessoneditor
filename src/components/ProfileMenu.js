import React from "react";
import { connect } from "react-redux";
import { Popup } from "semantic-ui-react";
import GoogleAuth from "./GoogleAuth";

const ProfileMenu = props => {
  return (
    <React.Fragment>
      <Popup
        className="transition hidden"
        basic
        hover
        size="tiny"
        trigger={
          <div className="ui avatar image">
            {props.imageUrl ? (
              <img src={props.imageUrl} alt="useImage"></img>
            ) : (
              <div className="ui avatar image">
                <i className="user icon"></i>
              </div>
            )}
          </div>
        }
        position="bottom center"
        on="click"
        style={{}}
        pinned
        content={
          <div
            style={{
              position: "left",
              borderRadius: "5px"
            }}
          >
            <div className="ui ">
              {props.imageUrl ? (
                <img
                  className="ui circular centered image"
                  src={props.imageUrl}
                  alt="useImage"
                ></img>
              ) : (
                <div className="ui avatar image">
                  <i className="user icon"></i>
                </div>
              )}
            </div>
            <div style={{ marginTop: "1rem" }} />
            <h2>{props.firstName + " " + props.lastName}</h2>
            <p style={{ marginTop: "-1rem" }}>{props.email}</p>
            <div style={{ marginTop: "3rem" }} />
            <GoogleAuth />
          </div>
        }
      />
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    imageUrl: state.auth.imageUrl,
    firstName: state.auth.firstName,
    lastName: state.auth.lastName,
    email: state.auth.email
  };
};
export default connect(mapStateToProps)(ProfileMenu);