const { spawn } = require("child_process");

module.exports = {
  name: "restart",
  usePrefix: true,
  usage: "/restart",
  version: "1.0",
  adminOnly: true,

  async execute({ api, event }) {
    const threadID = event.threadID;

    try {
      // Notify the user that the bot is restarting
      await api.sendMessage("Bot restarting...", threadID);

      // Use setTimeout to delay the bot restart if desired
      setTimeout(() => {
        // Spawn a new process to run index.js again
        spawn("node", ["index.js"], {
          stdio: "inherit", // Inherit the current console output
        });

        // Exit the current bot process
        process.exit(1);
      }, 3000); // 3 seconds delay before restarting
    } catch (err) {
      console.error("❌ Error during restart:", err);
      return api.sendMessage("❌ Failed to restart the bot.", threadID);
    }
  }
};