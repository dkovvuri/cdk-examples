import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import lambda = require('@aws-cdk/aws-lambda');

interface SubnetId extends cdk.StackProps {
    subnetid: string;
    vpcid: string
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: SubnetId) {
    super(scope, id, props);

    const subnetid = props.subnetid;
    const vpcid = props.vpcid;

    const vpc = ec2.Vpc.fromLookup(this, 'ec2vpc', {
        vpcId: vpcid
    })

    const subnet = ec2.Subnet.fromSubnetAttributes(this, 'ec2subnet',{
      availabilityZone:'us-east1',
      subnetId: subnetid
    });

    const lambdaFn = new lambda.Function(this, 'Singleton', {
        code: new lambda.InlineCode("def main(): \n \tprint(\"Hello World\")"),
        handler: 'index.main',
        timeout: cdk.Duration.seconds(300),
        runtime: lambda.Runtime.PYTHON_3_6,
        vpc: vpc,
        vpcSubnets: {subnets:[subnet]},
      });
  }
}

const envUSA  = { account: '675383074689', region: 'us-east-1' };

const app = new cdk.App;
new LambdaStack(app, "LambdaStack", { env: envUSA, subnetid:"subnet-0e779bffee9bae12e", vpcid: "vpc-4e352e36"});