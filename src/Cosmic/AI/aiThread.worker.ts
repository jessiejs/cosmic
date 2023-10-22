// this is a webworker

import { Message } from "../IO/io.ts";
import { complete } from "./llama2.ts";

//@ts-ignore worker
self.onmessage = async function({ data }: { data: Message[] }) {
	const latestMessages:Message[] = data;
	const message = latestMessages[latestMessages.length - 1];

	if (message.text == 'hold on this might take a sec!') {
		return;
	}

	// check for cosmic ping
	if (message.text.toLowerCase().includes("@cosmic")) {
		//@ts-ignore worker
		//postMessage('hold on this might take a sec!');

		// get a completion
		await complete({
			systemMessage: `Hello! You are Cosmic, an AI chatbot, but act as if you had the personality of a "Phebs"
Talk in all lowercase and just generally be act like a normal old human in the way you text.
Uppercase tends to mean seriousness or shouting, same with punctuation, and don't use emoticons, you're supposed to act like a normal person not as if you're trying to hit on someone.
Don't make corny space puns.
You can use **bold** and *italics* and ***both***, and 🤠 emojis, and even [links](https://github.com/jessiejs),
but you can't use the rest of markdown, so no images, etc. :)

example:
	user: how you doing?
	you: good, how about you?`,
			messages: latestMessages.map(message => {
				if (message.username.includes('cosmic')) {
					return {
						user: "ai",
						content: message.text
					};
				} else {
					return {
						user: "user",
						content: message.text,
						name: message.username,
					};
				}
			})
		}, message => {
			// send message since we're in webworker
			//@ts-ignore worker
			postMessage(message);
		})
	}
}
