module.exports = {
  name: "onStartMessage",

  onStart: async (api) => {
    console.log("🟢 onStartMessage event triggered!");

    const startTime = new Date().toLocaleString();
    const msg = `🤖 Kaori here! I'm now online and ready to entertain~.\n🕒 Started at: ${startTime}`;

    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threads.filter(thread => thread.isGroup);

      for (const thread of groupThreads) {
        await api.sendMessage(msg, thread.threadID);
      }

      console.log(`✅ Sent startup message to ${groupThreads.length} groups.`);
    } catch (err) {
      console.error("❌ Failed to send startup message:", err);
    }
  }
};
