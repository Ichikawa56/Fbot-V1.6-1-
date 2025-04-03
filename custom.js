const cron = require('node-cron');

const scheduleTasks = (ownerID, api, config = { autoRestart: true, autoGreet: false }) => {
    console.log("✅ Auto-restart and auto-greet scheduler initialized.");

    // 📌 Auto-Restart at 6AM, 12PM, 6PM, 12AM
    if (config.autoRestart) {
        const restartTimes = ['0 6 * * *', '0 12 * * *', '0 18 * * *', '0 0 * * *'];

        restartTimes.forEach(time => {
            cron.schedule(time, () => {
                api.sendMessage("🔄 Bot is restarting automatically...", ownerID, () => {
                    console.log(`🔄 Scheduled restart at ${time}`);
                    process.exit(1);
                });
            }, { timezone: "Asia/Manila" }); // Change timezone as needed
        });

        console.log("✅ Auto-restart scheduler started.");
    } else {
        console.log("❌ Auto-restart is disabled.");
    }

    // 📌 Auto-Greet Schedule
    if (config.autoGreet) {
        const greetings = [
            { cronTime: '0 5 * * *', messages: [`Good morning! Have a great day ahead! ☀️`] },
            { cronTime: '0 8 * * *', messages: [`⏰ Time Check: 8:00 AM! Wishing everyone a great morning! 😊`] },
            { cronTime: '0 10 * * *', messages: [`Hello everyone! How’s your day going so far? 🤗`] },
            { cronTime: '0 12 * * *', messages: [`🍽️ Lunchtime reminder! Take a break and enjoy your meal.`] },
            { cronTime: '0 14 * * *', messages: [`📌 Stay focused! Don't forget your important tasks for today.`] },
            { cronTime: '0 18 * * *', messages: [`🌆 Good evening! Hope you had a productive day!`] },
            { cronTime: '0 20 * * *', messages: [`🌙 The day is almost over, take time to relax and recharge.`] },
            { cronTime: '0 22 * * *', messages: [`😴 Good night, everyone! Sleep well and sweet dreams.`] },
        ];

        // Function to send greetings
        greetings.forEach(greet => {
            cron.schedule(greet.cronTime, () => {
                const message = greet.messages.join('\n');
                api.getThreadList(10, null, ["INBOX"], (err, threads) => {
                    if (err) return console.error("❌ Error fetching thread list:", err);
                    threads.forEach(thread => {
                        api.sendMessage(message, thread.threadID);
                    });
                });
                console.log(`📢 Sent scheduled message: ${message}`);
            }, { timezone: "Asia/Manila" });
        });

        console.log("✅ Auto-greet messages scheduled.");
    } else {
        console.log("❌ Auto-greet is disabled.");
    }
};

module.exports = scheduleTasks;
