const request = require("request")

module.exports = [
    {
        keys: ["wr"],
        handler: query =>
            window.open(
                "https://www.wolframalpha.com/input/?i=" +
                    encodeURIComponent(query)
            ),
        preview: query => "wordreference " + query,
    },
]
