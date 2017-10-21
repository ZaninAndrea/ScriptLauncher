import React from "react"

const {clipboard} = window.require("electron")
const rp = require("request-promise")
const dataURI = require("./dataURIs.js")

export default [
    {
        keys: ["wr"],
        handler: query =>
            window.open(
                "http://www.wordreference.com/definition/" +
                    encodeURIComponent(query)
            ),
        preview: query => (
            <div style={{height: "100%"}}>
                <img
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
        handler: query =>
            window.open(
                "http://www.wordreference.com/enit/" + encodeURIComponent(query)
            ),
        preview: query => (
            <div style={{height: "100%", lineHeight: "44px"}}>
                <img
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
        handler: query =>
            window.open(
                "http://www.wordreference.com/iten/" + encodeURIComponent(query)
            ),
        preview: query => (
            <div style={{height: "100%", lineHeight: "44px"}}>
                <img
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
        handler: query => {
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
]
