import { Room } from '../IO/io.ts';
import { ChatContext } from './chat.ts';

const fast = 'd24902e3fa9b698cc208b5e63136c4e26e828659a9f09827ca6ec5bb83014381';
const normal =
	'2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf';

function filterMessage(msg: string) {
	if (msg.includes('[/ai]')) {
		return msg
			.slice(0, msg.indexOf('[/ai]'))
			.split('Cosmic:')
			.join('')
			.trim();
	} else {
		return msg.split('Cosmic:').join('').trim();
	}
}

export async function complete(chat: ChatContext, say: (s: string) => void) {
	console.log('chatting');
	console.log(chat);

	const res = await fetch('https://www.llama2.ai/api', {
		credentials: 'omit',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'Content-Type': 'text/plain;charset=UTF-8',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-GPC': '1',
		},
		referrer: 'https://www.llama2.ai/',
		body: JSON.stringify({
			//prompt: "[INST] test [/INST]\n Hello! I'm here to help you with any questions or tasks you may have. Is there something specific you need assistance with, or is there anything you'd like to chat about?\n[INST] test [/INST]\n",
			prompt: chat.messages
				.map(m => {
					if (m.user == 'ai') {
						return `${m.content}\n`;
					} else {
						return `[INST] ${m.name}:
${m.content} [/INST]\n`;
					}
				})
				.join('\n'),
			//prompt: chat.messages.map(m => `[${m.name || m.user}]${m.content}[/${m.name || m.user}]`).join('\n') + '\n[ai]',
			version: normal,
			systemPrompt: chat.systemMessage,
			temperature: 1,
			topP: 0.9,
			maxTokens: 800,
			image: null,
		}),
		method: 'POST',
		mode: 'cors',
	});

	// send a chat message for every sentence
	let toSend = '';

	if (res.status != 200) {
		say(`response failed with error ${res.status}`);
		return;
	}

	const stream = res.body?.getReader();

	if (!stream) {
		return;
	}

	let lastCharPunctuation = false;

	while (true) {
		const { done, value } = await stream?.read();

		if (!value) {
			if (done) {
				break;
			}
			continue;
		}

		for (const char of new TextDecoder().decode(value)) {
			toSend += char;

			await Deno.stdout.write(new TextEncoder().encode(char));

			if (char == '.' || char == '?' || char == '!') {
				if (!lastCharPunctuation) {
					say(filterMessage(toSend));
					await new Promise(resolve => setTimeout(resolve, 200));
					toSend = '';
				}
				lastCharPunctuation = true;
			} else {
				lastCharPunctuation = false;
			}
		}

		if (done || toSend.includes('[/ai]')) {
			break;
		}
	}

	if (toSend.trim() != '') {
		say(filterMessage(toSend));
	}
}
