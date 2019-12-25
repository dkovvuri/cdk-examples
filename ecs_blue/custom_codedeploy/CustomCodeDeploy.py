from aws_cdk import (
    aws_iam as iam,
    aws_ecs as ecs,
    aws_lambda as _lambda_,
    aws_iam as iam,
    aws_cloudformation as cfn,
    core
)


class EcsDeploymentGroup(core.Construct):

    def __init__(self, scope: core.Construct, id: str, *,
                 ecs_cluster: str,
                 ecs_service: str,
                 production_target_group: str,
                 production_port: int,
                 test_target_group: str,
                 test_port: int, **kwargs):

        super().__init__(scope, id, **kwargs)

        provider_function = _lambda_.Function(self, "provider_function",
                                              runtime=_lambda_.Runtime.PYTHON_3_7,
                                              handler="index.main",
                                              code=_lambda_.Code.asset("./custom_codedeploy/code/"))

        provider_function.add_to_role_policy(
            statement=iam.PolicyStatement(
                actions=[
                    "codedeploy:CreateDeploymentGroup",
                    "codedeploy:GetDeploymentGroup",
                    "codedeploy:DeleteDeploymentGroup"
                ],
                resources=[
                    "*"
                ],
                effect=iam.Effect.ALLOW
            )
        )

        cd_srv_role = iam.Role(self, "CodeDeployServiceRole",
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("AWSCodeDeployRole"),
                iam.ManagedPolicy.from_aws_managed_policy_name("AWSCodeDeployRoleForECS")
            ],
            assumed_by=iam.ServicePrincipal(
                service="codedeploy.amazonaws.com"
            )
        )

        cfn.CustomResource(
            self, "DeploymentGroup",
            provider=cfn.CustomResourceProvider.lambda_(provider_function),
            properties={"Service": ecs_service,
                        "Cluster": ecs_cluster,
                        "Application": production_target_group,
                        "TestTargetGroup": test_target_group,
                        "ProductionPort": production_port,
                        "TestPort": test_port,
                        "Role": cd_srv_role.role_arn }
        )
