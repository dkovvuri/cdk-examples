#!/usr/bin/env python3

from aws_cdk import core

from bucket_notification.bucket_notification_stack import BucketNotificationStack


app = core.App()
BucketNotificationStack(app, "bucket-notification")

app.synth()
