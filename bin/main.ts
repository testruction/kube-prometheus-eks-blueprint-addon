// import { App } from 'aws-cdk-lib';
// import * as blueprints from '@aws-quickstart/eks-blueprints';
// import { KubePrometheusAddOn } from '../dist';

// const app = new App();

// blueprints.EksBlueprint.builder()
//     .addOns(new blueprints.MetricsServerAddOn)
//     .addOns(new blueprints.ClusterAutoScalerAddOn)
//     .addOns(new blueprints.addons.SSMAgentAddOn) // needed for AWS internal accounts only
//     .addOns(new blueprints.SecretsStoreAddOn) // required to support CSI Secrets
//     .addOns(new KubePrometheusAddOn({
//         namespace: 'monitoring'
//     }))
//     .build(app, 'kube-prometheus-eks');

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';

import { KubePrometheusAddOn } from '../dist';

const app = new cdk.App();
const account = '106523918134';
const region = 'ca-central-1';
const clusterName = 'default';

const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.ArgoCDAddOn(),
    new blueprints.addons.CalicoOperatorAddOn(),
    new blueprints.addons.MetricsServerAddOn(),
    // new blueprints.addons.ClusterAutoScalerAddOn(),
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.CoreDnsAddOn(),
    new blueprints.addons.KubeProxyAddOn(),
    new KubePrometheusAddOn()
];

const stack = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .addOns(...addOns)
    .useDefaultSecretEncryption(true) // set to false to turn secret encryption off (non-production/demo cases)
    .build(app, clusterName);
