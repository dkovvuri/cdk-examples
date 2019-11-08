from aws_cdk import core
from aws_cdk import aws_glue as glue

class RdsClusterStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        
        glue.CfnJob(
            scope=self,
            id=modname,
            command={
                'name': 'glueetl',
                'python_version': '3',
                'script_location': 's3://shaw-stc-edl-etl-config-playpen/test/glue/spark/__main__.py'
            },
            role=etl_role.role_arn,
            default_arguments={
                '--enable-glue-datacatalog': ''
            },
            allocated_capacity=10,
            description='Test Spark Glue ETL',
            glue_version='1.0',
            max_capacity=10,
            max_retries=0,
            number_of_workers=1,
            timeout=2880,
            worker_type='Standard'
        )

app = core.App()
GlueJobStack(app, "glue-job")

app.synth()
