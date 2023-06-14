# kube-prometheus-eks-blueprint-addon

This module is a Kube-Prometheus addon for https://github.com/aws-quickstart/cdk-eks-blueprints.

# Kube-Prometheus on EKS

The Kube-Prometheus stack is meant for cluster monitoring, so it is pre-configured to collect metrics from all Kubernetes components. In addition to that it delivers a default set of dashboards and alerting rules. Many of the useful dashboards and alerts come from the [kubernetes-mixin](https://github.com/kubernetes-monitoring/kubernetes-mixin) project, similar to this project it provides composable jsonnet as a library for users to customize to their needs.

Components included in this package:

* The [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator)
* Highly available [Prometheus](https://prometheus.io/)
* Highly available [Alertmanager](https://github.com/prometheus/alertmanager)
* [Prometheus node-exporter](https://github.com/prometheus/node_exporter)
* [Prometheus Adapter for Kubernetes Metrics APIs](https://github.com/kubernetes-sigs/prometheus-adapter)
* [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)
* [Grafana](https://grafana.com/)

This example deploys the following resources

* Creates EKS Cluster Control plane with public endpoint (for demo purpose only) with a managed node group
* Deploys supporting add-ons: ClusterAutoScaler, AwsLoadBalancerController, VpcCni, CoreDns, KubeProxy, EbsCsiDriver
* Deploy Kube-Prometheurs on the EKS cluster

Note: we use EKS 1.21 here which is the latest EKS version supported by Kubeflow. see reference below <br>
https://awslabs.github.io/kubeflow-manifests/docs/about/eks-compatibility/

## Prerequisites:

Ensure that you have installed the following tools on your machine.

1. [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
2. [kubectl](https://Kubernetes.io/docs/tasks/tools/)
3. [cdk](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
4. [npm](https://docs.npmjs.com/cli/v8/commands/npm-install)

## Deploy EKS Cluster with Amazon EKS Blueprints for CDK

Clone the repository

```sh
git clone https://github.com/aws-samples/cdk-eks-blueprints-patterns.git
```

Create a CDK project, Bootstrap your environment and install dependency 

```sh
cdk init app --language typescript
cdk bootstrap aws://<AWS_ACCOUNT_ID>/<AWS_REGION>
npm i @aws-quickstart/eks-blueprints
npm i kube-prometheus-eks-bluprints-addon

```

Replace the contents of bin/<your-main-file>.ts  with the following:
```typescript
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as KubeflowAddOn from 'eks-blueprints-cdk-kubeflow-ext';
const app = new cdk.App();
// AddOns for the cluster.
const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.MetricsServerAddOn,
    new blueprints.addons.ClusterAutoScalerAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.CoreDnsAddOn(),
    new blueprints.addons.KubeProxyAddOn(),
    new blueprints.addons.EbsCsiDriverAddOn(),
    new KubeflowAddOn({
         namespace: 'monitoring'
     })
];
const account = 'XXXXXXXXXXXXX'
const region = 'your region'
const props = { env: { account, region } }
new blueprints.EksBlueprint(app, { id: 'kube-prometheus-eks', addOns}, props)
```

Deploy the stack using the following command

```sh
cdk deploy
```

## Verify the resources

Let’s verify the resources created by Steps above.

```bash
kubectl get nodes  # Output shows the EKS Managed Node group nodes

kubectl get ns | monitoring  # Output shows kubeflow namespace

kubectl get pods --namespace=monitoring  # Output shows kubeflow pods
```


## Access Kube-Prometheus dashboards

log into Grafana UI by creating a port-forward to the grafana service<br>

```sh
kubectl -n monitoring port-forward svc/blueprints-addon-prometheus-grafana 50080:80
```

and open this browser: http://localhost:50080/

## Cleanup

To clean up your EKS Blueprints, run the following commands:

```sh
cdk destroy --all
```
