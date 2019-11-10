from aws_cdk import (
    aws_cloudwatch as cloudwatch,
    core,
)


class CloudWatchAlarm(core.Stack):

    def __init__(self, scope: core.Construct, id: str, instanceid: str, **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        # Higher level CDK constructs don't support Metric Math Expressions
        # Using a generalized CfnAlarm

        cloudwatch.CfnAlarm(
            self,
            id="NetworkThroughPutMonitor",
            comparison_operator="GreaterThanThreshold",
            evaluation_periods=1,
            datapoints_to_alarm=1,
            threshold=4,
            treat_missing_data="missing",
            metrics=[{
                "id": "m1",
                "label": "NetworkOut",
                "returnData": False,
                "metricStat": {
                    "metric": {
                        "metricName": "NetworkOut",
                        "namespace": "AWS/EC2",
                        "dimensions": [{
                                "name": "InstanceId",
                                "value": instanceid
                        }]
                    },
                    "period": 300,
                    "stat": "Average",
                    "unit": "Bytes",
                }
            },
                {
                    "id": "m2",
                    "label": "NetworkIn",
                    "returnData": False,
                    "metricStat": {
                        "metric": {
                            "metricName": "NetworkIn",
                            "namespace": "AWS/EC2",
                            "dimensions": [{
                                "name": "InstanceId",
                                "value": instanceid
                            }]
                        },
                        "period": 300,
                        "stat": "Average",
                        "unit": "Bytes"
                    }
            },
                {
                    "id": "e1",
                    "label": "NetworkUsageinMiB",
                    "returnData": True,
                    "expression": "SUM(METRICS())/(1024*1024)",

            }]
        )

        # # Alternatively using a generalized CfnRsesource

        core.CfnResource(
            self,
            id="NetworkThroughputMonitor",
            type="AWS::CloudWatch::Alarm",
            properties={
                "ComparisonOperator": "GreaterThanThreshold",
                "EvaluationPeriods": 1,
                "Threshold": 4,
                "Metrics": [{
                    "Id": "m1",
                    "Label": "NetworkOut",
                    "ReturnData": False,
                    "MetricStat": {
                        "Metric": {
                            "MetricName": "NetworkOut",
                            "Namespace": "AWS/EC2",
                            "Dimensions": [{
                                "Name": "InstanceId",
                                "Value": instanceid
                            }]
                        },
                        "Period": 300,
                        "Stat": "Average",
                        "Unit": "Bytes",
                    }
                },
                    {
                    "Id": "m2",
                    "Label": "NetworkIn",
                    "ReturnData": False,
                    "MetricStat": {
                        "Metric": {
                            "MetricName": "NetworkIn",
                            "Namespace": "AWS/EC2",
                            "Dimensions": [{
                                "Name": "InstanceId",
                                "Value": instanceid
                            }]
                        },
                        "Period": 300,
                        "Stat": "Average",
                        "Unit": "Bytes"
                    }
                },
                    {
                    "Id": "e1",
                    "Label": "NetworkUsageinMiB",
                    "ReturnData": True,
                    "Expression": "SUM(METRICS())/(1024*1024)",
                }]
            },
        )


app = core.App()
CloudWatchAlarm(app, "cw-alarm-in-python", instanceid="<instance-id>")

app.synth()
