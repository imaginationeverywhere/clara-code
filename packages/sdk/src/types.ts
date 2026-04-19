export type ClaraMessageRole = "user" | "assistant";

export interface ClaraMessage {
	role: ClaraMessageRole;
	content: string;
	voiceUrl?: string;
}

export interface ClaraConfig {
	apiKey: string;
	/**
	 * Clara API gateway URL. Defaults to https://api.claracode.ai
	 * Most developers do not need to set this.
	 */
	gatewayUrl?: string;
	model?: string;
	voice?: string;
}

export interface AgentSession {
	id: string;
	context: string;
	messages: ClaraMessage[];
}

export interface VoiceSession {
	readonly id: string;
	readonly ready: Promise<void>;
	send(text: string): Promise<ClaraMessage>;
	close(): Promise<void>;
}

export interface Agent {
	readonly id: string;
	readonly name: string;
	readonly soul: string;
	ask(prompt: string): Promise<ClaraMessage>;
	stream(prompt: string): AsyncIterable<string>;
}

export interface ClaraClient {
	ask(prompt: string): Promise<ClaraMessage>;
	stream(prompt: string): AsyncIterable<string>;
	startVoice(): VoiceSession;
	createAgent(name: string, soul: string): Promise<Agent>;
}
