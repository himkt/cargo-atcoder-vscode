// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const type = 'cargo-atcoder';


const createTask = (name: string, command: string, options: vscode.ShellExecutionOptions) => {
	return new vscode.Task(
		{ type, name },
		vscode.TaskScope.Workspace,
		name,
		type,
		new vscode.ShellExecution(command, options),
	);
};


export async function activate(context: vscode.ExtensionContext) {
	let testCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.test', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('test', `cargo atcoder test --release ${baseName}`, {});
		vscode.tasks.executeTask(task);
	});

	let testDebugCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.test-debug', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('test', `cargo atcoder test ${baseName}`, {});
		vscode.tasks.executeTask(task);
	});

	let submitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('submit', `cargo atcoder submit --release ${baseName}`, {});
		vscode.tasks.executeTask(task);
	});

	let forceSubmitCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.submit-force', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('submit', `cargo atcoder submit --release --force ${baseName}`, {});
		vscode.tasks.executeTask(task);
	});

	let statusCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.status', () => {
		const task = createTask('status', 'cargo atcoder status', {});
		vscode.tasks.executeTask(task);
	});

	let runCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.run', () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const task = createTask('run', `cargo run --bin ${baseName}`, {});
		vscode.tasks.executeTask(task);
	});

	let openCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.open', async () => {
		const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
		const baseName = path.parse(currentFilePath).name;
		const folderName = vscode.workspace.workspaceFolders![0].name;

		let taskPath = await fetch(`https://atcoder.jp/contests/${folderName}/tasks`)
			.then(response => response.text())
			.then(text => {
				const $ = cheerio.load(text);
				const tdData = $('table > tbody > tr > td.text-center');

				const matchedTask = tdData.find("a").filter((_, e) => {
					const data = $(e);
					return data.text().trim() === baseName.toUpperCase();
				});

				const taskPath = matchedTask.attr("href");
				return taskPath;
			});

		// NOTE (himkt): fallback.
		//
		// It is typically needed just after the beginning of competition
		// when the task list page is not available yet.
		if (taskPath === undefined) {
			taskPath = `/contests/${folderName}/tasks/${folderName}_${baseName}`;
		}

		const taskUrl = 'https://atcoder.jp' + taskPath;
		const uri = vscode.Uri.parse(taskUrl);
		vscode.env.openExternal(uri);
	});

	let createCommand = vscode.commands.registerCommand('cargo-atcoder-vscode.new', async () => {
		const contestIdentifier = await vscode.window.showInputBox({
			"prompt": "AtCoder contest identifier (e.g. `abc100`): ",
		})
		if (contestIdentifier == null) {
			vscode.window.showErrorMessage("Empty contest identifier.");
			return;
		}
		vscode.window.showErrorMessage(contestIdentifier);
		const configurations = vscode.workspace.getConfiguration("cargo-atcoder-vscode");
		const rootDir = configurations.rootDir;

		const task = createTask(
			'new',
			`cargo atcoder new ${contestIdentifier}`,
			{cwd: rootDir},
		);
		vscode.tasks.executeTask(task);

		vscode.tasks.onDidEndTask(e => {
			// const openFolder = path.join(rootDir, contestIdentifier);
			// vscode.window.showErrorMessage(openFolder);
			// await vscode.commands.executeCommand('vscode.openFolder', openFolder);
			vscode.window.showErrorMessage("raech");
			vscode.commands.executeCommand(
				'vscode.openFolder',
				'/Users/himkt/Desktop/arc005',
				true,
			);
		});
	});

	context.subscriptions.push(testCommand);
	context.subscriptions.push(testDebugCommand);
	context.subscriptions.push(submitCommand);
	context.subscriptions.push(forceSubmitCommand);
	context.subscriptions.push(statusCommand);
	context.subscriptions.push(runCommand);
	context.subscriptions.push(openCommand);
	context.subscriptions.push(createCommand)
}

export function deactivate() {}
