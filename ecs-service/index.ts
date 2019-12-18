#!/usr/bin/env node
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import alb = require('@aws-cdk/aws-elasticloadbalancingv2');
import cdk = require('@aws-cdk/core');

const app = new cdk.App();

class VPCStack extends cdk.Stack {

    readonly vpc: ec2.IVpc;
    readonly lb: alb.IApplicationLoadBalancer;

    constructor(app: cdk.App, id: string, props: cdk.StackProps) {

        super(app, id, props);

        this.vpc = new ec2.Vpc(this, 'vpc', { maxAzs: 3, natGateways: 2 });

        this.lb = new alb.ApplicationLoadBalancer(this, 'Alb',
            {
                vpc: this.vpc,
                internetFacing: true,
                vpcSubnets: {onePerAz: false, subnetType: ec2.SubnetType.PUBLIC},
            }
        );
    }
}

interface ECSStackVPCProps extends cdk.StackProps {
    VPC: ec2.IVpc;
    LB: alb.IApplicationLoadBalancer
}

class ECSStack extends cdk.Stack {

    constructor(app: cdk.App, id: string, props: ECSStackVPCProps) {

        super(app, id, props);

        const vpc = props.VPC;
        const lb = props.LB;

        const cluster = new ecs.Cluster(this, 'Cluster', {
            capacity: {
                instanceType: new ec2.InstanceType("t2.large"),
                canContainersAccessInstanceRole: false,
                desiredCapacity: 1,
                vpcSubnets: {onePerAz: false, subnetType: ec2.SubnetType.PRIVATE}
                // keyName: ""
            },
            vpc: vpc
        });

        const TaskDefinition = new ecs.TaskDefinition(this, 'task_def', { compatibility: ecs.Compatibility.EC2 });

        TaskDefinition.addContainer('app', {
            essential: true,
            image: ecs.ContainerImage.fromRegistry("httpd"),
            memoryReservationMiB: 128
        }).addPortMappings({
            containerPort: 80,
            hostPort: 0
        });

        const service = new ecs.Ec2Service(this, 'Service', {
            cluster: cluster,
            taskDefinition: TaskDefinition,
            desiredCount: 2
        });

        const target = new alb.ApplicationTargetGroup(this, 'TargetGroup', {
            vpc,
            port: 80,
            targetType: alb.TargetType.INSTANCE
        });

        service.attachToApplicationTargetGroup(target);


        new alb.ApplicationListener(this, "Listener80", {
            loadBalancer: lb,
            defaultTargetGroups: [target],
            open: true, port: 80,
            protocol: alb.ApplicationProtocol.HTTP
        });
    }
}


const envEU  = { account: '441003739754', region: 'ap-east-1' };
const vpcstack = new VPCStack(app, "VPCStack", {env: envEU});
new ECSStack(app, "ServiceStack", { env: envEU, VPC: vpcstack.vpc, LB: vpcstack.lb });