const fs = require("fs");

module.exports = {
    name: "women",
    usePrefix: false,
    usage: "women",
    version: "1.0",

    execute: async ({ api, event }) => {
        const { messageID } = event;
    api.setMessageReaction("☕", messageID, () => {}, true);

    const msg = {
        body: `Women☕☕☕`,
        attachment: fs.createReadStream("women.mp4"),
    };

api.sendMessage(msg, event.threadID);
    }
};
