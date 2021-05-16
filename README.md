[![Node.js CI](https://github.com/marvin-j97/lemna/actions/workflows/node.js.yml/badge.svg)](https://github.com/marvin-j97/lemna/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/marvin-j97/lemna/branch/master/graph/badge.svg?token=T6L95TZZXA)](https://codecov.io/gh/marvin-j97/lemna)
![npm](https://img.shields.io/npm/v/lemna)

# Lemna

Quickly scaffold and deploy AWS Lambda handlers powered by Javascript or Typescript.

Lemna will transpile, bundle and upload your code, no more tedious code deploying to Lambda.

Dependencies will be bundled into your code using Rollup, so only required code is uploaded (dev dependencies will be ignored).

## Installation

```
npm i lemna -g
```

## Scaffold new project

```
lemna init <directory> --function-name my-lambda
```

This will setup a project folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings
- Basic Lambda handler (src/index.ts)
- Lemna config

## Deploying

Be sure to create a Lambda function with the given name before deploying the first time.
Create a `.env` file and place your AWS credentials in it.
Then run:

```
lemna deploy
```

### Use a custom path

```
lemna deploy my-app/lemna.config.json
```

### Use CommonJS module as config

```js
// lemna.config.js
module.exports = {
  entryPoint: "path to file",
  functionName: "lambda function name",
};
```

```
lemna deploy lemna.config.js
```

### Deploy multiple functions

```
lemna deploy firstconfig.json secondconfig.json [...]
```

## Use in existing project

- Create a `lemna.config.json`, including:

```json
{
  "entryPoint": "path to file",
  "functionName": "lambda function name"
}
```
