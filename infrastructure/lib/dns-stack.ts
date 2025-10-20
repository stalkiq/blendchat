import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export interface DnsStackProps extends StackProps {
  readonly domainName: string; // e.g. chatbudi.com
  readonly hostedZoneId?: string; // optional if public zone already in account
}

export class DnsStack extends Stack {
  public readonly zone: route53.IHostedZone;
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    this.zone = props.hostedZoneId
      ? route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
          hostedZoneId: props.hostedZoneId!,
          zoneName: props.domainName,
        })
      : route53.HostedZone.fromLookup(this, 'ZoneLookup', { domainName: props.domainName });

    this.certificate = new acm.Certificate(this, 'SiteCert', {
      domainName: props.domainName,
      subjectAlternativeNames: [`www.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(this.zone),
    });

    new CfnOutput(this, 'CertificateArn', { value: this.certificate.certificateArn });
  }
}

