## Lemna

Quickly scaffold and deploy Lambda handlers powered by Typescript

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

