from aws_cdk import (
    aws_rds as rds,
    core
)

import rds_cluster_utils as rds_utils


class RdsClusterStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        parameter_group = rds.ClusterParameterGroup(
            self, "cluster_parameter_group",
            family=rds_utils.get_parameter_group_family("aurora-mysql", "5.7.mysql_aurora.2.04.4"), 
            parameters={"max_connections":"10000"}
        )
