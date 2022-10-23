// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { existsSync } from 'fs';

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

		// Fallback logic for the case where `taskPath` couldn't get correctly. It is typically needed
		// right after the beginning of competition (the task list page won't be available yet).
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
		});
		if (contestIdentifier == undefined || contestIdentifier == "") {
			vscode.window.showErrorMessage("Empty contest identifier.");
			return;
		}
		const configurations = vscode.workspace.getConfiguration("cargo-atcoder-vscode");
		let cargoAtCoderRootDir = configurations.rootDir;
		if (cargoAtCoderRootDir == "") {
			const response = await vscode.window.showInformationMessage(
				`
				Empty root dir is detected. A folder will be created in /tmp.
				Consider updating the root directory in 'Settings > cargo-atcoder > Root Dir'.
				`,
				"Configure...",
				"Continue: use '/tmp'",
			);
			if (response == undefined) {
				vscode.window.showInformationMessage("Exit.", "Close");
				return;
			}
			else if (response == "Configure...") {
				await vscode.commands.executeCommand(
					'workbench.action.openSettings',
					'cargo-atcoder-vscode.rootDir',
				);
				return;
			}
			else if (response == "Continue: use '/tmp'") {
				cargoAtCoderRootDir = "/tmp";
			}
		}

		const targetFolder = path.join(cargoAtCoderRootDir, contestIdentifier);
		const targetFolderUri = vscode.Uri.parse(targetFolder);
		if (existsSync(targetFolder)) {
			vscode.window.showErrorMessage(`${targetFolder} already exists. Opening...`);
			vscode.commands.executeCommand('vscode.openFolder', targetFolderUri);
			return;
		}
		const command = `cargo atcoder new ${contestIdentifier}`;
		const options = {cwd: cargoAtCoderRootDir};
		const task = createTask('new', command, options);
		vscode.tasks.executeTask(task);
		vscode.tasks.onDidEndTask(async _ => {
			await vscode.commands.executeCommand('vscode.openFolder', targetFolderUri);
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
