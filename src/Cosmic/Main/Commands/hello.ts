import { Message, Room } from '../../IO/io.ts';
import { ParseContext } from '../../Parser/parser.ts';

export const hello_parse = undefined;

export function hello_run(
	room: Room,
	_message: Message,
	_context: ParseContext
) {
	room.send('hello');
}
