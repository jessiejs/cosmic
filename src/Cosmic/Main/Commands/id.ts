import { Message, Room } from '../../IO/io.ts';
import { Flowpoint, ParseContext } from '../../Parser/parser.ts';
import {
	getUserData,
	getUserID,
	getUserIDFromString,
} from '../Utilities/user.ts';

export const id_parse = {
	type: 'optional',
	next: {
		type: 'string',
		next: undefined,
	},
} as Flowpoint;

export function id_run(room: Room, message: Message, context: ParseContext) {
	const id = getUserIDFromString(
		context.strings[0] || getUserID(message),
		room
	);
	const info = getUserData(id);

	if (info) {
		room.send(`${info.username}'s id is ` + getUserID(info));
	} else {
		room.send("I don't know that user's id yet!");
	}
}
