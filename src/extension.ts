// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('test', `cargo atcoder test ${baseName}`);
		vscode.tasks.executeTask(task);
	});

	let submitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('submit', `cargo atcoder submit ${baseName}`);
		vscode.tasks.executeTask(task);
	});

	let forceSubmitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit-force', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('submit', `cargo atcoder submit --force ${baseName}`);
		vscode.tasks.executeTask(task);
	});

	let statusCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.status', () => {
		const task = createTask('status', 'cargo atcoder status');
		vscode.tasks.executeTask(task);
	});

	let runCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.run', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('run', `cargo run --bin ${baseName}`);
		vscode.tasks.executeTask(task);
	});

	let openCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.open', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name.toUpperCase();
		const folderName = vscode.workspace.workspaceFolders![0].name;

		fetch(`https://atcoder.jp/contests/${folderName}/tasks`)
			.then(response => response.text())
			.then(text => {
				const $ = cheerio.load(text);
				const tdData = $('table > tbody > tr > td.text-center');

				const matchedTask = tdData.find("a").filter((_, e) => {
					const data = $(e);
					return data.text().trim() === baseName;
				});

				const taskPath = matchedTask.attr("href");
				const taskUrl = 'https://atcoder.jp' + taskPath;
				const uri = vscode.Uri.parse(taskUrl);
				vscode.env.openExternal(uri);
			});
	});

	context.subscriptions.push(testCommand);
	context.subscriptions.push(submitCommand);
	context.subscriptions.push(forceSubmitCommand);
	context.subscriptions.push(statusCommand);
	context.subscriptions.push(runCommand);
	context.subscriptions.push(openCommand);
}

export function deactivate() {}
