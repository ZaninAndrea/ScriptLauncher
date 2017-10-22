import React from "react"
import rp from "request-promise"
import mathjs from "mathjs"
import katex from "katex"

const {clipboard} = window.require("electron")
const wolframtoken = require("./secret.js").wolframToken
const dataURI = require("./dataURIs.js")

export default [
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
                    height="50px"
                    src={dataURI.wr}
                />
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
                    height="50px"
                    src={dataURI.en_it}
                />
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
                    height="50px"
                    src={dataURI.it_en}
                />
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
                                    height="50px"
                                    src={dataURI.wolfram}
                                />
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
