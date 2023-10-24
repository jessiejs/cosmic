import { Message, Room } from '../../IO/io.ts';
import { ParseContext } from '../../Parser/parser.ts';
import { prefix } from '../cosmic.ts';

export const help_parse = undefined;

export function help_run(
	room: Room,
	_message: Message,
	_context: ParseContext
) {
	const text = `**🔮 Cosmic Help**

${[...helpCommands]
	.map(
		c => `- ${c[1].emoji}  **${prefix}${c[0]}**: ${c[1].description}
	Syntax: ${prefix}${c[1].syntax}`
	)
	.join('\n\n')}`;

	room.send(text);
}

export function htmlToDataURL(html: string) {
	return `data:text/html;base64,${btoa(html)}`;
}

export function createHTMLForCommand(command: {
	emoji: string;
	name: string;
	description: string;
	syntax: string;
}) {
	return `<!DOCTYPE html>
<html>
<head>
	<title>${prefix}${command.name}</title>
	<style>
		body {
			padding: 50px 100px;
			background-color: #111;
			color: #fff;
			font-family: monospace;
		}
	</style>
</head>
<body>
<h1>${prefix}${command.name}</h1>
<p>${command.description}</p>
<p>${prefix}${command.syntax}</p>
</body>
</head>`;
}

export const helpCommands: Map<
	string,
	{
		emoji: string;
		name: string;
		description: string;
		syntax: string;
	}
> = new Map([
	[
		'help',
		{
			emoji: '🆘',
			name: 'help',
			description: 'Show this help message.',
			syntax: 'help',
		},
	],
	[
		'color',
		{
			emoji: '🎨',
			name: 'color',
			description:
				'Shows the color of a user, or your color if none is specified.',
			syntax: 'color <user (optional)>',
		},
	],
	[
		'hello',
		{
			emoji: '👋',
			name: 'hello',
			description: 'Says hello.',
			syntax: 'hello',
		},
	],
	[
		'id',
		{
			emoji: '🆔',
			name: 'id',
			description:
				'Shows the id of a user, or your id if none is specified.',
			syntax: 'id <user (optional)>',
		},
	],
	[
		'info',
		{
			emoji: 'i️',
			name: 'info',
			description:
				'Shows the info of a user, or your info if none is specified.',
			syntax: 'info <user (optional)>',
		},
	],
	[
		'streak',
		{
			emoji: '🐬',
			name: 'streak',
			description: 'Continue the streak, will you break it?',
			syntax: 'streak',
		},
	],
	[
		'poem',
		{
			emoji: '📕',
			name: 'poem',
			description: 'Says a poem.',
			syntax: 'poem <word>',
		},
	],
	[
		'joke',
		{
			emoji: '🤪',
			name: 'joke',
			description: 'Says a joke.',
			syntax: 'joke',
		},
	],
	[
		'dash',
		{
			emoji: '🏃‍♀️',
			name: 'dash',
			description: 'Starts a mad dash.',
			syntax: 'dash',
		},
	],
]);
