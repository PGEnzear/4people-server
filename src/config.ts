import dotenv from "dotenv";

import path from "node:path";

const configPathEnv = path.join(__dirname, "..",".env");

dotenv.config({ path: configPathEnv });

const config = {

    WEB: {
        URL: process.env.APP_WEB_URL || "invalid",
    },

	SERVER: {
		PORT: parseInt(process.env.SERVER_PORT || "7070", 10) || 7070,
		HOST: process.env.SERVER_HOST || "localhost",
	},

	GAME: {
		START_TIME: parseInt(process.env.START_TIME || "15", 10) || 15,
	},

    TELEGRAM: {
        TOKEN: process.env.BOT_TOKEN || "invalid",
		BOT_LINK: process.env.BOT_LINK || "https://t.me/",
		CHAT_LINK: process.env.CHAT_LINK || "https://t.me"
    },

	PAYMENT: {
		CRYPTOMUS: {
			CRYPTOMUS_API_KEY: process.env.CRYPTOMUS_API_KEY || "",
			CRYPTOMUS_MERCHANT_ID: process.env.CRYPTOMUS_MERCHANT_ID || ""
		}
	},

};

export default config;