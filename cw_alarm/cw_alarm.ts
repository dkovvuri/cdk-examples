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


        // core.CfnResource(
        //     self,
        //     id="SecurityDirectorAnyFailedLogins15MinutesAlarm",
        //     type="AWS::CloudWatch::Alarm",
        //     properties={
        //         "ComparisonOperator": "GreaterThanThreshold",
        //         "EvaluationPeriods": 1,
        //         "Period": 900,
        //         "Metrics": [
        //             {
        //                 "Expression": "SEARCH(' {SecurityDirector/FailedLogins, User} NOT \"ALL\" ', 'Maximum', 900)",
        //                 "Id": "m1",
        //                 "Label": "FailedLogins",
        //                 "ReturnData": True,
        //             }
        //         ],
        //     },
        // )

        const CPUAlarm = new cw.CfnAlarm(this, "cpualarm".concat(instance.toString()), {
            comparisonOperator: "GreaterThanThreshold",
            evaluationPeriods: 1,
            period: 900,
            metrics: [
                {
                    id: "m1",
                    label: "CPUCreditUsage",
                    returnData: true,
                    metricStat: {
                        metric: {
                            metricName: "CPUCreditUsage",
                            namespace: "AWS/EC2",
                            dimensions: [{
                                name: "InstanceId",
                                value: instance.instanceId
                            }]
                        },
                        period: 300,
                        stat: "Average",
                        unit: "Count",
                    }
                },
                {
                    id: "m2",
                    label: "CPUCreditUsage",
                    metricStat: {
                        metric: {
                            metricName: "CPUCreditUsage",
                            namespace: "AWS/EC2",
                            dimensions: [{
                                name: "InstanceId",
                                value: instance.instanceId
                            }]
                        },
                        period: 300,
                        stat: "Average",
                        unit: "Count"
                    }
                }
            ],

        })

    }

}

const envUSA = { account: '675383074689', region: 'us-east-1' };

const app = new cdk.App();

new EC2InstanceAlarmStack(app, "EC2withAlarm", { env: envUSA, vpcid: "vpc-4e352e36" });