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

## Scaffold new project

```
lemna init <directory>
```

This will setup a project folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings (@types/aws-lambda)
- Basic Lambda handler (src/index.ts)
- Lemna config (lemna.config.json)

## Deploying

Create a `.env` file and place your AWS credentials in it.
Then run:

```
lemna deploy
```

### Use a custom path

```
lemna deploy my-app/lemna.config.json
```

### Use glob patterns

```
lemna deploy lambdas/**/lemna.config.json
```

### Use CommonJS module as config

```js
// lemna.config.js
module.exports = {
  entryPoint: "path to .js file",
  function: {
    name: "lambda-function-name",
    runtime: "nodejs14.x",
  },
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

- Create a `lemna.config.json`, including at least:

```json
{
  "entryPoint": "path to .js file",
  "function": {
    "name": "lambda-function-name",
    "runtime": "nodejs14.x"
  }
}
```

## Debugging/Tracing

Run with LEMNA_LOG_LEVEL=debug/silly/verbose

```
LEMNA_LOG_LEVEL=silly lemna deploy
```
