const fs = require("fs");
const configPath = "./config.json";

module.exports = {
    name: "prefix",
    usePrefix: false,
    usage: "prefix",
    version: "1.1",
    description: "Displays the bot's prefix and a GIF.",

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;
        
        // Load bot configuration
        const config = JSON.parse(fs.readFileSync(configPath));
        const botPrefix = config.prefix || "/";
        const botName = config.botName || "Made in ChatGPT";
        const gifUrl = "https://media.giphy.com/media/1UwhOK8VX95TcfPBML/giphy.gif";
        
        const message = {
            body: `🤖 Bot Information 🤖\n📌 Prefix: ${botPrefix}\n🆔 Bot Name: ${botName}`,
            attachment: await global.utils.getStreamFromURL(gifUrl)
        };
        
        api.sendMessage(message, threadID, messageID);
    }
};
