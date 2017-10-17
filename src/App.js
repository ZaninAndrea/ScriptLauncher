import React, {Component} from "react"
import "./App.css"
import commands from "./commands.js"
import asyncCommands from "./asyncCommands.js"
import {score} from "fuzzaldrin"
import ReactCSSTransitionGroup from "react-addons-css-transition-group" // ES6
import Promise from "bluebird"
import mathjs from "mathjs"

const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote
const {spawn} = remote.require("child_process")

let resizeTimeout

const resizeWindow = height => {
    var win = remote.getCurrentWindow()
    let bounds = win.getBounds()
    bounds.height = height
    win.setBounds(bounds)
    console.log(height)
}

let previewCounter = 0
// gets the user input and returns the list of the autocompletes
const matchCommand = (input, num) =>
    new Promise((resolve, reject) => {
        const results = [] // array of the autocomletion results

        // math special command
        if (input[0] === "=") {
            let result = ""

            try {
                result = mathjs.eval(input.substring(1))
            } catch (e) {
                result = "could not evaluate"
            }

            results.push({
                keys: ["="],
                handler: () => alert(input.substring(1)),
                preview: () =>
                    result ? result.toString() : "could not evaluate",
            })
        }

        // shell special command
        if (input[0] === ">") {
            results.push({
                keys: [">"],
                handler: () =>
                    spawn("start", [input.substring(1)], {
                        shell: true,
                        detached: true,
                        stdio: "ignore",
                    }),
                preview: () => "> " + input.substring(1),
            })
        }

        // quit app special command
        if (input.startsWith("quit")) {
            results.push({
                keys: ["quit"],
                handler: () => ipcRenderer.send("quit"),
                preview: () => "quit",
            })
        }

        // iterates synchronous commands and adds the to results if they are a match
        const query = input.split(" ")[0]
        for (let id in commands) {
            let command = commands[id]
            command.match = 0
            // iterate the various keys for that command
            for (let id2 in command.keys) {
                const key = command.keys[id2]
                const match = score(query, key) // match confidence score
                command.match = command.match > match ? command.match : match
            }
            if (command.match > 0.01) {
                results.push(command) // adds command to the results
            }
        }

        // iterates asynchronous commands, checks if they are a match, waits for the previews to be generated and adds them to the list
        let asyncQueue = []
        for (let id in asyncCommands) {
            let asyncCommand = asyncCommands[id]
            asyncCommand.match = 0
            for (let id2 in asyncCommand.keys) {
                const key = asyncCommand.keys[id2]
                const match = score(query, key)
                asyncCommand.match =
                    asyncCommand.match > match ? asyncCommand.match : match
            }
            if (asyncCommand.match > 0.01) {
                asyncQueue.push(
                    asyncCommand
                        .asyncPreview(
                            input.substring(input.split(" ")[0].length + 1)
                        )
                        .then(preview => {
                            asyncCommand.preview = () => preview
                            results.push(asyncCommand)
                        })
                )
            }
        }

        Promise.all(asyncQueue).then(() => {
            results.sort((a, b) => {
                return a.match > b.match ? -1 : 1 // sort in order of confidence
            })

            resolve({results: results, num: num})
        })
    })

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
        ipcRenderer.on("clearInput", () => {
            resizeWindow(52)
            this.setState({value: "", results: []})
        })

        this.handleChange = this.handleChange.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
        })
        event.persist()
        const value = event.target.value
        matchCommand(value, ++previewCounter).then(({num, results}) => {
            if (num === previewCounter) {
                // avoid rendering results for previous inputs tthat came in later
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
                    results: results,
                })
            }
        })
    }

    handleKeyPress(event) {
        if (event.key === "Enter") {
            matchCommand(this.state.value).then(({results}) => {
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
            })
        }
    }

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
