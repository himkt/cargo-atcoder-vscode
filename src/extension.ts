// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';


const type = 'cargo-atcoder';


const createTask = (name: string, command: string) => {
	return new vscode.Task(
		{ type, name },
		vscode.TaskScope.Workspace,
		name,
		type,
		new vscode.ShellExecution(command),
	);
};


export async function activate(context: vscode.ExtensionContext) {
	let testCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.test', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const basename = path.parse(currentFilePath).name;
		const task = createTask('test', `cargo atcoder test ${basename}`);
		vscode.tasks.executeTask(task);
	});

	let submitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const basename = path.parse(currentFilePath).name;
		const task = createTask('submit', `cargo atcoder submit ${basename}`);
		vscode.tasks.executeTask(task);
	});

	let forceSubmitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit-force', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const basename = path.parse(currentFilePath).name;
		const task = createTask('submit', `cargo atcoder submit --force ${basename}`);
		vscode.tasks.executeTask(task);
	});

	let statusCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.status', () => {
		const task = createTask('status', 'cargo atcoder status');
		vscode.tasks.executeTask(task);
	});

	let runCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.run', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const basename = path.parse(currentFilePath).name;
		const task = createTask('run', `cargo run --bin ${basename}`);
		vscode.tasks.executeTask(task);
	});

	let openCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.open', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const basename = path.parse(currentFilePath).name;
		const folderName = vscode.workspace.workspaceFolders![0].name;
		const taskUrl = `https://atcoder.jp/contests/${folderName}/tasks/${folderName}_${basename}`;
		const uri = vscode.Uri.parse(taskUrl);
		vscode.env.openExternal(uri);
	});

	context.subscriptions.push(testCommand);
	context.subscriptions.push(submitCommand);
	context.subscriptions.push(forceSubmitCommand);
	context.subscriptions.push(statusCommand);
	context.subscriptions.push(runCommand);
	context.subscriptions.push(openCommand);
}

export function deactivate() {}
