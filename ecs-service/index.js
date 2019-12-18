#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ec2 = require("@aws-cdk/aws-ec2");
const ecs = require("@aws-cdk/aws-ecs");
const alb = require("@aws-cdk/aws-elasticloadbalancingv2");
const cdk = require("@aws-cdk/core");
const app = new cdk.App();
class VPCStack extends cdk.Stack {
    constructor(app, id, props) {
        super(app, id, props);
        this.vpc = new ec2.Vpc(this, 'vpc', { maxAzs: 3, natGateways: 2 });
        this.lb = new alb.ApplicationLoadBalancer(this, 'Alb', {
            vpc: this.vpc,
            internetFacing: true,
            vpcSubnets: { onePerAz: false, subnetType: ec2.SubnetType.PUBLIC },
        });
    }
}
class ECSStack extends cdk.Stack {
    constructor(app, id, props) {
        super(app, id, props);
        const vpc = props.VPC;
        const lb = props.LB;
        const cluster = new ecs.Cluster(this, 'Cluster', {
            capacity: {
                instanceType: new ec2.InstanceType("t2.large"),
                canContainersAccessInstanceRole: false,
                desiredCapacity: 1,
                vpcSubnets: { onePerAz: false, subnetType: ec2.SubnetType.PRIVATE }
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
const envEU = { account: '441003739754', region: 'ap-east-1' };
const vpcstack = new VPCStack(app, "VPCStack", { env: envEU });
new ECSStack(app, "ServiceStack", { env: envEU, VPC: vpcstack.vpc, LB: vpcstack.lb });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3Q0FBeUM7QUFDekMsd0NBQXlDO0FBQ3pDLDJEQUE0RDtBQUM1RCxxQ0FBc0M7QUFFdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFLNUIsWUFBWSxHQUFZLEVBQUUsRUFBVSxFQUFFLEtBQXFCO1FBRXZELEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXRCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFDakQ7WUFDSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixjQUFjLEVBQUUsSUFBSTtZQUNwQixVQUFVLEVBQUUsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBQztTQUNuRSxDQUNKLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFPRCxNQUFNLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUU1QixZQUFZLEdBQVksRUFBRSxFQUFVLEVBQUUsS0FBdUI7UUFFekQsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN0QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBRXBCLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzdDLFFBQVEsRUFBRTtnQkFDTixZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztnQkFDOUMsK0JBQStCLEVBQUUsS0FBSztnQkFDdEMsZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLFVBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFDO2dCQUNqRSxjQUFjO2FBQ2pCO1lBQ0QsR0FBRyxFQUFFLEdBQUc7U0FDWCxDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFMUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7WUFDL0IsU0FBUyxFQUFFLElBQUk7WUFDZixLQUFLLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDO1lBQy9DLG9CQUFvQixFQUFFLEdBQUc7U0FDNUIsQ0FBQyxDQUFDLGVBQWUsQ0FBQztZQUNmLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFFBQVEsRUFBRSxDQUFDO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDaEQsT0FBTyxFQUFFLE9BQU87WUFDaEIsY0FBYyxFQUFFLGNBQWM7WUFDOUIsWUFBWSxFQUFFLENBQUM7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMvRCxHQUFHO1lBQ0gsSUFBSSxFQUFFLEVBQUU7WUFDUixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRO1NBQ3RDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUcvQyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVDLFlBQVksRUFBRSxFQUFFO1lBQ2hCLG1CQUFtQixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDcEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO1NBQ3pDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUdELE1BQU0sS0FBSyxHQUFJLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDaEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBQzdELElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBlYzIgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZWMyJyk7XG5pbXBvcnQgZWNzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVjcycpO1xuaW1wb3J0IGFsYiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJyk7XG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5jbGFzcyBWUENTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG5cbiAgICByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xuICAgIHJlYWRvbmx5IGxiOiBhbGIuSUFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wczogY2RrLlN0YWNrUHJvcHMpIHtcblxuICAgICAgICBzdXBlcihhcHAsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgdGhpcy52cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAndnBjJywgeyBtYXhBenM6IDMsIG5hdEdhdGV3YXlzOiAyIH0pO1xuXG4gICAgICAgIHRoaXMubGIgPSBuZXcgYWxiLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHRoaXMsICdBbGInLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZwYzogdGhpcy52cGMsXG4gICAgICAgICAgICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgdnBjU3VibmV0czoge29uZVBlckF6OiBmYWxzZSwgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBFQ1NTdGFja1ZQQ1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAgIFZQQzogZWMyLklWcGM7XG4gICAgTEI6IGFsYi5JQXBwbGljYXRpb25Mb2FkQmFsYW5jZXJcbn1cblxuY2xhc3MgRUNTU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wczogRUNTU3RhY2tWUENQcm9wcykge1xuXG4gICAgICAgIHN1cGVyKGFwcCwgaWQsIHByb3BzKTtcblxuICAgICAgICBjb25zdCB2cGMgPSBwcm9wcy5WUEM7XG4gICAgICAgIGNvbnN0IGxiID0gcHJvcHMuTEI7XG5cbiAgICAgICAgY29uc3QgY2x1c3RlciA9IG5ldyBlY3MuQ2x1c3Rlcih0aGlzLCAnQ2x1c3RlcicsIHtcbiAgICAgICAgICAgIGNhcGFjaXR5OiB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VUeXBlOiBuZXcgZWMyLkluc3RhbmNlVHlwZShcInQyLmxhcmdlXCIpLFxuICAgICAgICAgICAgICAgIGNhbkNvbnRhaW5lcnNBY2Nlc3NJbnN0YW5jZVJvbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRlc2lyZWRDYXBhY2l0eTogMSxcbiAgICAgICAgICAgICAgICB2cGNTdWJuZXRzOiB7b25lUGVyQXo6IGZhbHNlLCBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFfVxuICAgICAgICAgICAgICAgIC8vIGtleU5hbWU6IFwiXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2cGM6IHZwY1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBUYXNrRGVmaW5pdGlvbiA9IG5ldyBlY3MuVGFza0RlZmluaXRpb24odGhpcywgJ3Rhc2tfZGVmJywgeyBjb21wYXRpYmlsaXR5OiBlY3MuQ29tcGF0aWJpbGl0eS5FQzIgfSk7XG5cbiAgICAgICAgVGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKCdhcHAnLCB7XG4gICAgICAgICAgICBlc3NlbnRpYWw6IHRydWUsXG4gICAgICAgICAgICBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21SZWdpc3RyeShcImh0dHBkXCIpLFxuICAgICAgICAgICAgbWVtb3J5UmVzZXJ2YXRpb25NaUI6IDEyOFxuICAgICAgICB9KS5hZGRQb3J0TWFwcGluZ3Moe1xuICAgICAgICAgICAgY29udGFpbmVyUG9ydDogODAsXG4gICAgICAgICAgICBob3N0UG9ydDogMFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzZXJ2aWNlID0gbmV3IGVjcy5FYzJTZXJ2aWNlKHRoaXMsICdTZXJ2aWNlJywge1xuICAgICAgICAgICAgY2x1c3RlcjogY2x1c3RlcixcbiAgICAgICAgICAgIHRhc2tEZWZpbml0aW9uOiBUYXNrRGVmaW5pdGlvbixcbiAgICAgICAgICAgIGRlc2lyZWRDb3VudDogMlxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBuZXcgYWxiLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgJ1RhcmdldEdyb3VwJywge1xuICAgICAgICAgICAgdnBjLFxuICAgICAgICAgICAgcG9ydDogODAsXG4gICAgICAgICAgICB0YXJnZXRUeXBlOiBhbGIuVGFyZ2V0VHlwZS5JTlNUQU5DRVxuICAgICAgICB9KTtcblxuICAgICAgICBzZXJ2aWNlLmF0dGFjaFRvQXBwbGljYXRpb25UYXJnZXRHcm91cCh0YXJnZXQpO1xuXG5cbiAgICAgICAgbmV3IGFsYi5BcHBsaWNhdGlvbkxpc3RlbmVyKHRoaXMsIFwiTGlzdGVuZXI4MFwiLCB7XG4gICAgICAgICAgICBsb2FkQmFsYW5jZXI6IGxiLFxuICAgICAgICAgICAgZGVmYXVsdFRhcmdldEdyb3VwczogW3RhcmdldF0sXG4gICAgICAgICAgICBvcGVuOiB0cnVlLCBwb3J0OiA4MCxcbiAgICAgICAgICAgIHByb3RvY29sOiBhbGIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5jb25zdCBlbnZFVSAgPSB7IGFjY291bnQ6ICc0NDEwMDM3Mzk3NTQnLCByZWdpb246ICdhcC1lYXN0LTEnIH07XG5jb25zdCB2cGNzdGFjayA9IG5ldyBWUENTdGFjayhhcHAsIFwiVlBDU3RhY2tcIiwge2VudjogZW52RVV9KTtcbm5ldyBFQ1NTdGFjayhhcHAsIFwiU2VydmljZVN0YWNrXCIsIHsgZW52OiBlbnZFVSwgVlBDOiB2cGNzdGFjay52cGMsIExCOiB2cGNzdGFjay5sYiB9KTsiXX0=