/// <reference path="./vscode.d.ts" />
import React from "react";
import ReactDOM from "react-dom/client";
import { VoiceBar } from "./VoiceBar";

const root = document.getElementById("root");
if (root) {
	const r = ReactDOM.createRoot(root);
	r.render(<VoiceBar />);
}
