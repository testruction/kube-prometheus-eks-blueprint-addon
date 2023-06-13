/**
 * Kube-Prometheus for Amazon EKS Blueprint
 * 
 * Description: This file contains the implementation of the Kube-Prometheus stack for Amazon EKS Blueprint.
 * Kube-Prometeus is a complete stack that leverage Prometheus to monitor Kubernetes and applications running on Kubernetes.
 * 
 * @author "Florian JUDITH <florian.judith.b@gmail.com>"
 * @version 1.3.0
 * Copyright (c) [2023], [Testruction.io]
 * All rights reserved.
 * 
 */

import { Construct } from "constructs";
import { HelmAddOn, HelmAddOnUserProps } from "@aws-quickstart/eks-blueprints/dist/addons/helm-addon";
import { dependable, setPath, createNamespace } from "@aws-quickstart/eks-blueprints/dist/utils";
import { ClusterInfo, Values } from "@aws-quickstart/eks-blueprints/dist/spi";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CfnOutput } from 'aws-cdk-lib';

const HTTPS = "https://";

/**
 * User provided options for the Helm Chart
 */
export interface KubePrometheusAddOnProps extends HelmAddOnUserProps {
    /**
     * The namespace that will be assigned to the Kube-Prometheus stack.
     * @default 'monitoring'
     */
    namespace: string;
    /**
     * The subdomain that will be assigned to the Backstage application.
     */
    subdomain: string;

    /**
     * The resource name of the certificate to be assigned to the Load Balancer.
     */
    certificateResourceName: string;
}

/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: 'kube-prometheus',
    namespace: 'monitoring',
    chart: "kube-prometheus-stack",
    version: "46.8.0",
    release: 'blueprints-addon-kube-prometheus',
    repository: "https://prometheus-community.github.io/helm-charts",
    values: {}
};

/**
 * Main class to instantiate the Helm chart
 */
export class KubePrometheusAddOn extends HelmAddOn {
    readonly options: KubePrometheusAddOnProps;

    constructor(props?: KubePrometheusAddOnProps) {
        super({...defaultProps, ...props});
        this.options = this.props as KubePrometheusAddOnProps;
    }

    @dependable('AwsLoadBalancerControllerAddOn')
    @dependable('ExternalsSecretsAddOn')
    deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        createNamespace(this.options.namespace, clusterInfo.cluster, true);

        let values: Values = this.populateValues(clusterInfo, this.options);
        const chart = this.addHelmChart(clusterInfo, values);

        new CfnOutput(clusterInfo.cluster.stack, 'Kube-Prometheus dashboard URL', {
            value: HTTPS + this.options.subdomain,
            description: "Kube-Prometheus dashboard URL",
            exportName: "KubePrometheusDashboardUrl",
        });

        return Promise.resolve(chart);
    }

  /**
  * populateValues populates the appropriate values used to customize the Helm chart
  * @param helmOptions User provided values to customize the chart
  */
  populateValues(clusterInfo: ClusterInfo, helmOptions: KubePrometheusAddOnProps): Values {
    const values = helmOptions.values ?? {};

    const annotations = {
      "alb.ingress.kubernetes.io/scheme": "internet-facing",
      "alb.ingress.kubernetes.io/target-type": "ip",
      "alb.ingress.kubernetes.io/certificate-arn": clusterInfo.getResource<ICertificate>(helmOptions.certificateResourceName)?.certificateArn
    };

    setPath(values, "grafana.ingress.enabled", true);
    setPath(values, "grafana.ingress.ingressClassName", "alb");
    setPath(values, "grafana.ingress.host", helmOptions.subdomain);
    setPath(values, "grafana.ingress.annotations", annotations);

    return values;
  }
}
