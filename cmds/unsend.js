module.exports = {
    name: "unsend",
    usePrefix: false,
    usage: "unsend (reply to bot message)",
    version: "1.1",

    execute: async ({ api, event }) => {
        if (!event.messageReply) {
            return api.sendMessage("⚠️ Please reply to a bot message to unsend it.", event.threadID, event.messageID);
        }

        const { messageReply } = event;

        // Check if the replied message was sent by the bot
        if (messageReply.senderID !== api.getCurrentUserID()) {
            return api.sendMessage("⚠️ You can only unsend bot messages!", event.threadID, event.messageID);
        }

        try {
            await api.unsendMessage(messageReply.messageID);
            console.log(`✅ Message unsent: ${messageReply.messageID}`);
        } catch (error) {
            console.error("❌ Error unsending message:", error);
            api.sendMessage("❌ Failed to unsend the message.", event.threadID, event.messageID);
        }
    },
};
