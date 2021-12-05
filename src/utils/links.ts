import { Permissions } from 'discord.js';
import { Client } from '../types';

/**
 * Links used to display in for example the help command
 */
export const links = {
	support: 'https://discord.gg/rrfDTbcPvF',
	privacyPolicy:
		'https://github.com/CarelessInternet/NodeBot/blob/main/privacy_policy.md',
	termsOfService:
		'https://github.com/CarelessInternet/NodeBot/blob/main/terms_of_service.md',
	topGGVote: `https://top.gg/bot/${process.env.DISCORD_CLIENT_ID}/vote`,
	inviteLink: (client: Client) => {
		return client.generateInvite({
			permissions: [Permissions.FLAGS.ADMINISTRATOR],
			scopes: ['bot', 'applications.commands']
		});
	}
};
