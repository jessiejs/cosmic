import { db } from "../../DB/db.ts";
import { purchase } from "../Nanites/nanites.ts";

/**
 * Retrieves the last premium timestamp for the specified ID.
 *
 * @param {string} id - The ID of the record to retrieve the last premium timestamp for.
 * @return {number} The last premium timestamp for the specified ID. Returns 0 if no premium timestamp is found.
 */
export async function getLastPremiumMs(id:string) {
	return (await db.get(['premiumMs', id])).value as number || 0;
}

/**
 * Retrieves the remaining premium time for a given ID.
 *
 * @param {string} id - The ID of the user.
 * @return {number} The remaining premium time in milliseconds.
 */
export async function getPremiumTime(id:string) {
	let time = (await db.get(['premium', id])).value as number || 0;
	const millisSinceRenew = Date.now() - await getLastPremiumMs(id);
	const monthsSinceRenew = millisSinceRenew / (1000 * 60 * 60 * 24 * 30);
	
	time -= monthsSinceRenew;

	if (time < 0) {
		time = 0;
	}

	return time;
}

/**
 * Buys a premium subscription for a user.
 *
 * @param {string} id - The ID of the user.
 * @param {number} targetTime - The target time for the premium subscription.
 * @return {object} - An object with a method `buy()` that renews the premium time, sets the new time, and makes the purchase.
 */
export async function buyPremium(id:string, targetTime:number) {
	const monthsCurrent = await getPremiumTime(id);
	const monthsPurchasing = targetTime - monthsCurrent;

	if (monthsPurchasing < 0) {
		throw `You've already bought that much!`;
	}

	const nanites = monthsPurchasing * 250;

	const purchased = await purchase(id, nanites);

	if (!purchased) {
		throw `You don't have enough nanites!`;
	}

	return {
		async buy() {
			// renew time
			await db.set(['premiumMs', id], Date.now());

			// set new time
			await db.set(['premium', id], monthsPurchasing);

			// buy
			await purchased.buy();
		}
	}
}

/**
 * Retrieves the premium information for a given ID.
 *
 * @param {string} id - The ID of the user.
 * @return {Object} - An object containing the premium time and tier.
 */
export async function getPremium(id:string) {
	const time = await getPremiumTime(id);
	let tier = PremiumTier.None;

	if (time > 1) {
		tier = PremiumTier.Turbo;
	}

	return {
		time,
		tier
	}
}

export enum PremiumTier {
	None = 0,
	Turbo = 1,
}
