module.exports = {
    name: "unban",
    usage: "/unban (list || (userID || index))",
    version: "1.0",

    execute({ api, event, args }) {
        const { threadID, messageID } = event;

        // Load the banned users data
        const bannedUsers = require('./bannedUsers.json');

        if (args.length === 0) {
            return api.sendMessage("❌ Please provide an argument. Usage: /unban (list || (userID || index))", threadID, messageID);
        }

        const firstArg = args[0].toLowerCase();

        if (firstArg === "list") {
            // Show all banned users
            let bannedListMessage = "📜 Here are the list of banned users from all groups:\n";
            bannedUsers.forEach((user, index) => {
                bannedListMessage += `${index + 1}. ${user.name} || ${user.messengerGroupId}\n`;
            });
            bannedListMessage += "\nTo unban a user, kindly type\n\n/unban [user index]\nThis will unban [user name].";
            return api.sendMessage(bannedListMessage, threadID, messageID);
        }

        // Parse the input to handle user IDs or indices
        const unbanTargets = args[0].split(',').map(arg => arg.trim());
        let unbannedCount = 0;

        unbanTargets.forEach(async (target) => {
            let targetUser;

            // Check if the target is a valid index
            if (isNaN(target)) {
                targetUser = bannedUsers.find(user => user.userID === target);
            } else {
                targetUser = bannedUsers[parseInt(target) - 1];
            }

            if (targetUser) {
                // Unban the user (remove from bannedUsers)
                const indexToRemove = bannedUsers.indexOf(targetUser);
                if (indexToRemove !== -1) {
                    bannedUsers.splice(indexToRemove, 1);

                    // Save the updated bannedUsers list to file
                    const fs = require('fs');
                    fs.writeFileSync('./bannedUsers.json', JSON.stringify(bannedUsers, null, 2));

                    // Send unban confirmation message
                    api.sendMessage(`✅ ${targetUser.name} has been unbanned from ${targetUser.messengerGroupId}.`, threadID, messageID);
                    unbannedCount++;
                }
            } else {
                api.sendMessage(`❌ User not found for unban: ${target}`, threadID, messageID);
            }
        });

        // Inform the user how many people were unbanned
        if (unbannedCount > 0) {
            api.sendMessage(`✅ Successfully unbanned ${unbannedCount} user(s).`, threadID, messageID);
        }
    }
};