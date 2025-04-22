module.exports = {
    name: "js",
    usage: "js <NodeJS code>",
    version: "1.0",
    usePrefix: true,
    adminOnly: true,

    async execute({ api, event, args }) {
        const { threadID, messageID, senderID } = event;
        const code = args.join(" ");

        if (!code) {
            return api.sendMessage("❌ Please provide code to evaluate.", threadID, messageID);
        }

        try {
            let result = eval(code);
            if (result instanceof Promise) result = await result;
            if (typeof result !== "string") result = require("util").inspect(result, { depth: 0 });

            if (result.length > 2000) result = result.slice(0, 2000) + "\n...output truncated.";

            api.sendMessage(`✅ Result:\n\`\`\`\n${result}\n\`\`\``, threadID, messageID);
        } catch (err) {
            api.sendMessage(`❌ Error:\n\`\`\`\n${err.message}\n\`\`\``, threadID, messageID);
        }
    }
};