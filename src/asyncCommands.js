const rp = require("request-promise")
const wolframtoken = require("./secret.js").wolframToken
module.exports = [
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
]
