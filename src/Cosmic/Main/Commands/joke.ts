import { Message } from '../../IO/io.ts';
import { Room } from '../../IO/io.ts';
import { ParseContext } from '../../Parser/parser.ts';

export const joke_parse = undefined;

export async function joke_run(
	room: Room,
	_message: Message,
	_context: ParseContext
) {
	const api = `https://joke.deno.dev/`;

	const joke = await fetch(api).then(r => r.json());

	const text = `${joke.setup}
*${joke.punchline}*`;

	room.send(text);
}
