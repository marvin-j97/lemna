[![Node.js CI](https://github.com/marvin-j97/lemna/actions/workflows/node.js.yml/badge.svg)](https://github.com/marvin-j97/lemna/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/marvin-j97/lemna/branch/master/graph/badge.svg?token=T6L95TZZXA)](https://codecov.io/gh/marvin-j97/lemna)
![npm](https://img.shields.io/npm/v/lemna)

## Lemna

Quickly scaffold and deploy AWS Lambda handlers powered by Javascript or Typescript.

Lemna will transpile, bundle and upload your code, no more tedious code deploying to Lambda.

Dependencies will be bundled into your code by Rollup, so only required code is uploaded (dev dependencies will be ignored).

### Installation

```
npm i lemna -g
```

### Scaffold new project

```
lemna init --directory my-folder --function-name my-lambda
```

This will setup a project folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings
- Basic Lambda handler (src/index.ts)
- Lemna config

### Deploying

Be sure to create a Lambda function with the given name before deploying the first time.
Create a `.env` file and place your AWS credentials in it.
Then run:

```
lemna deploy
```

If your working directory is different from the folder containing the Lemna config, use the `--config` flag:

```
lemna deploy --config ./my-app/lemna.config.json
```

### Use in existing project

- Create a `lemna.config.json`, including:

```json
{
  "entryPoint": "path to file",
  "functionName": "lambda function name"
}
```
