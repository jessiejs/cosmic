import { complete } from '../AI/llama2.ts';
import { db } from '../DB/db.ts';
import { Message, Room } from '../IO/io.ts';
import { ParseContext, lex, parse } from '../Parser/parser.ts';
import { color_run, latestUserMessages, saveUserData, usernameToUserID } from './Commands/color.ts';
import { facts_run } from './Commands/facts.ts';
import { hello_run } from './Commands/hello.ts';
import { help_run } from './Commands/help.ts';
import { id_run } from './Commands/id.ts';
import { joke_run } from './Commands/joke.ts';
import { maddash_run } from './Commands/maddash.ts';
import { poem_run } from './Commands/poem.ts';
import { shout_run } from './Commands/shout.ts';
import { streak_run } from './Commands/streak.ts';
import { getUserID } from './Utilities/user.ts';
import { parseTree } from './parseTree.ts';
import tokenizer from 'npm:llama-tokenizer-js';

export const prefix = './';
export const name = `cosmic - ${prefix}help`;
//name = 'Server‍';

export const madDash:{
	game: undefined | {
		words: string[],
		smallest: string,
		smallestAuthor: string,
		players: Set<string>
	}
} = {
	game: undefined
}

export function cosmic(room: Room) {
	let latestMessages:Message[] = [];
	
	room.send('cosmic is running!');

	//let messageWorker = new Worker(new URL('../AI/aiThread.worker.ts', import.meta.url), {
	//	type: 'module'
	//});
//
	//messageWorker.addEventListener('message', (message) => {
	//	room.send(message.data);
	//})

	room.addEventListener('message',async (message) => {
		latestMessages.push(message);

		if (message.text.toLowerCase().includes("@cosmic")) {
			const worker = new Worker(new URL('../AI/aiThread.worker.ts', import.meta.url), {
				type: 'module'
			});

			let isTerminated = false;
			let messageId = 1;

			worker.addEventListener('message', (message) => {
				if (message.data.includes("INST")) {
					room.send('oops, i had a brain fart, fixing myself!')
					latestMessages = [];
				} else {
					room.send(message.data);
				}
				if (messageId == 1) {
					worker.terminate();
					isTerminated = true;
				}
				messageId++;
			});

			setTimeout(() => {
				if (!isTerminated) {
					worker.terminate();
					room.send(`cosmic ai timed out :(`);
				}
			},10000);

			worker.postMessage(latestMessages);
		}
		
		//if (message.text == '@@restart') {
		//	messageWorker = new Worker(new URL('../AI/aiThread.worker.ts', import.meta.url), {
		//		type: 'module'
		//	});
		//
		//	messageWorker.addEventListener('message', (message) => {
		//		room.send(message.data);
		//	})
//
		//	room.send('restarting');
		//}
//
		//messageWorker.postMessage(message);

		while (tokenizer.encode(latestMessages.join('\n')).length > 512) {
			latestMessages.shift();
		}

		if (getUserID(message) === room.getCosmicId() && message.username.toLowerCase().includes('cosmic')) {
			return;
		}
		if (message.username.toLowerCase().includes('cosmic')) {
			room.send(`^ This is not the real cosmic!
 | The message above is from a fake!`);
		}
		if (message.text.includes('💀')) {
			room.send('skull emoji');
		}
		if (!isNaN(Number(message.text))) {
			// get current count
			const count = (await db.get(['count'])).value as number || 0;
			if (message.text == (count + 1).toString()) {
				await db.set(['count'], count + 1);

				room.send(`We're at ${count + 1}
Next message will be ${count + 2}`);
			}
		}
		if (madDash.game) {
			// check if message is valid dash
			let isDash = true;

			for (const word of madDash.game.words) {
				if (!message.text.toLowerCase().includes(word)) {
					isDash = false;
				}
			}

			if (isDash) {
				madDash.game.players.add(getUserID(message));

				if (message.text.length < madDash.game.smallest.length) {
					madDash.game.smallest = message.text;
					madDash.game.smallestAuthor = getUserID(message);
					room.send(`${message.text.length} characters!`)
				} else {
					room.send(`${message.text.length} characters... **but the record is ${madDash.game.smallest.length}!**`)
				}
			}
		}

		// log message temporarily for reasons
		if (latestUserMessages[message.userID || message.username] && latestUserMessages[message.userID || message.username].username !== message.username) {
			room.send(`${latestUserMessages[message.userID || message.username].username} is ${message.username}`);
		}
		latestUserMessages[message.userID || message.username] = message;
		usernameToUserID[message.username] = getUserID(message);

		saveUserData();

		if (message.text.startsWith(prefix)) {
			try {
				const msgWithoutPrefix = message.text.slice(prefix.length);
				const lexed = lex(msgWithoutPrefix);

				const parsed = parse(parseTree, lexed);

				(
					({
						hello: hello_run,
						help: help_run,
						color: color_run,
						id: id_run,
						facts: facts_run,
						info: facts_run,
						streak: streak_run,
						poem: poem_run,
						shout: shout_run,
						joke: joke_run,
						dash: maddash_run
					}) as Record<
						string,
						(room: Room, message:Message, parsed: ParseContext) => void
					>
				)[parsed.trees[0]](room, message, parsed);
			} catch (e) {
				room.send(e.toString());
			}
		}
	});
}
