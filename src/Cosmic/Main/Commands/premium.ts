import { getNanitePoints } from "../../Economy/Nanites/nanites.ts";
import { buyPremium, feature_names, getPremiumTime, premium_tier_data } from "../../Economy/Premium/premium.ts";
import { Message, Room } from "../../IO/io.ts";
import { Flowpoint, ParseContext } from "../../Parser/parser.ts";
import { getUserID } from "../Utilities/user.ts";
import { prefix } from "../cosmic.ts";

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
	} else {
		// draw info
		let info = `**🌹 Premium**

`;

		const tierTexts:string[] = [];

		for (const t in premium_tier_data) {
			const tier = Number(t) as keyof typeof premium_tier_data;

			const tierData = premium_tier_data[tier];

			if (tierData.isHidden) {
				continue;
			}

			tierTexts.push(`**${tierData.emoji} ${tierData.name}**:
	${tierData.description}
	
	**🥇 Perks**
${tierData.features.map(p => {
	const data = feature_names[p];
	return `		- ${data[0]} ${data[1]}`;
}).join(`\n`)}

	**💵 Buy**
	${await (async ()=>{
		if (await getPremiumTime(getUserID(message)) >= tier + 1) {
			return `You can't buy this, you already have it.`;
		}
		return `buy with ${prefix}premium buy ${tierData.id}`;
	})()}`);
		}

		info += tierTexts.join('\n');

		room.send(info);
	}
}
