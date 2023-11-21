### Prisma

If you use Prisma, you should use a Lambda layer containing the necessary Prisma binaries and setting:

`PRISMA_QUERY_ENGINE_LIBRARY` to: `"/opt/nodejs/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node"` (or whatever openSSL version is needed).

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
