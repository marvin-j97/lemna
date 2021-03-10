## Lemna

Quickly scaffold and deploy Lambda handlers powered by Typescript.
Lemna will transpile, bundle and upload your code, no complex setup required!

### Installation

```
npm i lemna -g
```

### Scaffold new project

```
lemna init --dir my-folder --function-name my-lambda
```

This will setup a project folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings
- Basic entry point (src/main.ts)
- Lemna config

### Deploying

Be sure to create a Lambda function with the given name before deploying the first time.
Create a .env file and place your AWS credentials in it.
Then run:

```
lemna deploy
```

If your working directory is different from the project fold, use the --config flag:

```
lemna deploy --config ./my-app/lemna.config.json
```

### Use in existing project

- Create a `lemna.config.json`, including:

```json
{
  "entryPoint": "js file",
  "functionName": "lambda function name"
}
```

### TODO

- --create-missing-function
- Local testing
