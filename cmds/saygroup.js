const config = require('../config.json');

module.exports = {
    name: "saygroup",
    description: "Broadcast a message to all groups as the owner.",
    usePrefix: true,
    adminOnly: true,

    execute: async ({ api, event, args }) => {
        const senderID = event.senderID;
        const botAdmins = Array.isArray(config.botAdmins) ? config.botAdmins : [config.botAdmins];

        // 🔒 Check if sender is a bot admin
        if (!botAdmins.includes(senderID)) {
            return api.sendMessage("⛔ Only the bot owner or admins can use this command.", event.threadID);
        }

        // 📝 Ensure a message is provided
        if (args.length === 0) {
            return api.sendMessage("❌ Usage: /saygroup <message>", event.threadID);
        }

        const message = args.join(" ");
        const ownerName = config.ownerName || "The Owner";

        try {
            // 📡 Get all threads (inbox, groups, etc.)
            const threads = await api.getThreadList(100, null, ['INBOX']);
            const groupThreads = threads.filter(t => t.isGroup && t.name);

            if (groupThreads.length === 0) {
                return api.sendMessage("⚠️ No group chats found to send the message.", event.threadID);
            }

            const broadcastMsg = `📢 Message from Bot Admin:\n\n${message}`;

            for (const thread of groupThreads) {
                await api.sendMessage(broadcastMsg, thread.threadID);
            }

            return api.sendMessage(`✅ Message broadcasted to ${groupThreads.length} groups.`, event.threadID);
        } catch (err) {
            console.error("❌ Broadcast error:", err);
            return api.sendMessage("❌ Failed to broadcast message.", event.threadID);
        }
    }
};
