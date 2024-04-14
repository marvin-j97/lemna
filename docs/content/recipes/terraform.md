# Terraform

If you use Terraform, you can use the `output` option to pick up the built .zip file and deploy it using Terraform:

Inside Lemna config:

```js
// @ts-check

/**
 * @type {import('lemna').Config}
 **/
const config = {
  entryPoint: "src/index.ts",
  output: "/path/to/output.zip",
  buildSteps: [],
  esbuild: {
    minify: true,
  },
  function: {
    moduleFormat: "cjs",

    // NOTE: These props are not really relevant
    // as they are controlled by Terraform
    name: `my-function`,
    description: "Cool function",
    handler: "index.handler",
    memorySize: 256,
    runtime: "nodejs20.x",
    timeout: 15,
  },
};

export default config;
```

Inside Terraform plan:

```terraform
resource "aws_lambda_function" "my_function" {
  function_name    = "my-function"
  role             = var.lambda_arn
  handler          = "index.handler"
  filename         = "path/to/output.zip"
  source_code_hash = filebase64sha256("path/to/output.zip")
  runtime          = "nodejs20.x"
  description      = "Cool function"
  timeout          = 15
  memory_size      = 256
}
```

Then run `lemna build` and `terraform apply`, and Terraform will pick up the built .zip file.
