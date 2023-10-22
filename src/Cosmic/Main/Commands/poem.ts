import words from 'npm:an-array-of-english-words' assert { type: 'json' };
import { Message, Room } from '../../IO/io.ts';
import { Flowpoint, ParseContext } from '../../Parser/parser.ts';

export const poem_parse = {
	type: 'string',
	next: undefined
} satisfies Flowpoint;

export function poem_run(room: Room, _message: Message, context: ParseContext) {
	if (context.strings[0].length > 12) {
		room.send('Please no spam :)');
		return;
	}

	if (context.strings[0].trim().toLowerCase() == "fake jessie") {
		room.send(`**f** ucking
**a** sshole
**k** iddie
**e** ntertaining

**j** - i give up`);
		return;
	}

	const output:string[] = [];

	for (const char of context.strings[0]) {
		const wordsStartingWithChar = (words as string[]).filter(word => word.startsWith(char.toLowerCase()));

		if (wordsStartingWithChar.length > 0) {
			output.push("**" + char + "** " + wordsStartingWithChar[Math.floor(Math.random() * wordsStartingWithChar.length)].slice(1));
		} else {
			output.push(char);
		}
	}

	room.send(output.join('\n'));
}
