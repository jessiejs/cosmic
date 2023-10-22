import { Message } from "../../IO/io.ts";
import { latestUserMessages, usernameToUserID } from "../Commands/color.ts";
import { NodeHtmlMarkdown } from 'npm:node-html-markdown'

export function getUserID(message:Message) {
	return message.userID || message.username;
}

export function getUserData(id:string) {
	return latestUserMessages[id];
}

export function getUserIDFromString(id:string) {
	if (latestUserMessages[id]) {
		return id;
	} else {
		return usernameToUserID[id] || id;
	}
}

export function unhtml(html:string) {
	return NodeHtmlMarkdown.translate(html);
}
