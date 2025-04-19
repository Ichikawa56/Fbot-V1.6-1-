const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "sayfl",
    usePrefix: false,
    usage: "sayfl <text>",
    version: "1.0",

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (args.length === 0) {
            return api.sendMessage("⚠️ Pakilagay ang text na gusto mong ipabigkas.\nGamitin: say <text>", threadID, messageID);
        }

        const text = args.join(" ");
        const apiUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=tl&client=tw-ob`;
        const filePath = path.join(__dirname, "tts.mp3");

        try {
            // Indicate processing with reaction
            api.setMessageReaction("🕥", messageID, () => {}, true);

            // Fetch TTS audio from API
            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "stream",
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            // Save audio file
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", async () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                const msg = {
                    body: `🗣️ Sinasabi: "${text}"`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending audio:", err);
                        return api.sendMessage("⚠️ Hindi naipadala ang audio.", threadID);
                    }

                    // Delete file after sending
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading TTS:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Nabigo ang pagproseso ng audio.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ Error fetching TTS:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage(`⚠️ Hindi makuha ang audio. Error: ${error.message}`, threadID, messageID);
        }
    },
};
