<h1 align="center">Lemna</h1>

<p align="center">
  <img src="https://img.shields.io/static/v1?label=&message=TS+ready&color=000000&logo=typescript" alt="TS ready">
  <img src="https://img.shields.io/static/v1?label=&message=ESM+ready&color=%23000000&logo=javascript" alt="ESM ready">
  <img src="https://badge.fury.io/js/lemna.svg" alt="Version">
  <a href="https://codecov.io/gh/marvin-j97/lemna">
    <img src="https://codecov.io/gh/marvin-j97/lemna/branch/main/graph/badge.svg?token=T6L95TZZXA"/>
  </a>
  <img src="https://github.com/marvin-j97/lemna/actions/workflows/node.js.yml/badge.svg" alt="Build Status">
  <img src="https://img.shields.io/github/license/marvin-j97/lemna" alt="License">
</p>

Quickly scaffold and deploy AWS Lambda handlers powered by Typescript.

Lemna will transpile, bundle and upload your code - no more tedious code deploying to Lambda.

Dependencies will be bundled into your code using esbuild (https://esbuild.github.io/), so only required code is uploaded (dev dependencies will be ignored).

## Scaffold new Lambda function

```
npx lemna init
yarn lemna init
pnpm lemna init
```

This will setup a function folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings (@types/aws-lambda)
- Basic Lambda handler (src/index.ts)
- Lemna config (lemna.config.mjs)

## Building

```
lemna build
```

### Use a custom path

```
lemna build my-app/lemna.config.mjs
```

### Use glob patterns

```
lemna build lambdas/**/lemna.config.mjs
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
lemna deploy my-app/lemna.config.mjs
```

### Use glob patterns

```
lemna deploy lambdas/**/lemna.config.mjs
```

### Create function URL

Use `function.url` to create a function URL. Optionally use `function.url.cors` to configure CORS.

```json
{
  "function": {
    "url": {
      "authType": "none",
      "invokeMode": "buffered"
    }
  }
}
```

### Add files to bundle with `bundle`

If you want to add a file to the ZIP bundle, you can use `bundle`:

```json
{
  "bundle": {
    ".": ["file.txt"],
    "subfolder": ["templates/*.html"]
  }
}
```

The bundle keys represent the folders the files will be extracted to (with "." being the function root folder `/var/task`). The array contains glob patterns of files that will be included.

### Prisma

If you use Prisma, you should use a Lambda layer containing the necessary Prisma binaries and setting:

`PRISMA_QUERY_ENGINE_LIBRARY` to `"/opt/nodejs/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node"` (or whatever openSSL version is needed).

```json
{
  "function": {
    "layers": ["my-lambda-layer-arn"],
    "env": {
      "PRISMA_QUERY_ENGINE_LIBRARY": "..."
    }
  }
}
```

### Deploy multiple functions

```
lemna deploy firstconfig.mjs secondconfig.mjs [...]
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
- lambda:AddPermission (for creating Function URL with AuthType: NONE)
