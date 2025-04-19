module.exports = {
    name: "haha",
    usePrefix: false,
    usage: "haha",
    version: "1.0",

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;
        api.setMessageReaction("😆", messageID, () => {}, true);
        api.sendMessage("Ang saya mo naman, good to know 😁", threadID, messageID);
    }
};
