from aws_cdk import (
    aws_ecs as ecs,
    aws_codedeploy as deploy,
    aws_elasticloadbalancingv2 as elb,
    aws_ec2 as ec2,
    core
)

from custom_codedeploy import CustomCodeDeploy


class Infrastructure(core.Stack):

    def __init__(self, scope: core.Construct, id: str, sg_id: str, **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        # Networking Constructs

        vpc = ec2.Vpc.from_lookup(
            self,
            "vpc",
            is_default=True
        )

        security_group = ec2.SecurityGroup.from_security_group_id(
            self, "sg", security_group_id=sg_id)

        # ECS Constructs

        cluster = ecs.Cluster(self, "cluster", cluster_name="FargateCluster", vpc=vpc)

        taskdef = ecs.TaskDefinition(
            self,
            "blue-task-definition",
            compatibility=ecs.Compatibility.FARGATE,
            family="sample",
            network_mode=ecs.NetworkMode.AWS_VPC,
            memory_mib="512",
            cpu="256"
        )

        taskdef.add_container("blue",
                              image=ecs.ContainerImage.from_registry(
                                  "kovvuri/training:blue"
                              ),
                              essential=True,
                              ).add_port_mappings(
            ecs.PortMapping(
                container_port=80,
                host_port=80,
                protocol=ecs.Protocol.TCP
            )
        )

        # Load Balancer Constructs

        alb = elb.ApplicationLoadBalancer(
            self,
            "alb",
            security_group=security_group,
            vpc_subnets=ec2.SubnetSelection(
                subnets=vpc.public_subnets
            ),
            vpc=vpc
        )

        blue = elb.ApplicationTargetGroup(
            self,
            "blue",
            target_group_name="swap1",
            port=80,
            protocol=elb.Protocol.HTTP,
            target_type=elb.TargetType.IP,
            vpc=vpc
        )

        green = elb.ApplicationTargetGroup(
            self,
            "green",
            target_group_name="swap2",
            port=80,
            protocol=elb.Protocol.HTTP,
            target_type=elb.TargetType.IP,
            vpc=vpc
        )

        alb.add_listener(
            "80_listener",
            default_target_groups=[blue],
            protocol=elb.Protocol.HTTP,
            port=80
        )

        alb.add_listener(
            "3000_listener",
            default_target_groups=[green],
            protocol=elb.Protocol.HTTP,
            port=3000,
        )

        # ECS Service

        service = ecs.FargateService(self, "service",
                                     cluster=cluster,
                                     task_definition=taskdef,
                                     desired_count=1,
                                     platform_version=ecs.FargatePlatformVersion.VERSION1_3,
                                     deployment_controller=ecs.DeploymentController(
                                         type=ecs.DeploymentControllerType.CODE_DEPLOY
                                     ),
                                     assign_public_ip=False,
                                     enable_ecs_managed_tags=True,
                                     propagate_task_tags_from=ecs.PropagatedTagSource.TASK_DEFINITION,
                                     security_group=security_group,
                                     vpc_subnets=ec2.SubnetSelection(
                                         subnets=vpc.private_subnets
                                     )
                                     )

        service.attach_to_application_target_group(
            target_group=blue
        )

        CustomCodeDeploy.EcsDeploymentGroup(
            self,
            "DeploymentGroup",
            ecs_service=service.service_name,
            ecs_cluster=cluster.cluster_name,
            production_target_group=blue.target_group_name,
            test_target_group=green.target_group_name,
            production_port=80,
            test_port=3000
        )


app = core.App()

env = core.Environment(account="441003739754", region="us-west-2")

stack = Infrastructure(app, "BlueGreenECS", env=env, sg_id="sg-ce38af8b")

core.Tag.add(stack, key="ecs-cdk", value="success",
             exclude_resource_types=["AWS::EIP::Tagging"])