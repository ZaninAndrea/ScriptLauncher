const {clipboard} = window.require("electron")
const rp = require("request-promise")

module.exports = [
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
