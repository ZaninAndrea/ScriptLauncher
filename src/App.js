import React, {Component} from "react"
import "./App.css"
import commands from "./commands.js"
import {score} from "fuzzaldrin"
import ReactCSSTransitionGroup from "react-addons-css-transition-group" // ES6

const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote

let resizeTimeout

const resizeWindow = height => {
    var win = remote.getCurrentWindow()
    let bounds = win.getBounds()
    bounds.height = height
    win.setBounds(bounds)
    console.log(height)
}

const matchCommand = input => {
    const results = []

    // special commands
    if (input[0] === "=") {
        results.push({
            keys: ["="],
            handler: () => alert(input.substring(1)),
            preview: () => input.substring(1),
        })
    }

    // commands
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
        return a.match > b.match ? -1 : 1 // sort in order of confidence
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
            selected: 0,
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
        const results = matchCommand(event.target.value)

        // handles resizes without resizing to the same size
        if (results.length > this.state.results.length) {
            clearTimeout(resizeTimeout)
            resizeWindow(52 + results.length * 50)
        } else if (results.length < this.state.results.length) {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(
                () => resizeWindow(52 + results.length * 50),
                200
            )
        }

        this.setState({
            value: event.target.value,
            results: results,
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
                    className="resultsContainer"
                >
                    {this.state.results.map((result, id) => (
                        <div
                            className={
                                id === this.state.selected
                                    ? "queryResult selectedResult"
                                    : "queryResult"
                            }
                            key={result.keys[0]}
                        >
                            {result.preview(
                                this.state.value.substring(
                                    this.state.value.split(" ")[0].length + 1
                                )
                            )}
                        </div>
                    ))}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
}

export default App
