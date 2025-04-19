const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    name: "changeavatar",
    usage: "changeavatar <image_url> OR reply to an image with 'changeavatar'",
    description: "Change the bot's profile picture using an image URL or a replied image.",
    
    execute: async ({ api, event, args }) => {
        let imageUrl;

        // If the user replied to a message with an image
        if (event.messageReply && event.messageReply.attachments.length > 0) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type !== "photo") {
                return api.sendMessage("⚠️ Please reply to an image, not another type of file.", event.threadID, event.messageID);
            }
            imageUrl = attachment.url;
        } else {
            // If the user provided a URL as an argument
            if (args.length === 0) {
                return api.sendMessage("⚠️ Please provide an image URL or reply to an image.\n📌 Usage: changeavatar <image_url>", event.threadID, event.messageID);
            }
            imageUrl = args[0];
        }

        try {
            // Download the image
            const response = await axios.get(imageUrl, { responseType: "stream" });
            const imagePath = path.join(__dirname, "avatar.jpg");

            // Save the image temporarily
            const writer = fs.createWriteStream(imagePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                const imageStream = fs.createReadStream(imagePath);

                // Change profile picture using FCA
                api.changeAvatar(imageStream, "", null, (err) => {
                    // Delete the file after uploading
                    fs.unlinkSync(imagePath);

                    if (err) {
                        console.error("❌ Error changing avatar:", err);
                        return api.sendMessage("❌ Failed to change the avatar. Ensure the image is valid.", event.threadID, event.messageID);
                    }

                    api.sendMessage("✅ Bot avatar changed successfully!", event.threadID, event.messageID);
                });
            });

            writer.on("error", (error) => {
                console.error("❌ Error writing image file:", error);
                api.sendMessage("❌ Failed to process the image.", event.threadID, event.messageID);
            });
        } catch (error) {
            console.error("❌ Error downloading image:", error);
            api.sendMessage("❌ Failed to download the image. Ensure the URL is correct or reply to a valid image.", event.threadID, event.messageID);
        }
    },
};
