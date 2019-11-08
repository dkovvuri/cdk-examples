#!/usr/bin/env python3

from aws_cdk import core

from iam_policy.iam_policy_stack import IamPolicyStack


app = core.App()
IamPolicyStack(app, "iam-policy")

app.synth()
