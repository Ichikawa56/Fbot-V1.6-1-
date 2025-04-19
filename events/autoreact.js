module.exports = {
    name: "message", // listens for all messages
    async execute({ api, event }) {
      if (!event.body) return;
  
      const msg = event.body.toLowerCase();
      const threadID = event.threadID;
      const messageID = event.messageID;
  
      const reactions = [
        { keyword: "iloveyou", emoji: "💗" },
        { keyword: "good night", emoji: "💗" },
        { keyword: "good morning", emoji: "😆" },
        { keyword: "pakyo", emoji: "🤬" },
        { keyword: "mahal", emoji: "💗" },
        { keyword: "mwa", emoji: "💗" },
        { keyword: "😢", emoji: "😢" },
        { keyword: "😆", emoji: "😆" },
        { keyword: "😂", emoji: "😆" },
        { keyword: "🤣", emoji: "😆" },
        { keyword: "tangina", emoji: "😡" },
        { keyword: "good afternoon", emoji: "❤" },
        { keyword: "good evening", emoji: "❤" },
        { keyword: "gago", emoji: "😡" }
      ];
  
      for (const reaction of reactions) {
        if (msg.includes(reaction.keyword)) {
          return api.setMessageReaction(reaction.emoji, messageID, () => {}, true);
        }
      }
    }
  };
  