import { red } from 'chalk';
import { Handler } from '../../types';

export const execute: Handler['execute'] = (
	_client,
	error: Error,
	id: number
) => {
	console.log(red(`[Shard ${id}]`), error);
};
