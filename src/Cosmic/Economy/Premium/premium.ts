import { db } from '../../DB/db.ts';
import { purchase } from '../Nanites/nanites.ts';

/**
 * Retrieves the last premium timestamp for the specified ID.
 *
 * @param {string} id - The ID of the record to retrieve the last premium timestamp for.
 * @return {number} The last premium timestamp for the specified ID. Returns 0 if no premium timestamp is found.
 */
export async function getLastPremiumMs(id: string) {
	return ((await db.get(['premiumMs', id])).value as number) || 0;
}

/**
 * Retrieves the remaining premium time for a given ID.
 *
 * @param {string} id - The ID of the user.
 * @return {number} The remaining premium time in milliseconds.
 */
export async function getPremiumTime(id: string) {
	let time = ((await db.get(['premium', id])).value as number) || 0;
	const millisSinceRenew = Date.now() - (await getLastPremiumMs(id));
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
export async function buyPremium(id: string, targetTime: number) {
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
			await db.set(['premium', id], targetTime);

			// buy
			await purchased.buy();
		},
		nanites,
	};
}

/**
 * Retrieves the premium information for a given ID.
 *
 * @param {string} id - The ID of the user.
 * @return {Object} - An object containing the premium time and tier.
 */
export async function getPremium(id: string) {
	const time = await getPremiumTime(id);
	let tier = PremiumTier.None;

	if (time > 1) {
		tier = PremiumTier.Turbo;
	}

	return {
		time,
		tier,
	};
}

export enum PremiumTier {
	None = 0,
	Turbo = 1,
}

export enum PremiumFeature {
	BombSquadCustomTeam,
	MadDashMods,
}

export const premium_tier_data: Record<PremiumTier, Permissions> = {
	[PremiumTier.None]: {
		name: 'Free',
		description: "You can't see this!",
		dailyNanites: 100,
		features: [],
		emoji: '🆓',
		isHidden: true,
		id: 'free'
	},
	[PremiumTier.Turbo]: {
		name: 'Turbo',
		description:
			'Turbo is the entry-level tier that gives you powerful features.',
		dailyNanites: 250,
		features: [
			PremiumFeature.BombSquadCustomTeam,
			PremiumFeature.MadDashMods,
		],
		emoji: '🔥',
		id: 'turbo'
	},
};

export const feature_names: Record<PremiumFeature, [string, string]> = {
	[PremiumFeature.BombSquadCustomTeam]: ['💣', 'Bomb Squad Team Picker'],
	[PremiumFeature.MadDashMods]: ['🔥', 'Mad Dash Mods'],
};

export type Permissions = {
	name: string;
	description: string;
	isHidden?: boolean;
	dailyNanites: number;
	features: PremiumFeature[];
	emoji: string;
	id: string;
};
