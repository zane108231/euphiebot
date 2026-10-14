require("dotenv").config();

module.exports = {
    nodes: [
        {
            host: "160.191.77.60",
            password: "zealooser",
            port: 6393,
            secure: false,
            name: "Main",
        },
        {
            host: "160.191.77.60",
            password: "zealooser",
            port: 6393,
            secure: false,
            name: "Mai2",
        },
        {
            host: "160.191.77.60",
            password: "zealooser",
            port: 6393,
            secure: false,
            name: "Mai3",
        },
    ],

    prefix: "e!",

    defaultSearchPlatform: "ytsearch",
    restVersion: "v4",

    accentColor: 0x2b2d31,
    statusWebhookUrl: process.env.STATUS_WEBHOOK_URL,

    musicard: {
        theme: "Bloom",
        progressBarColor: "#FACC15",
        backgroundColor: "#2b2d31",
    },
};
