import React from "react"
import rp from "request-promise"
import mathjs from "mathjs"
import katex from "katex"
import Sherlock from "sherlockjs" // time parsing library

const {clipboard} = window.require("electron")
const wolframtoken = require("./secret.js").wolframToken
const dataURI = require("./dataURIs.js")

const electron = window.require("electron") // little trick to import electron in react
const remote = electron.remote
const Store = remote.require("electron-store")
const factStore = new Store({name: "fact"})

export default [
    {
        keys: ["remember"],
        enterHandler: query => {
            const sherlocked = Sherlock.parse(query)
            const start = new Date()
            const interval = setInterval(() => {
                const now = new Date()
                if (now >= sherlocked.startDate) {
                    alert(sherlocked.eventTitle)
                    clearInterval(interval)
                }
            }, (start - sherlocked.startDate) / 10)
        },
        preview: query => (
            <div style={{height: "100%"}}>
                <img
                    alt="clock"
                    style={{verticalAlign: "middle"}}
                    width="50px"
                    src={dataURI.wr}
                />&nbsp; remember {query}
            </div>
        ),
    },
    {
        keys: ["fact", "fc"],
        enterHandler: query => alert(factStore.get(query)),
        preview: query => (
            <div style={{height: "100%"}}>
                <img
                    alt="logo wr"
                    style={{verticalAlign: "middle"}}
                    width="50px"
                    src={dataURI.wr}
                />&nbsp;
                {factStore.get(query.trim())}
            </div>
        ),
    },
    {
        keys: ["factAdd", "fcAdd"],
        enterHandler: query => {
            try {
                factStore.set(
                    query.split("=")[0].trim(),
                    query.split("=")[1].trim()
                )
            } catch (e) {
                alert("wrong formatting, use = to create a new fact")
            }
        },
        preview: query => (
            <div style={{height: "100%"}}>
                <img
                    alt="logo wr"
                    style={{verticalAlign: "middle"}}
                    width="50px"
                    src={dataURI.wr}
                />&nbsp; add fact {query}
            </div>
        ),
    },
    {
        keys: ["wr"],
        enterHandler: query =>
            window.open(
                "http://www.wordreference.com/definition/" +
                    encodeURIComponent(query)
            ),
        preview: query => (
            <div style={{height: "100%"}}>
                <img
                    alt="logo wr"
                    style={{verticalAlign: "middle"}}
                    width="50px"
                    src={dataURI.wr}
                />&nbsp;
                {query}
            </div>
        ),
    },
    {
        keys: ["wrenit"],
        enterHandler: query =>
            window.open(
                "http://www.wordreference.com/enit/" + encodeURIComponent(query)
            ),
        preview: query => (
            <div style={{height: "100%", lineHeight: "44px"}}>
                <img
                    alt="logo wrenit"
                    style={{verticalAlign: "middle"}}
                    width="50px"
                    src={dataURI.en_it}
                />&nbsp;
                {query}
            </div>
        ),
    },
    {
        keys: ["writen"],
        enterHandler: query =>
            window.open(
                "http://www.wordreference.com/iten/" + encodeURIComponent(query)
            ),
        preview: query => (
            <div style={{height: "100%", lineHeight: "44px"}}>
                <img
                    alt="logo writen"
                    style={{verticalAlign: "middle"}}
                    width="50px"
                    src={dataURI.it_en}
                />&nbsp;
                {query}
            </div>
        ),
    },
    {
        keys: ["goo.gl", "shorten"],
        enterHandler: query => {
            var options = {
                method: "POST",
                uri:
                    "https://www.googleapis.com/urlshortener/v1/url/?key=" +
                    require("./secret.js").googlToken,
                body: {
                    longUrl: query,
                },
                json: true, // Automatically stringifies the body to JSON
            }

            rp(options).then(res => clipboard.writeText(res.id))
        },
        preview: query => "Shorten " + query,
    },
    {
        keys: ["wolfram", "wm"],
        enterHandler: query =>
            window.open(
                "https://www.wolframalpha.com/input/?i=" +
                    encodeURIComponent(query)
            ),
        asyncPreview: query =>
            rp(
                "https://api.wolframalpha.com/v1/result?i=" +
                    encodeURIComponent(query) +
                    "&appid=" +
                    wolframtoken
            )
                .then(function(result) {
                    try {
                        const node = mathjs.parse(result)
                        const tex = node.toTex()
                        const html = katex.renderToString(tex)
                        return (
                            <div style={{height: "100%"}}>
                                <img
                                    alt="logo wolfram"
                                    style={{verticalAlign: "middle"}}
                                    width="50px"
                                    src={dataURI.wolfram}
                                />&nbsp;
                                <span
                                    dangerouslySetInnerHTML={{__html: html}}
                                />
                            </div>
                        )
                    } catch (e) {
                        console.log(e)
                        return (
                            <div>
                                <img alt="logo wolfram" src={dataURI.wolfram} />
                                {result}
                            </div>
                        )
                    }
                })
                .catch(() => {
                    return "no short answer available"
                }),
    },
    {
        keys: ["word"],
        enterHandler: query => rp("http://setgetgo.com/randomword/get.php"),
        asyncPreview: query => rp("http://setgetgo.com/randomword/get.php"),
    },
    // {
    //     keys: ["mw"],
    //     enterHandler: query =>
    //         window.open(
    //             "https://www.merriam-webster.com/thesaurus/" +
    //                 encodeURIComponent(query)
    //         ),
    //     asyncPreview: query =>
    //         rp(
    //             "http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/" +
    //                 encodeURIComponent(query) +
    //                 "?key=05935704-c40b-4514-a43a-913757cebf5c"
    //         )
    //             .then(function(xml){
    //                 return <div><image src="https://assets2.merriam-webster.com/mw/static/app-standalone-images/MW_logo.png" />BOH</div>
    //             })
    //             .catch(function(e){
    //                 return "not found"
    //             }),
    // },
]
