#!/usr/bin/env node
import ec2 = require('@aws-cdk/aws-ec2');
import cw = require('@aws-cdk/aws-cloudwatch');
import cdk = require('@aws-cdk/core');


interface InstanceProps extends cdk.StackProps {
    instanceid: string
}

class Alarm extends cdk.Stack {

    constructor(app: cdk.App, id: string, props: InstanceProps) {

        super(app, id, props);

        const instanceid = props.instanceid;

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

        const CPUAlarm = new cw.CfnAlarm(this, "cpualarm".concat(instanceid), {
            comparisonOperator: "GreaterThanThreshold",
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            threshold: 4,
            treatMissingData: "missing",
            metrics: [
                {
                    id: "m1",
                    label: "NetworkOut",
                    returnData: false,
                    metricStat: {
                        metric: {
                            metricName: "NetworkOut",
                            namespace: "AWS/EC2",
                            dimensions: [{
                                name: "InstanceId",
                                value: instanceid
                            }]
                        },
                        period: 300,
                        stat: "Average",
                        unit: "Bytes",
                    }
                },
                {
                    id: "m2",
                    label: "CPUCreditUsage",
                    returnData: false,
                    metricStat: {
                        metric: {
                            metricName: "NetworkIn",
                            namespace: "AWS/EC2",
                            dimensions: [{
                                name: "InstanceId",
                                value: instanceid
                            }]
                        },
                        period: 300,
                        stat: "Average",
                        unit: "Bytes"
                    }
                },
                {
                    id: "e1",
                    label: "NetworkUsageinMiB",
                    returnData: true,
                    expression: "SUM(METRICS())/(1024*1024)",
                    
                }
            ],

        })

    }

}

const app = new cdk.App();

new Alarm(app, "CloudWatchAlarm",{instanceid: "i-0cb9b6ad4c2884163"});