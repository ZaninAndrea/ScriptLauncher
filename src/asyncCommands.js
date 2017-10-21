import React from "react"
const rp = require("request-promise")
const wolframtoken = require("./secret.js").wolframToken
const dataURI = require("./dataURIs.js")
export default [
    {
        keys: ["wolfram", "wm"],
        handler: query =>
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
                    return result
                })
                .catch(() => {
                    return "no short answer available"
                }),
    },
    {
        keys: ["word"],
        handler: query => rp("http://setgetgo.com/randomword/get.php"),
        asyncPreview: query => rp("http://setgetgo.com/randomword/get.php"),
    },
    // {
    //     keys: ["mw"],
    //     handler: query =>
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
