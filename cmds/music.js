const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "music",
    usePrefix: false,
    usage: "music [query]",
    version: "1.0",

    async execute({ api, event, args }) {
        const { threadID, messageID } = event;

        if (!args.length) {
            return api.sendMessage("❌ Please provide a song name.\nUsage: music [query]", threadID, messageID);
        }

        const query = encodeURIComponent(args.join(" "));
        const apiUrl = `https://apis-rho-nine.vercel.app/ytsdlmp3?q=${query}`;

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Fetch MP3 URL
            const response = await axios.get(apiUrl);
            if (!response.data || !response.data.download_url) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ No MP3 found for your query.", threadID, messageID);
            }

            const audioUrl = response.data.download_url;
            const fileName = response.data.title || "audio.mp3";
            const filePath = path.join(__dirname, "ytsdlmp3.mp3");

            // Download the MP3 file
            const writer = fs.createWriteStream(filePath);
            const audioResponse = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "stream",
            });

            audioResponse.data.pipe(writer);

            writer.on("finish", () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                const msg = {
                    body: `🎵 Here is your requested song:\n📌 ${fileName}`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending audio:", err);
                        return api.sendMessage("⚠️ Failed to send audio.", threadID);
                    }

                    // Delete the file after sending
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading audio:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download audio.", threadID, messageID);
            });
        } catch (error) {
            console.error("❌ Error fetching audio:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage(`⚠️ Could not fetch the audio. Error: ${error.message}`, threadID, messageID);
        }
    },
};
