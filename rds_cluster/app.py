#!/usr/bin/env python3

from aws_cdk import core

from rds_cluster_stack import RdsClusterStack

app = core.App()
RdsClusterStack(app, "rds-cluster")

app.synth()
