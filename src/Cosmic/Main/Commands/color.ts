import { db } from "../../DB/db.ts";
import { Message, Room } from "../../IO/io.ts";
import { Flowpoint, ParseContext } from "../../Parser/parser.ts";
import { getUserID, getUserIDFromString } from "../Utilities/user.ts";

export const color_parse = {
	type: 'optional',
	next: {
		type: 'string',
		next: undefined
	}
} satisfies Flowpoint;

export let latestUserMessages: Record<string, Message> = {};
export let usernameToUserID: Record<string, string> = {};

try {
	latestUserMessages = (await db.get(['latestUserMessages'])).value as Record<string, Message>;
	if (!latestUserMessages) {
		latestUserMessages = {};
	}
} catch {
	// ignore
}

try {
	usernameToUserID = (await db.get(['usernameToUserID'])).value as Record<string, string>;
	if (!usernameToUserID) {
		usernameToUserID = {};
	}
} catch {
	// ignore
}

export async function saveUserData() {
	await db.set(['usernameToUserID'],usernameToUserID);
	await db.set(['latestUserMessages'], latestUserMessages);
}

export function color_run(room: Room, message:Message, context: ParseContext) {
	const id = getUserIDFromString(context.strings[0] || getUserID(message), room);

	if (id in latestUserMessages) {
		room.send(`${latestUserMessages[id].username}'s color is ` + latestUserMessages[id].color);
	} else {
		room.send('I don\'t know what color that user users yet!');
	}
}
