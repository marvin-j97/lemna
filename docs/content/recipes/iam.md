# IAM policies

## Used AWS policies

### Required

- iam:PassRole
- lambda:GetFunction
- lambda:CreateFunction
- lambda:UpdateFunctionCode
- lambda:GetFunctionConfiguration
- lambda:UpdateFunctionConfiguration
- lambda:GetFunctionUrlConfig
- lambda:CreateFunctionUrlConfig
- lambda:UpdateFunctionUrlConfig
- lambda:DeleteFunctionUrlConfig

### Optional

- lambda:ListFunctions (for `ls` command)
- lambda:DeleteFunction (for `rm` command)
- lambda:AddPermission (for creating Function URL with AuthType: `NONE`)

## Example AWS policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "1",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:DeleteFunction",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunctionConfiguration",
        "lambda:GetFunctionUrlConfig",
        "lambda:CreateFunctionUrlConfig",
        "lambda:UpdateFunctionUrlConfig",
        "lambda:DeleteFunctionUrlConfig"
      ],
      "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:NAME_PATTERN"
    },
    {
      "Sid": "2",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole",
        "lambda:ListFunctions",
        "lambda:AddPermission"
      ],
      "Resource": "*"
    }
  ]
}
```
