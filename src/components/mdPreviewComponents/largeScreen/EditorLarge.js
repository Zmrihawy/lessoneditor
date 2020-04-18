import React from "react";
import { connect } from "react-redux";
import { addText, parseMD } from "../../../actions";
import MDTextArea from "./MDTextArea";
import MDPreview from "./MDPreview";
import { mdParser } from "../../../utils/mdParser";
import ControlPanel from "./ControlPanel";
import PageButtons from "../../PageButtons";
import ImagePopup from "../ImagePopup";
import {
  SAVING,
  SAVED,
  SECTION_TEXT,
  PHOTO_TEXT,
  NAV_BUTTONS
} from "../settingsFiles/languages/editor_NO";
import {
  SHORTCUTKEY,
  KEY_COMBINATIONS as KEY,
  emphasis,
  undoRedo,
  saveLoadNew,
  image,
  lists,
  sections,
  code
} from "../settingsFiles/buttonConfig";

// check if buttons is pressed
var isButtonOn = {
  bold: true,
  italic: true,
  heading: true,
  strikethrough: true,
  undo: true,
  redo: true,
  new: true,
  load: true,
  save: true,
  image: true,
  listUl: true,
  listOl: true,
  listCheck: true,
  sec_activity: true,
  sec_intro: true,
  sec_check: true,
  sec_protip: true,
  sec_challenge: true,
  sec_flag: true,
  sec_try: true,
  inline: true,
  codeblock: true
};

// dynamic list with all the keyboard shortcut chars from ./settingFiles/buttonConfig.js
var shortcutKeys = [];
for (let i = 0; i < Object.values(KEY).length; i++) {
  shortcutKeys.push(Object.values(KEY)[i][Object.values(KEY)[i].length - 1]);
}

// Count input char for automatic newline at 80 chars
var charCounter = 0;

var storedTextValue = "";

// helper variable to make list buttons work (atKeyDown : enter)
var listButtonValues = { bTitle: "", output: "", cursorInt: 0 };

var undo = [""];
var undoCursorPosition = [];
var redo = [];
var redoCursorPosition = [];

// temporary store inputtext before updating state
var inputText = "";

// variables to help find cursor in textarea
var cursorPositionStart = 0;
var cursorPositionEnd = 0;

// autosave message, gets updated by autosave
var autoSaveMessage = <br />;

// placeholder tag for picture-upload popup
var imagePopup = <br />;

// ___________________

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      test: "test",
      images: [],
      counter: 0,
      textValue: "",
      mdValue: "",
      buttonValues: isButtonOn,
      redirect: null
    };

    // refs are used to find elements in the DOM (simular to document.getElementbyID)
    this.editorRef = React.createRef();
  }

  // counts seconds.  Used with autosave. (simulate backend communication latency)
  componentDidMount() {
    this.myCounter = setInterval(() => {
      this.setState({ counter: this.state.counter + 1 });
    }, 1000);
  }

  // remove counter
  componentWillUnmount() {
    clearInterval(this.myCounter);
  }

  // auto save after a couple of seconds
  componentDidUpdate() {
    if (window.innerHeight / window.innerWidth > 1) {
      this.props.update();
    }
    if (this.state.counter === 2 && this.state.textValue.length > 0) {
      autoSaveMessage = SAVED;
    } else if (this.state.counter === 0) {
      autoSaveMessage = SAVING;
      storedTextValue = this.state.textValue;
    }
  }

  render() {
    // Submithandler
    const mySubmitHandler = event => {
      event.preventDefault();

      console.log("text submitted");

      this.setState({ redirect: "/endpage" });

      // TODO: Send inputtext-data to database
    };

    const resetButtons = () => {
      isButtonOn = {
        bold: true,
        italic: true,
        heading: true,
        strikethrough: true,
        undo: true,
        redo: true,
        new: true,
        load: true,
        save: true,
        image: true,
        listUl: true,
        listOl: true,
        listCheck: true,
        sec_activity: true,
        sec_intro: true,
        sec_check: true,
        sec_protip: true,
        sec_challenge: true,
        sec_flag: true,
        sec_try: true,
        inline: true,
        codeblock: true
      };
      this.setState({ buttonValues: isButtonOn });
    };

    const setUndo = () => {
      undo.push(inputText);
      undoCursorPosition.push(cursorPositionStart);
    };

    // sets cursor in textarea
    const setCursorPosition = (positionStart, positionEnd) => {
      setTimeout(() => {
        this.editorRef.current.selectionStart = positionStart;
        this.editorRef.current.selectionEnd = positionEnd;
      }, 0);
    };

    // all config for handling text on input
    const handleChange = event => {
      cursorPositionStart = event.target.selectionStart;
      cursorPositionEnd = event.target.selectionEnd;
      inputText = event.target.value;
      redo = [];

      // Counts input char. New line if 80
      charCounter += 1;

      if (charCounter === 80) {
        inputText += "\n";
        charCounter = 0;
      }

      this.props.addText(inputText);
      this.props.parseMD(mdParser(inputText));
      this.setState({ counter: 0 });
    };

    const onTextareaKeyUp = e => {
      cursorPositionStart = e.target.selectionStart;
      cursorPositionEnd = e.target.selectionEnd;
    };

    const onTextareaSelect = e => {
      cursorPositionStart = e.target.selectionStart;
      cursorPositionEnd = e.target.selectionEnd;
    };

    const onTextareaMouseDown = e => {
      cursorPositionStart = e.target.selectionStart;
      cursorPositionEnd = e.target.selectionEnd;

      resetButtons();
    };

    // KEYBOARD SHORTCUT SETTINGS
    const onTextareaKeyDown = event => {
      cursorPositionStart = event.target.selectionStart;
      cursorPositionEnd = event.target.selectionEnd;

      // prevents default value on shortcut keys
      if (
        (event.ctrlKey && SHORTCUTKEY === "ctrl") ||
        (event.altKey && SHORTCUTKEY === "alt") ||
        (event.metaKey && SHORTCUTKEY === "command") ||
        (event.shiftKey && SHORTCUTKEY === "shift")
      ) {
        if (shortcutKeys.includes(event.key)) {
          event.preventDefault();
        }
      }

      // if spacebar, update undo
      if (event.key === " ") {
        setUndo();
      }

      // if input is enter, update undo and do list functions if list.
      if (event.key === "Enter") {
        charCounter = 0;
        setUndo();
        if (isButtonOn[listButtonValues["bTitle"]] === false) {
          event.preventDefault();
          if (
            inputText.slice(
              cursorPositionStart - listButtonValues["cursorInt"],
              cursorPositionStart
            ) === listButtonValues["output"]
          ) {
            isButtonOn[listButtonValues["bTitle"]] = true;
            this.setState({ buttonValues: isButtonOn });
            inputText =
              inputText.slice(
                0,
                cursorPositionStart - listButtonValues["cursorInt"]
              ) + inputText.slice(cursorPositionStart);
            this.props.addText(inputText);
            this.props.parseMD(mdParser(inputText));
            setCursorPosition(
              cursorPositionStart - listButtonValues["cursorInt"],
              cursorPositionStart - listButtonValues["cursorInt"]
            );
            return;
          }
          inputText =
            inputText.slice(0, cursorPositionStart) +
            "\n\n" +
            listButtonValues["output"] +
            inputText.slice(cursorPositionStart);
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          setCursorPosition(
            cursorPositionStart + listButtonValues["cursorInt"] + 2,
            cursorPositionStart + listButtonValues["cursorInt"] + 2
          );
          return;
        }
        if (!isButtonOn["heading"]) {
          isButtonOn["heading"] = true;
        }
      }

      // tab gives to char ident space. Also in codeblock
      if (event.key === "Tab") {
        event.preventDefault();
        // config for correct tab inside codeblock:
        if (!isButtonOn["codeblock"]) {
          setUndo();
          inputText =
            inputText.slice(0, cursorPositionStart) +
            "  " +
            inputText.slice(cursorPositionStart);
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          cursorPositionStart += 2;
          setCursorPosition(cursorPositionStart, cursorPositionStart);
          return;
        }
        setUndo();
        inputText =
          inputText.slice(0, cursorPositionStart) +
          "  " +
          inputText.slice(cursorPositionEnd);
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
      }

      // reset buttons if arrow keys are pressed
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowDown"
      ) {
        resetButtons();
      }
    };

    const storeImage = image => {
      this.setState(prevState => ({ images: [...prevState.images, image] }));
    };

    // Show/hide image popup
    const imagePopupSubmitHandler = imagePopupInputValue => {
      if (imagePopupInputValue) {
        setUndo();
        inputText =
          inputText.slice(0, cursorPositionStart) +
          "![" +
          PHOTO_TEXT +
          "](" +
          imagePopupInputValue +
          ")" +
          inputText.slice(cursorPositionStart);
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        this.editorRef.current.focus();
        cursorPositionStart += 2;
        cursorPositionEnd += PHOTO_TEXT.length + 2;
        setCursorPosition(cursorPositionStart, cursorPositionEnd);
        imagePopup = <br />;
        setTimeout(() => {
          console.log(this.state.images);
        }, 100);
      } else {
        imagePopup = <br />;
        this.editorRef.current.focus();
        setCursorPosition(cursorPositionStart, cursorPositionEnd);
      }
    };

    // detect new line and heading value
    const ifNewLine = () => {
      return inputText[cursorPositionStart - 1] === "\n" ||
        inputText === "" ||
        cursorPositionStart === 0 ||
        inputText.slice(cursorPositionStart - 3, cursorPositionStart) ===
          "## " ||
        inputText.slice(cursorPositionStart - 2, cursorPositionStart) === "# "
        ? true
        : false;
    };

    // Button press config method. Keyboard shortcuts also use this method.
    const handleButtonClick = (
      bTitle,
      output,
      cursorIntON,
      cursorIntOFF,
      endOutput
    ) => {
      // move focus to textarea after button click
      this.editorRef.current.focus();
      setCursorPosition(cursorPositionStart, cursorPositionStart);

      // remove all text in textarea and undo/redo variable
      if (bTitle === "new") {
        inputText = "";
        undo = [""];
        redo = [];
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        cursorPositionStart = cursorPositionEnd = 0;
        return;
      }

      // Load, save, undo, redo methods
      if (bTitle === "load") {
        inputText = storedTextValue;
        undo = [inputText];
        redo = [inputText];
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        setCursorPosition(inputText.length, inputText.length);
        return;
      }

      if (bTitle === "save") {
        storedTextValue = inputText;
        return;
      }

      if (bTitle === "undo") {
        let pos1 = undoCursorPosition.pop();
        let pos2 = pos1;
        if (undo.length <= 0) {
          return;
        }
        redo.push(inputText);
        redoCursorPosition.push(cursorPositionStart);
        inputText = undo.pop();
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        setCursorPosition(pos1, pos2);
        return;
      }

      if (bTitle === "redo") {
        let pos1 = redoCursorPosition.pop();
        let pos2 = pos1;
        if (redo.length <= 0) {
          return;
        }
        setUndo();
        inputText = redo.pop();
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        setCursorPosition(pos1, pos2);
        return;
      }

      // cancel button value if pressed second time without textinput
      if (
        !isButtonOn[bTitle] &&
        inputText.slice(
          cursorPositionStart - cursorIntON,
          cursorPositionStart - cursorIntON + output.length
        ) === output
      ) {
        isButtonOn[bTitle] = true;
        this.setState({ buttonValues: isButtonOn });
        if (inputText !== undo[undo.length - 1]) {
          setUndo();
        }
        inputText =
          inputText.slice(0, cursorPositionStart - cursorIntON) +
          inputText.slice(cursorPositionStart - cursorIntON + output.length);
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        cursorPositionEnd = cursorPositionStart -= cursorIntON;
        setCursorPosition(cursorPositionStart, cursorPositionStart);
        return;
      }

      // make new line if some buttons ares pressed, and it is not allready new line
      if (
        bTitle.slice(0, 4) === "list" ||
        bTitle.slice(0, 4) === "sec_" ||
        (bTitle === "codeblock" && isButtonOn["codeblock"]) ||
        (bTitle === "heading" && isButtonOn["heading"])
      ) {
        if (!ifNewLine()) {
          inputText =
            inputText.slice(0, cursorPositionStart) +
            "\n\n" +
            inputText.slice(cursorPositionStart);
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          cursorPositionStart += 2;
          cursorPositionEnd += 2;
          handleButtonClick(
            bTitle,
            output,
            cursorIntON,
            cursorIntOFF,
            endOutput
          );
          return;
        }
        if (bTitle.slice(0, 4) === "list") {
          listButtonValues = {
            bTitle: bTitle,
            output: output,
            cursorInt: cursorIntON
          };
        }
      }

      // image button setting
      if (bTitle === "image") {
        imagePopup = (
          <ImagePopup
            imagePopupSubmitHandler={imagePopupSubmitHandler}
            storeImage={storeImage}
          />
        );
        return;
      }

      // Give heading button multiple values
      if (ifNewLine()) {
        if (
          output === "## " &&
          inputText.slice(cursorPositionStart - 3, cursorPositionStart) ===
            output &&
          isButtonOn[bTitle]
        ) {
          isButtonOn[bTitle] = false;
          this.setState({ buttonValues: isButtonOn });
          setUndo();
          inputText =
            inputText.slice(0, cursorPositionStart - 3) +
            "# " +
            inputText.slice(cursorPositionStart);
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          cursorPositionStart -= 1;
          setCursorPosition(cursorPositionStart, cursorPositionStart);
          return;
        } else if (output === "## " && isButtonOn[bTitle]) {
          setUndo();
          inputText =
            inputText.slice(0, cursorPositionStart) +
            output +
            inputText.slice(cursorPositionStart);

          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          cursorPositionStart += output.length;
          setCursorPosition(cursorPositionStart, cursorPositionStart);
          return;
        } else if (output === "## " && !isButtonOn[bTitle]) {
          if (
            inputText.slice(cursorPositionStart - 2, cursorPositionStart) ===
            "# "
          ) {
            setUndo();
            inputText =
              inputText.slice(0, cursorPositionStart - 2) +
              inputText.slice(cursorPositionStart);
            this.props.addText(inputText);
            this.props.parseMD(mdParser(inputText));
            cursorPositionStart -= 2;
            setCursorPosition(cursorPositionStart, cursorPositionStart);
            isButtonOn[bTitle] = true;
            this.setState({ buttonValues: isButtonOn });
            return;
          } else {
            isButtonOn[bTitle] = true;
            this.setState({ buttonValues: isButtonOn });
            return;
          }
        }
      }

      // insert section text
      if (bTitle.slice(0, 4) === "sec_" && isButtonOn[bTitle]) {
        isButtonOn[bTitle] = false;
        this.setState({ buttonValues: isButtonOn });
        setUndo();
        inputText =
          inputText.slice(0, cursorPositionStart) +
          output +
          inputText.slice(cursorPositionStart);
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        cursorPositionStart += 2;
        cursorPositionEnd += SECTION_TEXT.length + 2;
        setCursorPosition(cursorPositionStart, cursorPositionEnd);
        return;
      }

      //  Button config to insert markdown syntax on button press
      // Config values can be find in :
      // ./settingsFile/buttonConfig.js
      if (isButtonOn[bTitle]) {
        if (cursorPositionStart !== cursorPositionEnd) {
          isButtonOn[bTitle] = false;
          this.setState({ buttonValues: isButtonOn });
          let i = inputText.slice(cursorPositionStart, cursorPositionEnd);

          // if text is selected with " " it need to be removed before insert markdown syntax
          // and update cursorPosition at the same time
          while (
            i[0] === " " ||
            i[i.length - 1] === " " ||
            i[0] === "\n" ||
            i[i.length - 1] === "\n"
          ) {
            if (i[0] === " " || i[0] === "\n") {
              i = i.slice(1);
              cursorPositionStart += 1;
            }
            if (i[i.length - 1] === " " || i[i.length - 1] === "\n") {
              i = i.slice(0, i.length - 1);
              cursorPositionEnd -= 1;
            }
          }
          setCursorPosition(cursorPositionStart, cursorPositionEnd);
          setUndo();
          inputText =
            inputText.slice(0, cursorPositionStart) +
            output.slice(0, cursorIntON) +
            i +
            output.slice(cursorIntON) +
            inputText.slice(cursorPositionEnd);
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          setCursorPosition(
            cursorPositionStart + cursorIntON,
            cursorPositionEnd + cursorIntON
          );
          return;
        }
        isButtonOn[bTitle] = false;
        this.setState({ buttonValues: isButtonOn });
        setUndo();
        inputText =
          inputText.slice(0, cursorPositionStart) +
          output +
          inputText.slice(cursorPositionStart);
        this.props.addText(inputText);
        this.props.parseMD(mdParser(inputText));
        setCursorPosition(
          cursorPositionStart + cursorIntON,
          cursorPositionStart + cursorIntON
        );
        return;
      } else if (!isButtonOn[bTitle]) {
        if (cursorPositionStart !== cursorPositionEnd) {
          isButtonOn[bTitle] = true;
          this.setState({ buttonValues: isButtonOn });
          inputText = undo[undo.length - 1];
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          setCursorPosition(
            cursorPositionStart - cursorIntON,
            cursorPositionEnd - cursorIntON
          );
          return;
        }
        isButtonOn[bTitle] = true;
        this.setState({ buttonValues: isButtonOn });
        setCursorPosition(
          cursorPositionStart + cursorIntOFF,
          cursorPositionEnd + cursorIntOFF
        );
        if (endOutput) {
          setUndo();
          inputText =
            inputText.slice(0, cursorPositionStart + cursorIntOFF) +
            endOutput +
            inputText.slice(cursorPositionStart + cursorIntOFF);
          this.props.addText(inputText);
          this.props.parseMD(mdParser(inputText));
          cursorPositionStart = cursorPositionEnd += cursorIntOFF;
          setCursorPosition(cursorPositionStart, cursorPositionEnd);
        }
        return;
      } else {
        return;
      }
    };

    // Make keyboard shortcuts with React Hotkeys
    // config in ./settingsFiles/buttonConfig.js
    const keyMap = {
      BOLD: KEY.bold.join(""),
      ITALIC: KEY.italic.join(""),
      HEADING: KEY.heading.join(""),
      STRIKETHROUGH: KEY.strikethrough.join(""),
      UNDO: KEY.undo.join(""),
      REDO: KEY.redo.join(""),
      NEW: KEY.new.join(""),
      LOAD: KEY.load.join(""),
      SAVE: KEY.save.join(""),
      IMAGE: KEY.image.join(""),
      LISTUL: KEY.listul.join(""),
      LISTOL: KEY.listol.join(""),
      CHECKLIST: KEY.listcheck.join(""),
      ACTIVITY: KEY.activity.join(""),
      INTRO: KEY.intro.join(""),
      CHECK: KEY.check.join(""),
      PROTIP: KEY.protip.join(""),
      CHALLENGE: KEY.challenge.join(""),
      FLAG: KEY.flag.join(""),
      TRY: KEY.try.join(""),
      INLINE: KEY.inline.join(""),
      CODEBLOCK: KEY.codeblock.join("")
    };

    //keyboard shortcut actions.  Settings in ./settingsFiles/buttonConfig.js
    // SORRY FOR WET CODE. NEED HELP MAKING THIS DRY
    const handlers = {
      BOLD: () =>
        handleButtonClick(
          emphasis[0].bTitle,
          emphasis[0].output,
          emphasis[0].cursorIntON,
          emphasis[0].cursorIntOFF,
          emphasis[0].endOutput
        ),
      ITALIC: () =>
        handleButtonClick(
          emphasis[1].bTitle,
          emphasis[1].output,
          emphasis[1].cursorIntON,
          emphasis[1].cursorIntOFF,
          emphasis[1].endOutput
        ),
      HEADING: () =>
        handleButtonClick(
          emphasis[2].bTitle,
          emphasis[2].output,
          emphasis[2].cursorIntON,
          emphasis[2].cursorIntOFF,
          emphasis[2].endOutput
        ),
      STRIKETHROUGH: () =>
        handleButtonClick(
          emphasis[3].bTitle,
          emphasis[3].output,
          emphasis[3].cursorIntON,
          emphasis[3].cursorIntOFF,
          emphasis[3].endOutput
        ),
      UNDO: () =>
        handleButtonClick(
          undoRedo[0].bTitle,
          undoRedo[0].output,
          undoRedo[0].cursorIntON,
          undoRedo[0].cursorIntOFF,
          undoRedo[0].endOutput
        ),
      REDO: () =>
        handleButtonClick(
          undoRedo[1].bTitle,
          undoRedo[1].output,
          undoRedo[1].cursorIntON,
          undoRedo[1].cursorIntOFF,
          undoRedo[1].endOutput
        ),
      NEW: () =>
        handleButtonClick(
          saveLoadNew[0].bTitle,
          saveLoadNew[0].output,
          saveLoadNew[0].cursorIntON,
          saveLoadNew[0].cursorIntOFF,
          saveLoadNew[0].endOutput
        ),
      LOAD: () =>
        handleButtonClick(
          saveLoadNew[1].bTitle,
          saveLoadNew[1].output,
          saveLoadNew[1].cursorIntON,
          saveLoadNew[1].cursorIntOFF,
          saveLoadNew[1].endOutput
        ),
      SAVE: () =>
        handleButtonClick(
          saveLoadNew[2].bTitle,
          saveLoadNew[2].output,
          saveLoadNew[2].cursorIntON,
          saveLoadNew[2].cursorIntOFF,
          saveLoadNew[2].endOutput
        ),
      IMAGE: () =>
        handleButtonClick(
          image[0].bTitle,
          image[0].output,
          image[0].cursorIntON,
          image[0].cursorIntOFF,
          image[0].endOutput
        ),
      LISTUL: () =>
        handleButtonClick(
          lists[0].bTitle,
          lists[0].output,
          lists[0].cursorIntON,
          lists[0].cursorIntOFF,
          lists[0].endOutput
        ),
      LISTOL: () =>
        handleButtonClick(
          lists[1].bTitle,
          lists[1].output,
          lists[1].cursorIntON,
          lists[1].cursorIntOFF,
          lists[1].endOutput
        ),
      CHECKLIST: () =>
        handleButtonClick(
          lists[2].bTitle,
          lists[2].output,
          lists[2].cursorIntON,
          lists[2].cursorIntOFF,
          lists[2].endOutput
        ),
      ACTIVITY: () =>
        handleButtonClick(
          sections[0].bTitle,
          sections[0].output,
          sections[0].cursorIntON,
          sections[0].cursorIntOFF,
          sections[0].endOutput
        ),
      INTRO: () =>
        handleButtonClick(
          sections[1].bTitle,
          sections[1].output,
          sections[1].cursorIntON,
          sections[1].cursorIntOFF,
          sections[1].endOutput
        ),
      CHECK: () =>
        handleButtonClick(
          sections[2].bTitle,
          sections[2].output,
          sections[2].cursorIntON,
          sections[2].cursorIntOFF,
          sections[2].endOutput
        ),
      PROTIP: () =>
        handleButtonClick(
          sections[3].bTitle,
          sections[3].output,
          sections[3].cursorIntON,
          sections[3].cursorIntOFF,
          sections[3].endOutput
        ),
      CHALLENGE: () =>
        handleButtonClick(
          sections[4].bTitle,
          sections[4].output,
          sections[4].cursorIntON,
          sections[4].cursorIntOFF,
          sections[4].endOutput
        ),
      FLAG: () =>
        handleButtonClick(
          sections[5].bTitle,
          sections[5].output,
          sections[5].cursorIntON,
          sections[5].cursorIntOFF,
          sections[5].endOutput
        ),
      TRY: () =>
        handleButtonClick(
          sections[6].bTitle,
          sections[6].output,
          sections[6].cursorIntON,
          sections[6].cursorIntOFF,
          sections[6].endOutput
        ),
      INLINE: () =>
        handleButtonClick(
          code[0].bTitle,
          code[0].output,
          code[0].cursorIntON,
          code[0].cursorIntOFF,
          code[0].endOutput
        ),
      CODEBLOCK: () =>
        handleButtonClick(
          code[1].bTitle,
          code[1].output,
          code[1].cursorIntON,
          code[1].cursorIntOFF,
          code[1].endOutput
        )
    };

    return (
      <div>
        <div>
          <ControlPanel handleButtonClick={handleButtonClick} />
          <div className="ui two column grid">
            <div className="column">
              <MDTextArea
                editorRef={this.editorRef}
                onInputChange={handleChange}
                handleButtonClick={handleButtonClick}
                onTextareaKeyDown={onTextareaKeyDown}
                onTextareaKeyUp={onTextareaKeyUp}
                onTextareaMouseDown={onTextareaMouseDown}
                onTextareaSelect={onTextareaSelect}
                handlers={handlers}
                keyMap={keyMap}
              />
            </div>
            {imagePopup}
            <div className="column">
              <MDPreview mdValue={this.state.mdValue} />
            </div>
          </div>
        </div>
        <div className="ui container">
          <p style={{ color: "grey" }}>{autoSaveMessage}</p>
        </div>
        <div className="ui container">
          <PageButtons
            prevTitle={NAV_BUTTONS.prev}
            nextTitle={NAV_BUTTONS.submit}
            prevValue="/createNewLesson"
            nextValue="/endpage"
            setPageNumber={null}
            mySubmitHandler={mySubmitHandler}
            state={this.state}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { mdText: state.mdText, parseMD: state.parseMD };
};

export default connect(mapStateToProps, { addText, parseMD })(Editor);