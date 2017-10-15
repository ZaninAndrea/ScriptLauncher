import React, { Component } from "react";
import "./App.css";

const electron = window.require("electron"); // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer;

class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.state = {
      updateReady: false,
      authorizationRequest: false,
      from: {},
      value: ""
    };

    ipcRenderer.on("updateReady", (event, text) => {
      this.setState({ updateReady: true });
    });
    ipcRenderer.on("authorizationRequest", (event, from) => {
      this.setState({ authorizationRequest: true, from });
    });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleKeyPress(event) {
    if (event.key === "Enter") {
      if (this.state.value.startsWith("wolfram ")) {
        window.open(
          "https://www.wolframalpha.com/input/?i=" +
            this.state.value.substring("wolfram ".length)
        );
      } else if (this.state.value.startsWith("open ")) {
        window.open(this.state.value.substring("open ".length));
      }
      this.setState({ value: "" });
    }
  }
  // render() {
  //     return <div>
  //       Foobar
  //
  //       <button onClick={()=>ipcRenderer.send('quitAndInstall')}>{this.state.updateReady ? "click to update" : "no updates ready"}</button>
  //       {this.state.authorizationRequest ?
  //           <div>Telegram user {this.state.from.username} is asking authorization to run command
  //               <button onClick={()=>{
  //                   ipcRenderer.send("authorizeUser", this.state.from.id)
  //                   this.setState({authorizationRequest: false})
  //               }}>Allow</button>
  //               <button onClick={()=>{
  //                   ipcRenderer.send("unauthorizeUser", this.state.from.id)
  //                   this.setState({authorizationRequest: false})
  //               }}>Dismiss</button>
  //           </div>
  //           : ""}
  //     </div>
  // }

  render() {
    return (
      <div className="App">
        <input
          style={{
            width: "896px",
            height: "46px",
            fontSize: "46px"
          }}
          autoFocus
          className="inputLine"
          placeholder="enter command"
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
        />
      </div>
    );
  }
}

export default App;
