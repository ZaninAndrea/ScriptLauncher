const rp = require("request-promise")

module.exports = [
    {
        keys: ["word"],
        handler: query => rp("http://setgetgo.com/randomword/get.php"),
        asyncPreview: query => rp("http://setgetgo.com/randomword/get.php"),
    },
]
