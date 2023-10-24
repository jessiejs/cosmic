import { getNanitePoints } from "../../Economy/Nanites/nanites.ts";
import { buyPremium } from "../../Economy/Premium/premium.ts";
import { Message, Room } from "../../IO/io.ts";
import { Flowpoint, ParseContext } from "../../Parser/parser.ts";
import { getUserID } from "../Utilities/user.ts";

export const premium_parse:Flowpoint = {
	type: "optional",
	next: {
		type: "tree",
		tree: {
			buy: {
				type: 'string',
				next: undefined
			}
		}
	}
}

export async function premium_run(room: Room, message: Message, context: ParseContext) {
	if (context.trees[1] == 'buy') {
		const tier = context.strings[0];

		if (tier != 'turbo') {
			throw `You can only buy the turbo tier`;
		}

		const purchase = await buyPremium(getUserID(message), 2);

		await purchase.buy();

		room.send(`🌹 You just purchased Cosmic ${({
			'turbo': 'Turbo'
		})[tier]}!
You were charged ${Math.ceil(purchase.nanites)} nanites.
You now have ${await getNanitePoints(getUserID(message))} nanites.

Thanks for using Cosmic!`);
	}
}
