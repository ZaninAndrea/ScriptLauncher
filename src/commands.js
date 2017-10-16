module.exports = [
    {
        keys: ["wolfram", "wm"],
        handler: query =>
            window.open(
                "https://www.wolframalpha.com/input/?i=" +
                    encodeURIComponent(query)
            ),
        preview: query => "wolfram " + query,
    },
    {
        keys: ["wr"],
        handler: query =>
            window.open(
                "http://www.wordreference.com/definition/" +
                    encodeURIComponent(query)
            ),
        preview: query => "WR " + query,
    },
    {
        keys: ["wrenit"],
        handler: query =>
            window.open(
                "http://www.wordreference.com/enit/" + encodeURIComponent(query)
            ),
        preview: query => "WRENIT " + query,
    },
    {
        keys: ["writen"],
        handler: query =>
            window.open(
                "http://www.wordreference.com/iten/" + encodeURIComponent(query)
            ),
        preview: query => "WRITEN " + query,
    },
]
