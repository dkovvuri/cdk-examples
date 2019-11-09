# Steps to Deploy

1. Also provide the Instance ID to create the CloudWatch Alarm for.

|Command|Description|
|-----|-----|
|`npm install package.json`|   install node-modules|
|`npm update`|                 update node-modules|
|`npm run build`|             build the application to JS|
|`cdk synth`|                  emits the synthesized CloudFormation template|
|`cdk deploy '*Stack'`|        deploys stacks with the name ending with 'Stack'|
