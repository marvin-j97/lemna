# Lemna

Quickly scaffold and deploy AWS Lambda handlers powered by Typescript.

No more tedious code deploying to Lambda, Lemna handles for you:

- Scaffolding new functions with TypeScript
- Transpiling & bundling only necessary dependencies (using [esbuild](https://esbuild.github.io))
- Zipping & uploading code
- Updating function configuration
- Optionally setting up function URL

## Scaffold new Lambda function

```
pnpm lemna init
yarn lemna init
npx lemna init
```

This will setup a function folder with:

- package.json
- Typescript (+ tsconfig)
- Lambda typings (@types/aws-lambda)
- Basic Lambda handler (src/index.ts)
- Lemna config (lemna.config.mjs)
