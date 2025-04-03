const cron = require('node-cron'); // For scheduling tasks

module.exports = {
    name: "autoPost", // Event name
    execute: async (api, event) => {
        // This function will be called when the event is triggered
        console.log("Auto-post event triggered.");
    },
    onStart: async (api) => {
        // Owner's user ID
        const ownerID = "100030880666720";

        // Function to fetch a cat fact from the API
        const fetchCatFact = async () => {
            try {
                const response = await fetch("https://kaiz-apis.gleeze.com/api/catfact");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                return data.fact; // Return only the fact (remove the author)
            } catch (error) {
                console.error("Error fetching cat fact:", error);
                return null;
            }
        };

        // Function to create a post with a cat fact
        const createPost = async () => {
            const catFact = await fetchCatFact();

            if (catFact) {
                api.createPost({ body: catFact })
                    .then((url) => {
                        if (url) {
                            console.log(`✅ Post created successfully!\n🔗 Post URL: ${url}`);
                            // Notify the owner
                            api.sendMessage(
                                `✅ Auto-post created successfully!\n🔗 Post URL: ${url}`,
                                ownerID
                            );
                        } else {
                            console.log("✅ Post created, but no URL was returned.");
                            // Notify the owner
                            api.sendMessage(
                                "✅ Auto-post created, but no URL was returned.",
                                ownerID
                            );
                        }
                    })
                    .catch((error) => {
                        if (error?.data?.story_create?.story?.url) {
                            console.log(
                                `✅ Post created successfully!\n🔗 Post URL: ${error.data.story_create.story.url}\n⚠️ (Note: Post created with server warnings)`
                            );
                            // Notify the owner
                            api.sendMessage(
                                `✅ Auto-post created successfully!\n🔗 Post URL: ${error.data.story_create.story.url}\n⚠️ (Note: Post created with server warnings)`,
                                ownerID
                            );
                        } else {
                            let errorMessage = "❌ An unknown error occurred.";
                            if (error?.errors?.length > 0) {
                                errorMessage = error.errors.map((e) => e.message).join(" ");
                            } else if (error.message) {
                                errorMessage = error.message;
                            }
                            console.log(`❌ Error creating post:\n${errorMessage}`);
                            // Notify the owner
                            api.sendMessage(
                                `❌ Error creating auto-post:\n${errorMessage}`,
                                ownerID
                            );
                        }
                    });
            } else {
                console.log("❌ Failed to fetch cat fact.");
                // Notify the owner
                api.sendMessage("❌ Failed to fetch cat fact for auto-post.", ownerID);
            }
        };

        // Define the auto-post schedules
        const autopostSchedules = [
            { cronTime: '0 6 * * *' }, // 6 AM
            { cronTime: '0 12 * * *' }, // 12 PM
            { cronTime: '0 18 * * *' }, // 6 PM
            { cronTime: '0 0 * * *' }, // 12 AM
        ];

        // Schedule the auto-posts
        for (const schedule of autopostSchedules) {
            cron.schedule(schedule.cronTime, () => {
                console.log(`🕒 Scheduled auto-post triggered at ${schedule.cronTime}.`);
                createPost();
            }, {
                timezone: "Asia/Manila" // Set the timezone to Philippine Time
            });
        }

        console.log("✅ Auto-post scheduler started. Posts will be created at 6 AM, 12 PM, 6 PM, and 12 AM.");
    },
};
