import { Room } from '../../IO/io.ts';

export function autoPrefix(text: string, room: Room) {
	if (!text.includes(':')) {
		return room.prefix + ':' + text;
	}
	return text;
}
