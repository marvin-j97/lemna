# Using Lambda function URL

## Properties

### `function.url.authType`

Can be `none` or `iam`.

### `function.url.cors`

CORS configuration. You can also use `function.url.cors: true` to set up a all-star "don't care" CORS config.

### `function.url.invokeMode`

Can be `buffered` or `stream`. `buffered` is the default behaviour.

`Stream` uses [AWS Lambda response streaming](https://aws.amazon.com/de/blogs/compute/introducing-aws-lambda-response-streaming/).

## Example

```json
{
  "function": {
    "url": {
      "authType": "none",
      "invokeMode": "buffered",
      "cors": {
        "origins": ["*"],
        "methods": ["POST"]
      }
    }
  }
}
```

When deploying your function, the function URL will be printed to the console.
