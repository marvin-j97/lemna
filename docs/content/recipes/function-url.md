# Using Lambda function URL

Use `function.url` to automatically configure a [Lambda function URL](https://aws.amazon.com/de/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/).
When deploying your function, the function URL will be printed to the console.

## Properties

### `authType`

Can be `none` or `iam`.

### `cors`

CORS configuration. You can also use `cors: true` to set up a all-star "don't care" CORS config.

### `invokeMode`

Can be `buffered` or `stream`. `buffered` is the default behaviour.

`stream` uses [AWS Lambda response streaming](https://aws.amazon.com/de/blogs/compute/introducing-aws-lambda-response-streaming/).

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
