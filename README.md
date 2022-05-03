# cargo-atcoder-vscode README

![](https://user-images.githubusercontent.com/5164000/166233908-281948cb-0c37-4311-8dcc-283ed628b7c2.JPG)

## Install

```sh
> wget https://github.com/himkt/cargo-atcoder-vscode/releases/download/v0.0.2/cargo-atcoder-vscode-0.0.2.vsix
> code --install-extension  cargo-atcoder-vscode-0.0.2.vsix
```

## Run cargo-atcoder commands as a task

Create `tasks.json` and add tasks:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "cargoAtcoderProvider",
			"command": "test",
			"problemMatcher": [],
			"label": "cargo-atcoder: test"
		},
		{
			"type": "cargoAtcoderProvider",
			"command": "submit",
			"problemMatcher": [],
			"label": "cargo-atcoder: submit"
		},
		{
			"type": "cargoAtcoderProvider",
			"command": "status",
			"problemMatcher": [],
			"label": "cargo-atcoder: status"
		}
	]
}
```

After that, you can run `test`, `submit`, and `status` as vscode tasks!
