## Integrating CDK with AWS SAM CLI
---

The AWS SAM CLI can be used to test lambda function \ API gateway resources defined using the AWS Serverless Application Model. The SAM CLI relies on the template file and the relative asset locations specified in the template (CodeUri) to use 'sam local invoke' feature and the swagger file generated for the API Gateway resources to use the 'sam local start-api' feature.

When using AWS CDK to define your serverless resources it's possible to test the Lambda \ API Gateway resources locally. To provide a cohesive experience when using AWS CDK, the AWS SAM CLI has made improvements [1] to read the template assest metadata added by AWS CDK. Additionally, since CDK generates raw AWS API Gateway resources rathen than a 'swagger' file - the SAM CLI has also added supported for reading raw CloudFormation API Gateway resources starting SAM CLI v0.21 [2]. 

For better understanding, I have complied an example:

1. Download the attached application and run the following commands:

```bash
npm install && npm update
npm run build
```

2. Synthesize the application with the '--no-staging' for local debugging using the AWS SAM CLI:

```
cdk synth --no-staging > template.yaml
```

3. Now, use the SAM CLI to start the API Gateway Resource:

```
sam local start-api
```

Then run the command `curl localhost:3000/time` to test the functionality of the API integration.

4. To make an one-off invocation of the lambda function use the `sam local invoke` command:

```
sam local invoke --event events/events.json
```

Note: If your template has more than one 'Lambda::Function' resource, you would need to specify the logical-id Lambda function to be invoked. For example:
   
```
sam local invoke SampleFunction7DB1D36A --event events/events.json
```

[1] https://github.com/awslabs/aws-sam-cli/blob/master/designs/resource_metadata_overriding.md
[2] https://github.com/awslabs/aws-sam-cli/pull/1234
[3] AWS CDK Tools - SAM CLI - https://docs.aws.amazon.com/cdk/latest/guide/tools.html#sam
