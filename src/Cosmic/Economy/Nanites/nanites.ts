import { db } from "../../DB/db.ts";

/**
 * Retrieves the nanite points for a given ID.
 *
 * @param {string} id - The ID of the nanite.
 * @return {Promise<number>} The nanite points for the given ID. If no nanite points are found, returns 0.
 */
export async function getNanitePoints(id:string):Promise<number> {
	return (await db.get(['nanites', id])).value as number || 0;
}

/**
 * Checks if the user with the given ID has enough Nanite points to make a purchase.
 * If they do, returns an object with a method to execute the purchase.
 * If they don't, returns undefined.
 *
 * @param {string} id - The ID of the user.
 * @param {number} amount - The amount of Nanite points required for the purchase.
 * @return {object | undefined} - An object with a `buy` method to execute the purchase, or undefined if the user does not have enough Nanite points.
 */
export async function purchase(id:string, amount:number) {
	if (await getNanitePoints(id) >= amount) {
		return {
			async buy() {
				await (db.atomic().sum(['nanites', id], BigInt(-amount)).commit());
			}
		}
	} else {
		return undefined;
	}
}

export async function donate(id:string, amount:number) {
	if (amount < 0) {
		return;
	}

	await (db.atomic().sum(['nanites', id], BigInt(amount)).commit());
}
