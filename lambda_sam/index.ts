import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import { ApiEventSource } from '@aws-cdk/aws-lambda-event-sources';

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    const lambdaFn = new lambda.Function(this, 'SampleFunction', {
      code: lambda.Code.fromAsset('src'),
      handler: 'index.main',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_6,
      events: [
        new ApiEventSource("GET", "/time")
      ]
    });
  }
}

const app = new cdk.App;
new LambdaStack(app, "LambdaStack");