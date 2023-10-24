export type ChatContext = {
	messages: {
		user: 'ai' | 'user';
		content: string;
		name?: string;
	}[];
	systemMessage: string;
};
