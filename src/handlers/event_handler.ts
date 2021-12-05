import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { Handler } from '../types';

export const execute: Handler['execute'] = (client) => {
	const loadDirectories = async (dir: string) => {
		const allFiles = await readdir(resolve(__dirname, `../events/${dir}`));
		const files = allFiles.filter((file) => file.endsWith('.js'));

		for (const file of files) {
			const event: Handler = await import(`../events/${dir}/${file}`);
			const name = file.split('.')[0];

			client[name === 'ready' ? 'once' : 'on'](
				name,
				event.execute.bind(null, client)
			);
		}
	};

	['client', 'server'].forEach((dir) => loadDirectories(dir));
};
