# Using the CLI

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

### Deploy multiple functions

```
lemna deploy firstconfig.mjs secondconfig.mjs [...]
```

## List functions

```
lemna ls
```

Example: Print the runtime of my functions

```
lemna ls | jq -C "[.[].Runtime]"
```

## Print function details

```
lemna show my-function
```

## Delete function

```
lemna rm my-function
```

## Debugging/Tracing

Run with LEMNA_LOG_LEVEL=error/warn/info/verbose/debug/silly

```
LEMNA_LOG_LEVEL=silly lemna deploy
```
