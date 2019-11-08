import boto3
from botocore.exceptions import ClientError

client = boto3.client('rds')

def get_parameter_group_family(engine_name,engine_version):
    
    try:
        
        response = client.describe_db_engine_versions(
            Engine=engine_name,
            EngineVersion=engine_version
        )
        
        parameter_group_family = response['DBEngineVersions'][0]['DBParameterGroupFamily']
        print(parameter_group_family)
        return parameter_group_family

    except ClientError as e: 
        
        print("The utility failed with the error " + e.response['Error']['Code'])