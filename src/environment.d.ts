declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
			DISCORD_BOT_TOKEN: string;
			DISCORD_CLIENT_ID: string;
			DISCORD_GUILD_ID: string;
			DISCORD_OWNER_ID: string;
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_CLIENT_SECRET: string;
			WEATHER_API_KEY: string;
			TRACKER_GG_API_KEY: string;
			TOP_GG_TOKEN: string;
			DB_HOST: string;
			DB_USER: string;
			DB_PASSWORD: string;
			DB_DATABASE: string;
			DB_PORT: string;
		}
	}
}

export {};
