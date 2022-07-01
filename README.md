<h1 align="center">Lemna</h1>

<p align="center">
  <img src="https://badge.fury.io/js/lemna.svg" alt="Version">
  <a href="https://codecov.io/gh/marvin-j97/lemna">
    <img src="https://codecov.io/gh/marvin-j97/lemna/branch/master/graph/badge.svg?token=T6L95TZZXA"/>
  </a>
  <img src="https://github.com/marvin-j97/lemna/actions/workflows/node.js.yml/badge.svg" alt="Build Status">
</p>

Quickly scaffold and deploy AWS Lambda handlers powered by Javascript or Typescript.

Lemna will transpile, bundle and upload your code - no more tedious code deploying to Lambda.

Dependencies will be bundled into your code using esbuild (https://esbuild.github.io/), so only required code is uploaded (dev dependencies will be ignored).

## Installation

```
npm i lemna -g
```

## Scaffold new Lambda function

```
lemna init
```

This will setup a function folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings (@types/aws-lambda)
- Basic Lambda handler (src/index.ts)
- Lemna config (lemna.config.json)

## Building

```
lemna build
```

### Use a custom path

```
lemna build my-app/lemna.config.json
```

### Use glob patterns

```
lemna build lambdas/**/lemna.config.json
```

## Deployment

Create a `.env` file and place your AWS credentials in it.
Then run:

```
lemna deploy
```

Note: `deploy` will run `build` automatically

### Use a custom path

```
lemna deploy my-app/lemna.config.json
```

### Use glob patterns

```
lemna deploy lambdas/**/lemna.config.json
```

### Use CommonJS module (with intellisense) as config

```js
// @ts-check

/**
 * @type {import('lemna').LemnaConfig}
 **/
const config = {
  entryPoint: "path to .js file",
  function: {
    name: "lambda-function-name",
    runtime: "nodejs16.x",
  },
};

module.exports = config;
```

```
lemna deploy lemna.config.js
```

### Deploy multiple functions

```
lemna deploy firstconfig.json secondconfig.json [...]
```

## Use in existing project

- Create a `lemna.config.json`, including at least:

```json
{
  "entryPoint": "path to .js file",
  "function": {
    "name": "lambda-function-name",
    "runtime": "nodejs16.x"
  }
}
```

## Other features

### List functions

```
lemna ls
```

### Print function details

```
lemna show my-function
```

### Delete function

```
lemna rm my-function
```

### Usage with jq

Example: Print the runtime of my functions

```
lemna ls | jq -C "[.[].Runtime]"
```

### Debugging/Tracing

Run with LEMNA_LOG_LEVEL=error/warn/info/verbose/debug/silly

```
LEMNA_LOG_LEVEL=silly lemna deploy
```

## Required AWS policies

#### Required:

- iam:PassRole
- lambda:CreateFunction
- lambda:UpdateFunctionCode
- lambda:UpdateFunctionConfiguration
- lambda:GetFunction
- lambda:GetFunctionConfiguration

#### Optional:

- lambda:ListFunctions (for `ls` command)
- lambda:DeleteFunction (for `rm` command)
