#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CwAlarmStack } from '../lib/cw_alarm-stack';

const app = new cdk.App();
new CwAlarmStack(app, 'CwAlarmStack');
