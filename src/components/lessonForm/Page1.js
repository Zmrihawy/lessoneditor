import React from "react";

import { LANGUAGES, FORM_TEXT } from "./settingsFiles/languages/formpage_NO";

const Page1 = props => {
  return (
    <React.Fragment>
      <div className="ui form">
        <div className="field">
          <label>
            <h3 className="formLabel">
              {FORM_TEXT.AUTHOR.heading}
              <span className="requiredText"> (obligatorisk)</span>
            </h3>
            <input
              autoFocus
              autoComplete="off"
              type="text"
              name="author"
              placeholder={FORM_TEXT.AUTHOR.placeholder}
              value={props.state.author}
              onChange={props.changeHandler}
            />
          </label>
          <div className="validateError">{props.state.authorErr}</div>
        </div>
        <div className="field">
          <label>
            <h3 className="formLabel">
              {FORM_TEXT.TRANSLATOR.heading}
              <span className="optionalText"> (valgfritt)</span>
            </h3>
            <input
              autoComplete="off"
              type="text"
              name="translator"
              placeholder={FORM_TEXT.TRANSLATOR.placeholder}
              value={props.state.translator}
              onChange={props.changeHandler}
            />
          </label>
        </div>
        <div className="field">
          <label>
            <h3 className="formLabel">{FORM_TEXT.LANGUAGE.heading}</h3>
            <select
              name="language"
              onChange={props.changeHandler}
              className="ui fluid dropdown"
            >
              {LANGUAGES.map(element => (
                <option key={Object.keys(element)} value={Object.keys(element)}>
                  {Object.values(element)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="field">
          <label>
            <h3 className="formLabel">
              {FORM_TEXT.LICENSE.heading}
              <span className="optionalText"> (valgfritt)</span>
            </h3>
            <input
              autoComplete="off"
              type="text"
              name="license"
              placeholder={FORM_TEXT.LICENSE.placeholder}
              // value={props.state.license}
              onChange={props.changeHandler}
            />
          </label>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page1;
