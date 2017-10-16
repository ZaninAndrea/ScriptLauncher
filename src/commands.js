module.exports = [
    {
        keys: ["wolfram", "wm"],
        handler: query =>
            window.open(
                "https://www.wolframalpha.com/input/?i=" +
                    encodeURIComponent(query)
            ),
    },
    {
        keys: ["open"],
        handler: query => window.open(encodeURI(query)),
    },
]
