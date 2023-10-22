import { db } from "../../DB/db.ts";
import { Message, Room } from "../../IO/io.ts";
import { ParseContext } from "../../Parser/parser.ts";

export const streak_parse = undefined;

export async function streak_run(room: Room, _message: Message, _context: ParseContext) {
	// only allow once every 5 minutes
	let lastRun = (await db.get(['lastStreakRun'])).value as number;
	if (!lastRun) {
		lastRun = 0;
	}

	if (Date.now() - 30 * 1000 < lastRun) {
		const millisRemaining = lastRun + 30 * 1000 - Date.now();

		room.send(`You can only run this command once every 30 seconds.
You still have to wait ${Math.round(millisRemaining / 1000)} seconds.`);
		return;
	}

	await db.set(['lastStreakRun'], Date.now());

	// read current streak
	let streak = 0;

	try {
		streak = (await db.get(['streak'])).value as number;
		if (!streak) {
			streak = 0;
		}
	} catch {
		// eh
	}

	// increment
	if (Math.random() > 0.5) {
		streak++;
	} else {
		streak = 0;
	}

	// save
	await db.set(['streak'], streak);

	// say
	if (streak > 0) {
		room.send(`We have a streak of ${streak} coin flips!`);
	} else {
		room.send(`Noo, the streak broke.`);
	}
}
