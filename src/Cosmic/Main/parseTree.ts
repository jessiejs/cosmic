import { Flowpoint } from "../Parser/parser.ts";
import { color_parse } from "./Commands/color.ts";
import { facts_parse } from "./Commands/facts.ts";
import { hello_parse } from "./Commands/hello.ts";
import { id_parse } from "./Commands/id.ts";
import { joke_parse } from "./Commands/joke.ts";
import { maddash_parse } from "./Commands/maddash.ts";
import { poem_parse } from "./Commands/poem.ts";
import { premium_parse } from "./Commands/premium.ts";
import { shout_parse } from "./Commands/shout.ts";
import { streak_parse } from "./Commands/streak.ts";

export const parseTree = {
	type: 'tree',
	tree: {
		hello: hello_parse,
		help: undefined, // weird hack due to how esm works
		color: color_parse,
		id: id_parse,
		facts: facts_parse,
		info: facts_parse,
		streak: streak_parse,
		poem: poem_parse,
		shout: shout_parse,
		joke: joke_parse,
		dash: maddash_parse,
		premium: premium_parse
	}
} satisfies Flowpoint;
