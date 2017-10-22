import React, {Component} from "react"
import "./App.css"
import ReactCSSTransitionGroup from "react-addons-css-transition-group" // ES6
import matchCommand from "./utilities/matchCommand.js"

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

let previewCounter = 0

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
            if (event.ctrlKey) {
                alert("expand")
            } else if (this.state.results.length !== 0) {
                this.state.results[this.state.selected].enterHandler(
                    this.state.value.substring(
                        this.state.value.split(" ")[0].length + 1
                    )
                )
                this.setState({value: "", results: []})
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            this.setState(state => ({
                selected: Math.max(state.selected - 1, 0),
            }))
        } else if (event.key === "ArrowDown") {
            event.preventDefault()
            this.setState(state => ({
                selected: Math.min(
                    state.selected + 1,
                    state.results.length - 1
                ),
            }))
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
                    onKeyDown={this.handleKeyPress}
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
                            {result.preview
                                ? result.preview(
                                      this.state.value.substring(
                                          this.state.value.split(" ")[0]
                                              .length + 1
                                      )
                                  )
                                : result.keys[0] +
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
