import { Message, Room } from '../../IO/io.ts';
import { Flowpoint, ParseContext } from '../../Parser/parser.ts';
import {
	getUserData,
	getUserID,
	getUserIDFromString,
} from '../Utilities/user.ts';
import words from 'npm:an-array-of-english-words' assert { type: 'json' };

export const facts_parse = {
	type: 'optional',
	next: {
		type: 'string',
		next: undefined,
	},
} as Flowpoint;

export function facts_run(room: Room, message: Message, context: ParseContext) {
	const id = getUserIDFromString(context.strings[0] || getUserID(message));
	const info = getUserData(id);

	if (info) {
		let output = `**${info.username}'s info**\n`;

		output += `Name: ${info.username}\n`;
		output += `ID: ${getUserID(info)}\n`;
		
		let longestWord = '';

		if (info.userID) {
			for (const word of words) {
				if (info.userID.toLowerCase().includes(word.toLowerCase()) && word.length > longestWord.length) {
					longestWord = word;
				}
			}
		}

		if (longestWord) {
			output += `${info.username}'s ID contains the word ${longestWord}\n`;
		}

		output += `Color: ${info.color}\n`;

		room.send(output);
	} else {
		room.send('I don\'t know that user\'s info yet!');
	}
}
