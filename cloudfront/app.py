#!/usr/bin/env python3

from aws_cdk import (
    aws_certificatemanager as acm,
    aws_route53 as dns,
    aws_cloudfront as cloudfront,
    core
)

class CloudFrontStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, hostedzoneid: str, hostedzonename: str, origin_name: str, **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        domain_name = "{}.{}".format("test",hostedzonename)

        hostedzone = dns.HostedZone.from_hosted_zone_attributes(
            self,
            "hosted_zone",
            hosted_zone_id=hostedzoneid,
            zone_name=hostedzonename
        )

        acm_certificate = acm.DnsValidatedCertificate(
            self, 
            "ACMCertGenerator",
            hosted_zone=hostedzone , 
            region="us-east-1", 
            domain_name="test.awsels.com" , 
            validation_method =  acm.ValidationMethod.DNS
        )

        source_configuration = cloudfront.SourceConfiguration(
            custom_origin_source=cloudfront.CustomOriginConfig(
                domain_name=origin_name,
                allowed_origin_ssl_versions=[cloudfront.OriginSslPolicy.TLS_V1_2],
                http_port=80,
                https_port=443,
                origin_protocol_policy=cloudfront.OriginProtocolPolicy.HTTPS_ONLY
            ),
            behaviors=[cloudfront.Behavior(
                compress=False,
                allowed_methods=cloudfront.CloudFrontAllowedMethods.ALL,
                is_default_behavior=True,
                cached_methods=cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD
            )]
        )

        viewer_configuration = cloudfront.ViewerCertificate.from_acm_certificate(
                certificate=acm.Certificate.from_certificate_arn(self, "certificate", certificate_arn=acm_certificate.certificate_arn),
                aliases=[origin_name],
                security_policy=cloudfront.SecurityPolicyProtocol.TLS_V1,
                ssl_method=cloudfront.SSLMethod.SNI
        )


        distribution = cloudfront.CloudFrontWebDistribution(
            self,
            'Distribution',
            origin_configs=[source_configuration],
            viewer_certificate=viewer_configuration,
            price_class=cloudfront.PriceClass.PRICE_CLASS_100,
        )

app = core.App()

env = core.Environment(account="675383074689", region="us-east-1")

CloudFrontStack(app, "DistributionStack", env=env, hostedzoneid="Z62R6N3FQ7WET", hostedzonename="awsels.com", origin_name="Infra-Publi-1LLHKN9PFDXEZ-57518743.us-east-1.elb.amazonaws.com")

app.synth()
