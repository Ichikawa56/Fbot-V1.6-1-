module.exports = {
    name: "setnick",
    description: "Change the bot's nickname in this group.",
    usePrefix: true,
    adminOnly: false, // change to true if you want admin-only

    execute: async ({ api, event, args }) => {
        const newNickname = args.join(" ");

        if (!newNickname) {
            return api.sendMessage("❌ Please provide a nickname.\nUsage: /setnick <nickname>", event.threadID);
        }

        try {
            const botID = api.getCurrentUserID(); // Get bot's own ID
            await api.changeNickname(newNickname, event.threadID, botID); // Change nickname in this thread
            return api.sendMessage(`✅ Nickname changed to: ${newNickname}`, event.threadID);
        } catch (error) {
            console.error("❌ Failed to change nickname:", error);
            return api.sendMessage("❌ Unable to change the nickname.", event.threadID);
        }
    }
};
