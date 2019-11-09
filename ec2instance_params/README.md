# Steps to Deploy

1. Add the Account ID and Region to the stack environment.
1. Also provide the VPC ID to launch the instance into.

|Command|Description|
|-----|-----|
|`npm install package.json`|   install node-modules|
|`npm update`|                 update node-modules|
|`npm run build`|             build the application to JS|
|`cdk synth`|                  emits the synthesized CloudFormation template|
|`cdk deploy '*Stack'`|        deploys stacks with the name ending with 'Stack'|
