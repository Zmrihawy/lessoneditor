import React from "react";
import Checkbox from "./Checkbox";

class YMLtagsSubject extends React.Component {
  render() {
    return (
      <div className="topicBox">
        <div className="ui equal width grid">
          <div className="column">
            <Checkbox
              name="Matematikk"
              value="mathematics"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
            <Checkbox
              name="Naturfag"
              value="science"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
            <Checkbox
              name="Programmering"
              value="programming"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
          </div>
          <div className="column">
            <Checkbox
              name="Teknologi"
              value="technology"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
            <Checkbox
              name="Musikk"
              value="music"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
            <Checkbox
              name="Norsk"
              value="first_language"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
          </div>
          <div className="column">
            <Checkbox
              name="Engelsk"
              value="english"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
            <Checkbox
              name="Kunst og Håndverk"
              value="arts_and_crafts"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />

            <Checkbox
              name="Samfunnsfag"
              value="social_science"
              subtag="subject"
              onCheck={this.props.myCheckboxHandler}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default YMLtagsSubject;
