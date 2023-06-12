import { App } from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { KubeflowAddOn } from '../dist';

const app = new App();

blueprints.EksBlueprint.builder()
    .addOns(new blueprints.MetricsServerAddOn)
    .addOns(new blueprints.ClusterAutoScalerAddOn)
    .addOns(new blueprints.addons.SSMAgentAddOn) // needed for AWS internal accounts only
    .addOns(new blueprints.SecretsStoreAddOn) // requires to support CSI Secrets
    .addOns(new KubeflowAddOn({
         namespace: 'monitoring'
     }))
     .build(app, 'eks-blueprint');