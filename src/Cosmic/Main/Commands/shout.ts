import { Message, Room } from "../../IO/io.ts";
import { Flowpoint, ParseContext } from "../../Parser/parser.ts";
import figlet from 'npm:figlet';
import escape from 'npm:markdown-escape';

export const shout_parse = {
	type: 'string',
	next: undefined,
} satisfies Flowpoint;

export function shout_run(room: Room, _message: Message, context: ParseContext) {
	const output = figlet.textSync(context.strings[0]);
	const escaped = escape(output);

	room.send(escaped);
}
