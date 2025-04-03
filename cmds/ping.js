const cron = require("node-cron"); // For scheduling tasks

module.exports = {
    name: "ping",
    usePrefix: true,
    usage: "ping",
    version: "1.2",

    execute: async ({ api, event }) => {
        const { threadID } = event;
        const startTime = Date.now(); // Start time

        api.sendMessage("Pinging...", threadID, (err, info) => {
            if (err) return console.error("❌ Error sending ping message:", err);

            const endTime = Date.now(); // End time
            const ping = endTime - startTime; // Calculate delay

            api.sendMessage(`🏓 Pong! Response time: ${ping}ms`, threadID, info.messageID);
        });
    },

    onStart: async ({ api }) => {
        console.log("✅ Auto-ping scheduler started.");

        // Schedule auto-ping every 2 hours
        cron.schedule("0 */2 * * *", async () => {
            try {
                api.getThreadList(10, null, ["INBOX"], (err, threads) => {
                    if (err) return console.error("❌ Error fetching thread list:", err);

                    threads.forEach(thread => {
                        const startTime = Date.now();

                        api.sendMessage("Pinging...", thread.threadID, (err, info) => {
                            if (err) return console.error("❌ Error sending ping message:", err);

                            const endTime = Date.now();
                            const ping = endTime - startTime;

                            api.sendMessage(`🏓 Pong! Response time: ${ping}ms`, thread.threadID, info.messageID);
                        });
                    });
                });

                console.log("🕒 Auto-ping executed.");
            } catch (error) {
                console.error("❌ Error in auto-ping scheduler:", error);
            }
        }, {
            timezone: "Asia/Manila"
        });
    }
};
