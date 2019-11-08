from aws_cdk import (
    aws_iam as iam,
    core
)

class IamPolicyStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        statement1 =iam.PolicyStatement(
                    effect=iam.Effect.DENY,
                    actions=[
                        "iam:*",
                        "organizations:*",
                        "account:*"
                    ],
                    resources=["*"],
                )

        policy = iam.ManagedPolicy(self, "SamplePolicy",
            description="This is a sample policy for demonstrational purposes and not meant for production use",
            managed_policy_name="SamplePolicy",
            statements=[
                statement1
            ]
        )