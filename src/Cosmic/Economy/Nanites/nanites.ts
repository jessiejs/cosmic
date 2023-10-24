import { db } from "../../DB/db.ts";

/**
 * Retrieves the nanite points for a given ID.
 *
 * @param {string} id - The ID of the nanite.
 * @return {Promise<number>} The nanite points for the given ID. If no nanite points are found, returns 0.
 */
export async function getNanitePoints(id:string):Promise<number> {
	const points = (await db.get<number>(['nanites', id])).value;
	
	if (!points) {
		return 0;
	}

	return Math.floor(Number(points));
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
	if (amount < 0) {
		return;
	}
	if (await getNanitePoints(id) >= amount) {
		return {
			async buy() {
				const previousMoney = await getNanitePoints(id);

				await db.set(['nanites', id], previousMoney - Math.ceil(amount));
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

	const previousMoney = await getNanitePoints(id);

	await db.set(['nanites', id], previousMoney + Math.ceil(amount));
}
