import React from "react"
import Promise from "bluebird"
import {score} from "fuzzaldrin"
import mathjs from "mathjs"
import commands from "./commands.js"
import dataURI from "./dataURIs.js"

const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote
const {spawn} = remote.require("child_process")

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
                enterHandler: () => alert(input.substring(1)),
                preview: () =>
                    result ? result.toString() : "could not evaluate",
            })
        }

        // shell special command
        if (input[0] === ">") {
            results.push({
                keys: [">"],
                enterHandler: () =>
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
                enterHandler: () => ipcRenderer.send("quit"),
                preview: () => "quit",
            })
        }

        // iterates synchronous commands and adds the to results if they are a match
        const query = input.split(" ")[0]
        let asyncQueue = []
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
                if (command.asyncPreview) {
                    asyncQueue.push(
                        command
                            .asyncPreview(
                                input.substring(input.split(" ")[0].length + 1)
                            )
                            .then(preview => {
                                command.preview = () => preview
                                results.push(command)
                            })
                    )
                } else {
                    results.push(command) // adds command to the results
                }
            }
        }

        Promise.all(asyncQueue).then(() => {
            results.sort((a, b) => {
                return a.match > b.match ? -1 : 1 // sort in order of confidence
            })

            if (input !== "") {
                results.push({
                    keys: ["search"],
                    enterHandler: query =>
                        window.open(
                            "https://duckduckgo.com/?q=" +
                                encodeURIComponent(input)
                        ),
                    preview: query => (
                        <div style={{height: "100%"}}>
                            <img
                                alt="duckduckgo logo"
                                style={{verticalAlign: "middle"}}
                                height="50px"
                                src={dataURI.duckduck}
                            />
                            {input}
                        </div>
                    ),
                })
            }

            resolve({results: results, num: num})
        })
    })

export default matchCommand
