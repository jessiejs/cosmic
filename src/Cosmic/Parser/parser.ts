export type Flowpoint =
	| {
			type: 'static';
			string: string;
			next: Flowpoint;
	  }
	| {
			type: 'string';
			next: Flowpoint;
	  }
	| {
			type: 'number';
			next: Flowpoint;
	  }
	| {
			type: 'boolean';
			next: Flowpoint;
	  }
	| {
			type: 'optional';
			next: Flowpoint;
	  }
	| {
			type: 'tree';
			tree: Record<string, Flowpoint>;
	  }
	| undefined;

export type ParseContext = {
	strings: string[];
	bools: boolean[];
	trees: string[];
};

export function parse(
	flowpoint: Flowpoint,
	tokens: string[],
	context: ParseContext = { strings: [], bools: [], trees: [] }
) {
	if (flowpoint == undefined) {
		if (tokens.length != 0) {
			throw `Extra text! ${tokens.join(' ')}
You probably accidentally wrote something with spaces without using "quotes" around it.`;
		}
		return context;
	}
	if (flowpoint.type == 'string') {
		const token = tokens.shift();

		if (!token) {
			throw `Expected some text, but got nothing.`;
		}

		try {
			const json = JSON.parse(token);

			if (typeof json == 'string') {
				context.strings.push(json);
			} else {
				throw 'eh';
			}
		} catch {
			context.strings.push(token);
		}

		parse(flowpoint.next, tokens, context);
	} else if (flowpoint.type == 'number') {
		const token = tokens.shift();

		if (!token) {
			throw `Expected a number, but got nothing.`;
		}

		const number = Number(token);

		if (isNaN(number)) {
			throw `Expected a number, but got ${token}.`;
		}

		context.trees.push(token);

		parse(flowpoint.next, tokens, context);
	} else if (flowpoint.type == 'boolean') {
		const token = tokens.shift();

		if (!token) {
			throw `Expected a yes/no, but got nothing.`;
		}

		if (
			['yes', 'no', 'true', 'false', 'y', 'n'].includes(
				token.toLowerCase()
			)
		) {
			context.bools.push(
				['yes', 'true', 'y'].includes(token.toLowerCase())
			);
		} else {
			throw `Expected a yes/no, but got ${token}.`;
		}

		parse(flowpoint.next, tokens, context);
	} else if (flowpoint.type == 'optional') {
		if (tokens.length > 0) {
			parse(flowpoint.next, tokens, context);
		}
	} else if (flowpoint.type == 'tree') {
		const key = tokens.shift();

		if (!key) {
			throw `Expected ${Object.keys(flowpoint.tree).join(
				' or '
			)}, but got nothing.`;
		}

		if (!(key in flowpoint.tree)) {
			throw `Expected ${Object.keys(flowpoint.tree).join(
				' or '
			)}, but got '${key}'.`;
		}

		context.trees.push(key);

		parse(flowpoint.tree[key], tokens, context);
	}

	return context;
}

export function lex(input: string) {
	let i = 0;
	let working = '';
	let isInQuotes = false;
	let isEscaped = false;
	const tokens = [];

	while (i < input.length) {
		if (input[i] == '"' && !isEscaped) {
			isInQuotes = !isInQuotes;
		} else if (input[i] == '\\' && !isEscaped) {
			isEscaped = true;
		} else if (input[i] == ' ' && !isEscaped && !isInQuotes) {
			tokens.push(working);
			working = '';
		} else {
			working += input[i];
			isEscaped = false;
		}

		i++;
	}

	if (working != '') {
		tokens.push(working);
	}

	return tokens;
}
