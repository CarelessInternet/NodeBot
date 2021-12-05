import { config } from 'dotenv';
config();

import fg from 'fast-glob';
import { greenBright, magenta } from 'chalk';
import { resolve } from 'path';
import { Command } from '../types';

(async () => {
	const commands = await fg(resolve(__dirname, '../commands/**/*.js'));

	for await (const [i, file] of commands.entries()) {
		const command: Command = await import(file);

		if (!command.data?.name) {
			throw new SyntaxError(
				`Missing a name property for the command file: ${commands[i]}.ts`
			);
		}
		if (!command.category) {
			throw new SyntaxError(
				`Missing a category for the command: ${commands[i]}`
			);
		}
		if (!command.execute) {
			throw new SyntaxError(
				`Missing the execution function for the command: ${command.data.name} (${command.category})`
			);
		}

		console.log(
			`✅ ${magenta('(' + command.category + ')')} ${greenBright(
				command.data.name
			)}`
		);
	}

	process.exit(0);
})();
