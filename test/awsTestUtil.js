var sinon = require('sinon');
require('sinon-as-promised');
var awsTestUtil = {};

var instanceData = { InstanceId: 'somecrazyinstanceid' };

var listMetricsData = {
    ResponseMetadata: {
        RequestId: "f0123aa8-3726-11e6-882b-751d1d41336a"
    },
    Metrics: [
        {
            Namespace: "AWS/OpsWorks",
            MetricName: "load_15",
            Dimensions: [
                {
                    Name: "InstanceId",
                    Value: "556f9767-efef-4464-9e80-fb9544924725"
                }
            ]
        },
        {
            Namespace: "AWS/OpsWorks",
            MetricName: "cpu_user",
            Dimensions: [
                {
                    Name: "InstanceId",
                    Value: "556f9767-efef-4464-9e80-fb9544924725"
                }
            ]
        },
        {
            Namespace: "AWS/OpsWorks",
            MetricName: "memory_free",
            Dimensions: [
                {
                    Name: "InstanceId",
                    Value: "556f9767-efef-4464-9e80-fb9544924725"
                }
            ]
        }
    ]
}

var layersData = {
    Layers: [
        {
            StackId: "0985cec1-f729-49f6-ac14-46a6db059984", 
            LifecycleEventConfiguration: {
                "Shutdown": {
                    "DelayUntilElbConnectionsDrained": false, 
                    "ExecutionTimeout": 120
                }
            }, 
            Packages: [], 
            Name: "cscmslayer", 
            CustomRecipes: {
                Undeploy: [], 
                Setup: [
                    "opsworks_cookbook_demo::install_package"
                ], 
                Configure: [], 
                Shutdown: [], 
                Deploy: []
            }, 
            CustomSecurityGroupIds: [], 
            DefaultRecipes: {
                Undeploy: [], 
                Setup: [
                    "opsworks_initial_setup", 
                    "ssh_host_keys", 
                    "ssh_users", 
                    "mysql::client", 
                    "dependencies", 
                    "ebs", 
                    "opsworks_ganglia::client"
                ], 
                Configure: [
                    "opsworks_ganglia::configure-client", 
                    "ssh_users", 
                    "mysql::client", 
                    "agent_version"
                ], 
                "Shutdown": [
                    "opsworks_shutdown::default"
                ], 
                "Deploy": [
                    "deploy::default"
                ]
            }, 
            VolumeConfigurations: [], 
            AutoAssignElasticIps: false, 
            EnableAutoHealing: true, 
            AutoAssignPublicIps: true, 
            UseEbsOptimizedInstances: false, 
            LayerId: "someId", 
            Shortname: "cscms", 
            DefaultSecurityGroupNames: [
                "AWS-OpsWorks-Custom-Server"
            ], 
            Type: "custom", 
            CreatedAt: "2016-06-07T20:43:57+00:00"
        }
    ]
}




var sampleMetricsData = { ResponseMetadata: { RequestId: 'de4faf6e-3252-11e6-977f-238bedf3cc6a' }, Label: 'cpu_system',
                          Datapoints: [{Timestamp: 'Tue Jun 14 2016 17:00:00 GMT+0000 (UTC)', Average: 0, Unit: 'None'},
                                       {Timestamp: 'Tue Jun 14 2016 12:30:00 GMT+0000 (UTC)', Average: 0.5980000000000001, Unit: 'None'},
                                       { Timestamp: 'Tue Jun 14 2016 15:35:00 GMT+0000 (UTC)', Average: 0.49800000000000005, Unit: 'None' }
                                      ]
                        };
var nonCSCMSStack = {
            StackId: "longStackId", 
            DefaultRootDeviceType: "ebs", 
            Name: "My Sample Stack (Linux)", 
            HostnameTheme: "Layer_Dependent", 
            UseCustomCookbooks: true, 
            UseOpsworksSecurityGroups: true, 
            Region: "us-east-1", 
            DefaultAvailabilityZone: "us-east-1a", 
            CustomCookbooksSource: {
                Url: "someURL", 
                Type: "archive"
            }, 
            ConfigurationManager: {
                Version: "12", 
                Name: "Chef"
            }, 
            ChefConfiguration: {}, 
            CreatedAt: "2016-05-11T20:00:19+00:00", 
            Attributes: {
                Color: "rgb(45, 114, 184)"
            }, 
            DefaultOs: "Amazon Linux 2016.03"
        }

var CSCMSStack = {
            StackId: "anotherstackid", 
            ServiceRoleArn: "arn:aws:iam::somenumber:role/aws-opsworks-service-role", 
            VpcId: "somevpcid", 
            DefaultRootDeviceType: "ebs", 
            Name: "cscmsdemo", 
            HostnameTheme: "Layer_Dependent", 
            UseCustomCookbooks: true, 
            UseOpsworksSecurityGroups: true, 
            Region: "us-west-2", 
            DefaultAvailabilityZone: "us-west-2a", 
            CreatedAt: "2016-06-07T20:43:14+00:00", 
            CustomCookbooksSource: {
                Url: "someURL", 
                Username: "SOMEUSERNAME", 
                Password: "*****FILTERED*****", 
                Type: "s3"
            }, 
            ConfigurationManager: {
                Version: "11.10", 
                Name: "Chef"
            }, 
            ChefConfiguration: {
                BerkshelfVersion: "3.2.0", 
                ManageBerkshelf: false
            }, 
            DefaultSubnetId: "subnet-7c19aa18", 
            DefaultSshKeyName: "bosh", 
            DefaultInstanceProfileArn: "arn:aws:iam::somenumber:instance-profile/aws-opsworks-ec2-role",
            DefaultOs: "Amazon Linux 2016.03"
}

var stacksData = {
    Stacks: [nonCSCMSStack, CSCMSStack]
}

var deploymentData = { DeploymentId: 'some-deployment-id' };

var awsStub = {};
function createOpsWorksStub(){
    var describeStacksPromise = sinon.stub().resolves(stacksData)();
    var describeLayersPromise = sinon.stub().resolves(layersData)();
    var createInstancePromise = sinon.stub().resolves(instanceData)();
    var startInstancePromise = sinon.stub().resolves({})();
    var createDeploymentPromise = sinon.stub().resolves(deploymentData)();
    var describeStacksrequest = { promise: sinon.stub().returns(describeStacksPromise)};
    var describeLayersrequest = { promise: sinon.stub().returns(describeLayersPromise)};
    var createInstancerequest = { promise: sinon.stub().returns(createInstancePromise)};
    var startInstancerequest = { promise: sinon.stub().returns(startInstancePromise)};
    var createDeploymentRequest = { promise: sinon.stub().returns(createDeploymentPromise)};
    return function(){
            this.describeStacks = sinon.stub().returns(describeStacksrequest);
            this.describeLayers = sinon.stub().returns(describeLayersrequest);
            this.createInstance = sinon.stub().returns(createInstancerequest);
            this.startInstance = sinon.stub().returns(startInstancerequest);
            this.createDeployment = sinon.stub().returns(createDeploymentRequest);
    }
}

function createCloudWatchStub(){
    var GetMetricsPromise = sinon.stub().resolves(sampleMetricsData)();
    var ListMetricsPromise = sinon.stub().resolves(listMetricsData)();
    var getMetricsRequest = { promise: sinon.stub().returns(GetMetricsPromise)};
    var listMetricsRequest = { promise: sinon.stub().returns(ListMetricsPromise)};
    return function(){
            this.getMetricStatistics = sinon.stub().returns(getMetricsRequest);
            this.listMetrics = sinon.stub().returns(listMetricsRequest);
    }
}
awsTestUtil.awsStub = awsStub;
awsTestUtil.instanceData = instanceData;
awsTestUtil.listMetricsData = listMetricsData;
awsTestUtil.layersData = layersData;
awsTestUtil.sampleMetricsData = sampleMetricsData;
awsTestUtil.nonCSCMSStack = nonCSCMSStack;
awsTestUtil.CSCMSStack = CSCMSStack;
awsTestUtil.stacksData = stacksData;
awsTestUtil.deploymentData = deploymentData;
awsStub.OpsWorks = createOpsWorksStub();
awsStub.CloudWatch = createCloudWatchStub();
module.exports = awsTestUtil;