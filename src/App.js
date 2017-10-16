import React, {Component} from "react"
import "./App.css"
import commands from "./commands.js"
import {score} from "fuzzaldrin"
import ReactCSSTransitionGroup from "react-addons-css-transition-group" // ES6

const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote

const resizeWindow = height => {
    var win = remote.getCurrentWindow()
    let bounds = win.getBounds()
    bounds.height = height
    // now i have everything from BrowserWindow api...
    win.setBounds(bounds)
}

const matchCommand = input => {
    const results = []
    const query = input.split(" ")[0]
    for (let id in commands) {
        let command = commands[id]
        command.match = 0
        for (let id2 in command.keys) {
            const key = command.keys[id2]
            const match = score(query, key)
            command.match = command.match > match ? command.match : match
        }
        if (command.match > 0.01) {
            results.push(command)
        }
    }

    results.sort((a, b) => {
        return a.match > b.match ? 1 : -1
    })

    return results
}

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            updateReady: false,
            authorizationRequest: false,
            from: {},
            value: "",
            results: [],
        }

        ipcRenderer.on("updateReady", (event, text) => {
            this.setState({updateReady: true})
        })
        ipcRenderer.on("authorizationRequest", (event, from) => {
            this.setState({authorizationRequest: true, from})
        })

        this.handleChange = this.handleChange.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
            results: matchCommand(event.target.value),
        })
    }

    handleKeyPress(event) {
        if (event.key === "Enter") {
            const results = matchCommand(this.state.value)

            if (results.length === 0) {
                alert("no command found")
            } else {
                results[0].handler(
                    this.state.value.substring(
                        this.state.value.split(" ")[0].length + 1
                    )
                )
            }
            this.setState({value: "", results: []})
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
        resizeWindow(50 + this.state.results.length * 50)
        return (
            <div className="App">
                <input
                    style={{
                        width: "896px",
                        height: "46px",
                        fontSize: "46px",
                    }}
                    autoFocus
                    className="inputLine"
                    placeholder="enter command"
                    type="text"
                    value={this.state.value}
                    onChange={this.handleChange}
                    onKeyPress={this.handleKeyPress}
                />
                <ReactCSSTransitionGroup
                    transitionName="queryResult"
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                >
                    {this.state.results.map(result => (
                        <div
                            className="queryResult"
                            key={
                                result.keys[0] +
                                " " +
                                this.state.value.substring(
                                    this.state.value.split(" ")[0].length + 1
                                )
                            }
                        >
                            {result.keys[0] +
                                " " +
                                this.state.value.substring(
                                    this.state.value.split(" ")[0].length + 1
                                )}
                        </div>
                    ))}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
}

export default App
