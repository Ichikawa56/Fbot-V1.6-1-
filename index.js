process.on("unhandledRejection", (reason, promise) => {
    console.error("🔴 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("🔴 Uncaught Exception:", err);
});


const fs = require('fs');
const path = require('path');
const express = require('express');
const login = require('ws3-fca');
const scheduleTasks = require('./custom'); // Import scheduled tasks

global.utils = require('./utils');

const app = express();
const PORT = 3000;

const loadConfig = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Missing ${filePath}! Make sure it exists.`);
            process.exit(1);
        }
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error);
        process.exit(1);
    }
};

const config = loadConfig("./config.json");
const botPrefix = config.prefix || "/";

global.events = new Map();
global.commands = new Map();

const loadEvents = () => {
    try {
        const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            if (event.name && (event.execute || event.onStart)) {

                global.events.set(event.name, event);
                console.log(`✅ Loaded event: ${event.name}`);
            }
        }
        console.log(`✅ Loaded ${global.events.size} events.`);
    } catch (error) {
        console.error("❌ Error loading events:", error);
    }
};

const loadCommands = () => {
    try {
        const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./cmds/${file}`);
            if (command.name && command.execute) {
                global.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            }
        }
        console.log(`✅ Loaded ${global.commands.size} commands.`);
    } catch (error) {
        console.error("❌ Error loading commands:", error);
    }
};

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`🌐 Web Server running at http://localhost:${PORT}`);
});

const appState = loadConfig("./appState.json");
const detectedURLs = new Set();

const startBot = async () => {
    try {
        login({ appState }, (err, api) => {
            if (err) {
                console.error("❌ Login failed:", err);
                setTimeout(startBot, 5000);
                return;
            }

            console.clear();
            api.setOptions(config.option);
            console.log("🤖 Bot is now online!");
            const ownerID = config.ownerID || "61571307728777";
            api.sendMessage("🤖 Bot has started successfully!", ownerID);

            global.events.forEach((eventHandler, eventName) => {
                if (eventHandler.onStart) {
                    eventHandler.onStart(api);
                }
            });

            api.listenMqtt(async (err, event) => {
                if (event.type === "event" && global.events.has("event")) {
                    try {
                      await global.events.get("event").execute({ api, event });
                    } catch (error) {
                      console.error("❌ Error handling 'event' type:", error);
                    }
                }
                if (err) {
                    console.error("❌ Error listening to events:", err);
                    return;
                }
                if (!event) {
                    console.warn("⚠️ Event is undefined. Skipping...");
                    return;
                }
                global.commands.forEach(async (cmd) => {
                    if (typeof cmd.onChat === "function") {
                      try {
                        await cmd.onChat({ api, event, message: api, getLang: () => {} });
                      } catch (err) {
                        console.error(`❌ Error in onChat for command '${cmd.config?.name}':`, err);
                      }
                    }
                  });
                if (global.events.has(event.type)) {
                    try {
                        await global.events.get(event.type).execute({ api, event });
                    } catch (error) {
                        console.error(`❌ Error in event '${event.type}':`, error);
                    }
                }

                const urlRegex = /(https?:\/\/[^\s]+)/gi;
                if (event.body && urlRegex.test(event.body)) {
                    const urlCommand = global.commands.get("url");
                    if (urlCommand) {
                        const detectedURL = event.body.match(urlRegex)[0];
                        const threadID = event.threadID;
                        const uniqueKey = `${threadID}-${detectedURL}`;

                        if (detectedURLs.has(uniqueKey)) return;

                        detectedURLs.add(uniqueKey);
                        try {
                            await urlCommand.execute({ api, event });
                        } catch (error) {
                            console.error("❌ Error in URL detection:", error);
                        }

                        setTimeout(() => detectedURLs.delete(uniqueKey), 3600000);
                    }
                }

                if (event.body) {
                    let args = event.body.trim().split(/ +/);
                    let commandName = args.shift().toLowerCase();

                    let command;
                    if (global.commands.has(commandName)) {
                        command = global.commands.get(commandName);
                    } else if (event.body.startsWith(botPrefix)) {
                        commandName = event.body.slice(botPrefix.length).split(/ +/).shift().toLowerCase();
                        command = global.commands.get(commandName);
                    }

                    if (command) {
                        const senderID = event.senderID;
                        const { getRole } = require("./utils/roles");
                        const senderRole = getRole(senderID);
                      
                        // If command defines required role
                        if (command.requiredRole) {
                          const allowedRoles = Array.isArray(command.requiredRole)
                            ? command.requiredRole
                            : [command.requiredRole];
                      
                          if (!allowedRoles.includes(senderRole)) {
                            return api.sendMessage("⛔ You don’t have permission to use this command.", event.threadID);
                          }
                        }
                      
                        if (command.adminOnly && senderRole !== "botAdmin") {
                          return api.sendMessage("⛔ This command is restricted to bot admins.", event.threadID);
                        }
                      }
                      

                    if (command) {
                        if (command.usePrefix && !event.body.startsWith(botPrefix)) return;
                        try {
                            await command.execute({ api, event, args });
                        } catch (error) {
                            console.error(`❌ Error executing command '${commandName}':`, error);
                        }
                    }
                }
            });

            scheduleTasks(ownerID, api, { autoRestart: true, autoGreet: true });
        });
    } catch (error) {
        console.error("❌ Bot crashed. Restarting in 5 seconds...", error);
        setTimeout(startBot, 5000);
    }
};

loadEvents();
loadCommands();
startBot();
