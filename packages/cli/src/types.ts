export interface Message {
	id: number;
	role: "user" | "assistant" | "system";
	text: string;
	ts: Date;
}
