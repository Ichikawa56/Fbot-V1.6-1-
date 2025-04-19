const fs = require("fs");

module.exports = {
    name: "bot",
    usePrefix: false,
    usage: "bot",
    version: "1.0",

    execute: async ({ api, event}) => {
        const { messageID } = event;
    api.setMessageReaction("🤖", messageID, () => {}, true);

    const msg = {
        body: `Ano?`,
        attachment: fs.createReadStream("438231484_7439749482786131_2875688872424344802_n.jpg"),
    };

api.sendMessage(msg, event.threadID);
    }
};
