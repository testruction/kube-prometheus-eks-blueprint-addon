"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.KubePrometheusAddOn = exports.defaultProps = void 0;
const blueprints = require("@aws-quickstart/eks-blueprints");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const { default: cluster } = require("cluster");
const HTTPS = "https://";
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    chart: "kube-prometheus-stack",
    repository: "https://prometheus-community.github.io/helm-charts",
    version: "46.8.0",
    release: 'blueprints-addon-kube-prometheus',
    name: 'kube-prometheus',
    namespace: 'monitoring',
    values: {}
};
/**
 * Main class to instantiate the Helm chart
 */
class KubePrometheusAddOn extends blueprints.addons.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        blueprints.utils.createNamespace(this.props.namespace, clusterInfo.cluster, true);
        let values = this.populateValues(clusterInfo, this.options);
        const chart = this.addHelmChart(clusterInfo, values);
        new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, 'Kube-Prometheus dashboard URL', {
            value: HTTPS + this.options.subdomain,
            description: 'Kube-Prometheus dashboard URL',
            'exportName': 'KubePrometheursDashboardUrl',
        });
        return Promise.resolve(chart);
    }
    /**
    * populateValues populates the appropriate values used to customize the Helm chart
    * @param helmOptions User provided values to customize the chart
    */
    populateValues(clusterInfo, helmOptions) {
        var _a, _b;
        const values = (_a = helmOptions.values) !== null && _a !== void 0 ? _a : {};
        const annotations = {
            "alb.ingress.kubernetes.io/scheme": "internet-facing",
            "alb.ingress.kubernetes.io/target-type": "ip",
            "alb.ingress.kubernetes.io/certificate-arn": (_b = clusterInfo.getResource(helmOptions.certificateResourceName)) === null || _b === void 0 ? void 0 : _b.certificateArn
        };
        (0, blueprints.utils.setPath)(values, "grafana.ingress.enabled", true);
        (0, blueprints.utils.setPath)(values, "grafana.ingress.ingressClassName", "alb");
        (0, blueprints.utils.setPath)(values, "grafana.ingress.host", helmOptions.subdomain);
        (0, blueprints.utils.setPath)(values, "grafana.ingress.annotations", annotations);
        return values;
    }
}

__decorate([
    (0, blueprints.utils.dependable)('AwsLoadBalancerControllerAddOn'),
    (0, blueprints.utils.dependable)('ExternalsSecretsAddOn')
], KubePrometheusAddOn.prototype, "deploy", null);
exports.KubePrometheusAddOn = KubePrometheusAddOn;
