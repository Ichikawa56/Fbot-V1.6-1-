const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "post",
    usePrefix: false,
    usage: "post <message> (or reply with an image attachment)",
    version: "1.5",
    description: "Creates a Facebook post with a message and optional attachment.",

    execute: async ({ api, event, args }) => {
        const { threadID, messageID, messageReply, attachments } = event;
        let postMessage = args.join(" ");
        let files = [];

        try {
            // Collect attachments from replied message or direct attachments
            const allAttachments = messageReply?.attachments?.length ? messageReply.attachments : attachments || [];

            // Download attachments if available
            for (const attachment of allAttachments) {
                const filePath = path.join(__dirname, attachment.filename);

                const fileResponse = await axios({
                    url: attachment.url,
                    method: "GET",
                    responseType: "stream",
                    headers: { "User-Agent": "Mozilla/5.0" }
                });

                const writer = fs.createWriteStream(filePath);
                fileResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                files.push(fs.createReadStream(filePath));
            }

            // Prepare post data
            const postData = { body: postMessage };
            if (files.length > 0) postData.attachment = files;

            // Create the post
            api.createPost(postData)
                .then((url) => {
                    api.sendMessage(
                        `✅ Post created successfully!\n🔗 ${url || "No URL returned."}`,
                        threadID,
                        messageID
                    );
                })
                .catch((error) => {
                    const errorUrl = error?.data?.story_create?.story?.url;
                    if (errorUrl) {
                        return api.sendMessage(
                            `✅ Post created successfully!\n🔗 ${errorUrl}\n⚠️ (Note: Post created with server warnings)`,
                            threadID,
                            messageID
                        );
                    }

                    let errorMessage = "❌ An unknown error occurred.";
                    if (error?.errors?.length > 0) {
                        errorMessage = error.errors.map((e) => e.message).join("\n");
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    api.sendMessage(`❌ Error creating post:\n${errorMessage}`, threadID, messageID);
                })
                .finally(() => {
                    // Delete temporary files after post is processed
                    files.forEach((file) => fs.unlink(file.path, (err) => {
                        if (err) console.error("❌ Error deleting file:", err);
                    }));
                });

        } catch (error) {
            console.error("❌ Error processing post:", error);
            api.sendMessage("❌ An error occurred while creating the post.", threadID, messageID);
        }
    }
};
