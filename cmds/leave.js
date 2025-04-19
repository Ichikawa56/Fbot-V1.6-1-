const axios = require("axios");

module.exports = {
    name: "leave",
    usePrefix: false,
    usage : "leave",
    version: "1.0",
    adminOnly: true,
    
    async execute({ api, event, args }) {
      let threadID = event.threadID;
      
      if (args.length > 0) {
        const inputID = parseInt(args.join(""));
        if (!isNaN(inputID)) threadID = inputID;
      }
  
      try {
        await api.sendMessage("Goodbye guys 👋", threadID);
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      } catch (err) {
        console.error("❌ Error while leaving group:", err);
        return api.sendMessage("❌ Couldn't leave the group. Check permissions or thread ID.", event.threadID);
      }
    }
  };
  