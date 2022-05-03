// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';


const type = 'cargoAtcoderProvider';


export async function activate(context: vscode.ExtensionContext) {

	// (1). command

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

	// (2). tasks

    vscode.tasks.registerTaskProvider(type, {
        provideTasks(token?: vscode.CancellationToken) {
			const currentFilePath = vscode.window.activeTextEditor?.document.fileName!;
			const basename = path.parse(currentFilePath).name;

            return [
                new vscode.Task(
					{ type: type, command: "status" },
					vscode.TaskScope.Workspace,
                    "status",
					"cargo-atcoder",
					new vscode.ShellExecution(`cargo atcoder status`)
				),
                new vscode.Task(
					{ type: type, command: "test" },
					vscode.TaskScope.Workspace,
                    "test",
					"cargo-atcoder",
					new vscode.ShellExecution(`cargo atcoder test ${basename}`)
				),
                new vscode.Task(
					{ type: type, command: "submit" },
					vscode.TaskScope.Workspace,
                    "submit",
					"cargo-atcoder",
					new vscode.ShellExecution(`cargo atcoder submit ${basename}`)
				)
            ];
        },
        resolveTask(task: vscode.Task, token?: vscode.CancellationToken) {
            return task;
        }
    });
}

export function deactivate() {}
