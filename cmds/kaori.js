const config = require('../config.json');  // Import the config file

module.exports = {
    name: "kaori",
    usePrefix: false,
    usage: "kaori",
    version: "1.0",
    execute: async ({ api, event, args }) => {
        try {
            // Fetch the owner details from the config
            const ownerName = config.ownerName || "Theophilus Vonderstein"; // Default to "Theophilus Vonderstein" if not set
            const ownerOne = config.ownerOne; // Assuming `ownerID` is in the config
            const ownerTwo = config.ownerTwo;
            const botName = config.botName || "HoriBot V2";  // Default bot name if not set

            // Message content
            const message = `
                Hi, I'm ${botName} 🤖, I was built in NodeJS and JavaScript, using wc3-fca as a login system.

Here's some information about me:

- Prefix: ${config.prefix || '/'} 
- Owners: ${ownerName}
https://www.facebook.com/profile.php/?id=${ownerOne}
https://www.facebook.com/profile.php/?id=${ownerTwo}

Feel free to ask me anything, I'm here to assist you!
            `;

            // Send the message to the user
            api.sendMessage(message, event.threadID);

        } catch (error) {
            console.error("❌ Error in 'kaori' command:", error);
            api.sendMessage("❌ An error occurred while fetching the information.", event.threadID);
        }
    }
};