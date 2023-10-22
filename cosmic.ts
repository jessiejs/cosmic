import { Room, w96 } from "./src/Cosmic/IO/io.ts";
import { cosmic, name } from "./src/Cosmic/Main/cosmic.ts";

cosmic(w96(name));

//const items:Room[] = [];
//
//for (let i = 0; i < 32; i++) {
//	await new Promise((resolve) => setTimeout(resolve, 1000));
//	items.push(w96('yeehaw'));
//}
//
//while (items.length > 0) {
//	items.at(-1)!.close();
//	items.pop();
//}
