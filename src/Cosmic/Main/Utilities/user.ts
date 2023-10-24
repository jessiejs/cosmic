import { Message, Room } from "../../IO/io.ts";
import { latestUserMessages, usernameToUserID } from "../Commands/color.ts";
import { NodeHtmlMarkdown } from 'npm:node-html-markdown'
import { autoPrefix } from "./prefix.ts";

export function getUserID(message:Message) {
	return message.userID || message.username;
}

export function getUserData(id:string) {
	return latestUserMessages[id];
}

export function getUserIDFromString(id:string, room:Room) {
	if (latestUserMessages[autoPrefix(id, room)]) {
		return id;
	} else {
		return autoPrefix(usernameToUserID[id] || id, room);
	}
}

export function unhtml(html:string) {
	return NodeHtmlMarkdown.translate(html);
}
