// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	let cargoRun = (type: String) => {
		let currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		let basename = path.parse(currentFilePath).name;

		let terminal = vscode.window.createTerminal();
		terminal.sendText(`cargo atcoder ${type} ${basename}`);
		terminal.show();
	};

	let testCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.test', () => {
		cargoRun('test');
	});

	let submitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit', () => {
		cargoRun('submit');
	});

	context.subscriptions.push(testCommand);
	context.subscriptions.push(submitCommand);
}

export function deactivate() {}
