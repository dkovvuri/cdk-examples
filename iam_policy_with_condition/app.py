#!/usr/bin/env python3

from aws_cdk import core

from iam_policy_with_condition.iam_policy_with_condition_stack import IamPolicyWithConditionStack


app = core.App()
IamPolicyWithConditionStack(app, "iam-policy-with-condition")

app.synth()
