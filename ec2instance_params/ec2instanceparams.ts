#!/usr/bin/env node
import ec2 = require('@aws-cdk/aws-ec2');
import cw = require('@aws-cdk/aws-cloudwatch');
import cdk = require('@aws-cdk/core');


interface InstanceProps extends cdk.StackProps {
    vpcid: string
}

class EC2InstanceAlarmStack extends cdk.Stack {

    constructor(app: cdk.App, id: string, props: InstanceProps) {

        super(app, id, props);

        const vpc_id = props.vpcid;

        const instance_type = new cdk.CfnParameter(this, "instancetype", {
            type: "String",
            default: "t2.large"
        });

        const keypair = new cdk.CfnParameter(this, "keypair", {
            type: "AWS::EC2::KeyPair::KeyName",
            default: "kovvuri"
        });

        const instance = new ec2.Instance(this, "Instance", {
            instanceType: new ec2.InstanceType(instance_type.valueAsString),
            machineImage: new ec2.AmazonLinuxImage(),
            allowAllOutbound: true,
            keyName: keypair.valueAsString,
            vpc: ec2.Vpc.fromLookup(this, "vpc", { vpcId: vpc_id })

        });
    }

}

const envUSA = { account: '', region: '' };

const app = new cdk.App();

new EC2InstanceAlarmStack(app, "EC2withAlarm", { env: envUSA, vpcid: "" });