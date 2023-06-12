/**
 * Kube-Prometheus for Amazon EKS Blueprint
 * 
 * Description: This file contains the implementation of the Kube-Prometheus stack for Amazon EKS Blueprint.
 * Kube-Prometeus is a complete stack that leverage Prometheus to monitor Kubernetes and applications running on Kubernetes.
 * 
 * @author "Florian JUDITH <florian.judith@alithy.com>"
 * @version 1.0.0
 * 
 * Copyright (c) [2023], [IBM Corp.]
 * All rights reserved.
 * 
 */

import { Construct } from "constructs";
import { HelmAddOn, HelmAddOnUserProps } from "@aws-quickstart/eks-blueprints";
import { ClusterInfo, Values } from "@aws-quickstart/eks-blueprints";

export interface KubePrometheusAddOnProps extends HelmAddOnUserProps {
    /**
     * The subdomain that will be assigned to the Backstage application.
     */
    subdomain: string;
    certificateResourceName: string;
    /**
     * The registry URL of the Backstage application's Docker image.
     */
    /**
     * The registry URL of the Backstage application's Docker image.
     */
    imageRegistry: string;
    /**
     * The repository name in the "imageRegistry".
     */
    imageRepository: string;
    /**
     * The tag of the Backstage application's Docker image.
     * @default 'latest'
     */
}
/**
 * Main class to instantiate the Helm chart
 */
export declare class KubePrometheusAddOn extends HelmAddOn {
    readonly options: KubePrometheusAddOnProps;
    constructor(props?: KubePrometheusAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
    /**
    * populateValues populates the appropriate values used to customize the Helm chart
    * @param helmOptions User provided values to customize the chart
    */
    populateValues(clusterInfo: ClusterInfo, helmOptions: KubePrometheusAddOnProps): Values;
}
