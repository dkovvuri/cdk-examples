import boto3
import json
from botocore.vendored import requests
from botocore.exceptions import ClientError, ParamValidationError

codedeploy = boto3.client('codedeploy')

def main(event, context):

    print( "Received Event: \n" + json.dumps(event))
    serviceName = event['ResourceProperties']['Service']
    cluster = event['ResourceProperties']['Cluster']
    application = event['ResourceProperties']['Application']
    role = event['ResourceProperties']['Role']
    targetgroup1 = event['ResourceProperties']['TargetGroup1']
    targetgroup2 = event['ResourceProperties']['TargetGroup2']
    prodlistener = event['ResourceProperties']['ProdListener']
    testlistener = event['ResourceProperties']['TestListener']

    deploymentGroupName = "{}-deployment-group".format(serviceName)

    
    try:
        if event['RequestType'] == 'Delete':
            print "Deleting the Deployment Group"
            response = cleanup(application)
            responseStatus = response
            responseData = {}
        elif event['RequestType'] == 'Create':
            print('Creating the Deployment Group...')
            response = create_deployment_group(deploymentGroupName, application,role, serviceName, cluster, targetgroup1, targetgroup2, prodlistener, testlistener)
            responseStatus = 'SUCCESS'
            responseData = {
            "DeploymentGroup" : deploymentGroupName
        }
            print responseData
        elif event['RequestType'] == 'Update':
            print "No Updates Supported for this Resource"
            responseStatus = 'SUCCESS'
    
    except ClientError as e:
        if e.response['Error']['Code'] == 'ThrottlingException':
            count = 3
            attempts = 0
            while attempts < count:
                print("Retrying Function Execution....")
                time.sleep(random.expovariate(1))
                main(event,context)
                attempts += 1
        else:
            error = " AWS Client %s" % e
            responseStatus = 'FAILED'
            responseData = {'Failure': error}
    except ParamValidationError as e:
        error = "AWS Client %s" % e
        responseStatus = 'FAILED'
        print error
        responseData = {'Failure': error}
    except TypeError as e:
        error = "TypeError: %s" % e
        responseStatus = 'FAILED'
        responseData = {'Failure': error}
    except NameError as e:
        error = "NameError: %s" % e
        responseStatus = 'FAILED'
        responseData = {'Failure': error}
    except AttributeError as e:
        error = "AttributeError: %s" % e
        responseStatus = 'FAILED'
        responseData = {'Failure': error}
    
    sendResponse(event, context, responseStatus, responseData)

def create_deployment_group(deploymentGroupName, application,role, serviceName, cluster, targetgroup1, targetgroup2, prodlistener, testlistener):
    response = codedeploy.create_deployment_group(
        applicationName=application,
        deploymentGroupName=deploymentGroupName,
        deploymentConfigName='CodeDeployDefault.ECSAllAtOnce',
        serviceRoleArn=role,
        autoRollbackConfiguration={
            'enabled': True,
            'events': [
                'DEPLOYMENT_FAILURE',
                'DEPLOYMENT_STOP_ON_REQUEST'
            ]
        },
        deploymentStyle={
            'deploymentType': 'BLUE_GREEN',
            'deploymentOption': 'WITH_TRAFFIC_CONTROL'
        },
        blueGreenDeploymentConfiguration={
            'terminateBlueInstancesOnDeploymentSuccess': {
                'action': 'TERMINATE',
                'terminationWaitTimeInMinutes': 5
            },
            'deploymentReadyOption': {
                'actionOnTimeout': 'CONTINUE_DEPLOYMENT'            
                }
        },
        loadBalancerInfo={
            'targetGroupPairInfoList': [
                {
                    'targetGroups': [
                        {
                            'name': targetgroup1
                        },
                        {
                            'name': targetgroup2
                        }
                    ],
                    'prodTrafficRoute': {
                        'listenerArns': [
                            prodlistener,
                        ]
                    },
                    'testTrafficRoute': {
                        'listenerArns': [
                            testlistener,
                        ]
                    }
                },
            ]
        },
        ecsServices=[
            {
                'serviceName': serviceName,
                'clusterName': cluster
            },
        ]
    )
    return response


def cleanup(application):
    try:
        response = codedeploy.get_deployment_group(
            applicationName=application,
            deploymentGroupName=deploymentGroupName
        )
    except ClientError as e:
        error = " AWS Client %s" % e
        print("Deployment Group Not Found ... Consider Deleted")
        return "SUCCESS"
    response = codedeploy.delete_deployment_group(applicationName=application,deploymentGroupName=deploymentGroupName)    
    print("The deployment group " + deploymentGroupName + " has been deleted successfully.")
    return "SUCCESS"
                                
def sendResponse(event, context, responseStatus, responseData):
    responseBody = {'Status': responseStatus,
                    'Reason': 'See the details in CloudWatch Log Stream: ' + context.log_stream_name,
                    'PhysicalResourceId': context.log_stream_name,
                    'StackId': event['StackId'],
                    'RequestId': event['RequestId'],
                    'LogicalResourceId': event['LogicalResourceId'],
                    'Data': responseData}
    print 'RESPONSE BODY:n' + json.dumps(responseBody)
    responseUrl = event['ResponseURL']
    json_responseBody = json.dumps(responseBody)
    headers = {
        'content-type' : '',
        'content-length' : str(len(json_responseBody))
    }
    response = requests.put(responseUrl,data=json_responseBody,headers=headers)