import { Message, Room } from "../../IO/io.ts";
import { ParseContext } from "../../Parser/parser.ts";
import { getUserData } from "../Utilities/user.ts";
import { madDash } from "../cosmic.ts";
import words from "npm:an-array-of-english-words" assert { type: "json" };

export const maddash_parse = undefined;

export async function maddash_run(room: Room, _message: Message, _context: ParseContext) {
	if (!madDash.game) {
		madDash.game = {
			smallest: 'a'.repeat(4196),
			smallestAuthor: '',
			words: new Array(5).fill('').map(_ => words[Math.floor(Math.random() * words.length)]),
			players: new Set(),
		}

		room.send('starting a mad dash in **f i v e**');

		await new Promise((resolve) => setTimeout(resolve, 1000));

		room.send('**f o u r**');

		await new Promise((resolve) => setTimeout(resolve, 1000));

		room.send('**t h r e e**');

		await new Promise((resolve) => setTimeout(resolve, 1000));

		room.send('**t w o**');

		await new Promise((resolve) => setTimeout(resolve, 1000));

		room.send('**o n e**');

		await new Promise((resolve) => setTimeout(resolve, 1000));

		room.send(`**🏁 Go!**
Mad dash has started!
Create the shortest possible message that contains the following words:
${madDash.game.words.map(i => `- **${i}**`).join('\n')}

You have 30 seconds!`);

		setTimeout(() => {
			const game = madDash.game;

			if (!game) {
				return;
			}

			madDash.game = undefined;
			
			if (game.smallestAuthor) {
				room.send(`🌟 The winner is **${getUserData(game.smallestAuthor)?.username}**!
They wrote '${game.smallest}', which is only ${game.smallest.length} characters long!
There was ${game.players.size} competitors!`);
			}
		}, 30000);
	} else {
		room.send('Maddash is already running!');
	}
}
