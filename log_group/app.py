#!/usr/bin/env python3

from aws_cdk import (
    aws_logs as logs,
    core,
)

class LogGroupStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        log_group_name="/aws/lambda/AutoApproval"

        group = logs.LogGroup.from_log_group_name(
            self, 
            "loggroup",
            log_group_name=log_group_name
        )

        logs.MetricFilter(
            self, 
            "metricfilter", 
            log_group=group,
            filter_pattern=logs.FilterPattern.all_events(),
            metric_name="{}-{}".format(log_group_name, "metric"),
            metric_namespace="Sample",
            metric_value="0"
        )

app = core.App()

env = core.Environment(account="<acct>", region="<region>")

LogGroupStack(app, "log-group", env=env)

app.synth()