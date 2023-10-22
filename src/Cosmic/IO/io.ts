import io from 'npm:socket.io-client';
import { unhtml } from '../Main/Utilities/user.ts';

export type Room = {
	name: string;
	features: Feature[];

	addEventListener(
		name: 'message',
		callback: (message: Message) => void
	): void;
	send(text: string): Promise<void>;

	close(): Promise<void>;

	getCosmicId(): string;
};

export enum Feature {
	Colors,
	UserID,
}

export type Message = {
	text: string;
	color?: string;
	userID?: string;
	username: string;
	date: Date;
};

export function w96(user: string): Room {
	const connection = io('wss://devel.windows96.net:4096');
	const messageHandlers: ((message: Message) => void)[] = [];

	let cosmicId = '';

	setupIO(connection, messageHandlers, user, (id) => {
		cosmicId = id;
	});

	return ({
		addEventListener(name, callback) {
			if (name == 'message') {
				messageHandlers.push(callback);
			}
		},
		send(text) {
			connection.emit('message', { type:'text', content: text });
		},
		close() {
			connection.close();
		},
		features: [Feature.Colors, Feature.UserID],
		getCosmicId() {
			return cosmicId;
		}
	}) as Room;
}

type Socket = ReturnType<typeof io>;

function setupIO(connection:Socket, messageHandlers:((message: Message) => void)[], user:string, callback: (id: string) => void) {
	connection.on('connect', () => {
		console.log('connected');
	});

	connection.on(
		'message',
		({
			color,
			content,
			id,
			user,
			date
		}: {
			content: string;
			user: string;
			color: string;
			id: string;
			date: string;
		}) => {
			for (const handler of messageHandlers) {
				handler({
					color,
					text: unhtml(content),
					userID: id,
					username: user,
					date: new Date(date)
				});
			}
		}
	);

	connection.emit('auth', { user });

	connection.on('disconnect', () => {
		const newConn = io('wss://devel.windows96.net:4096');

		setupIO(newConn, messageHandlers, user, callback);
	})

	connection.on('auth-complete', function (userId: string) {
		callback(userId);
	});
}
