var chai = require("chai");
var should = require('chai').should()
var chaiAsPromised = require("chai-as-promised");
require('sinon-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var proxyquire =  require('proxyquire');
var awsTestUtil = require("./awsTestUtil");
var instanceParams = {
    InstanceType: 'c3.large',
    Hostname: 'cliInstance'
};

var awsms = proxyquire('../lib/awsMSPlugin', {'aws-sdk': awsTestUtil.awsStub});


describe('awsMSPlugin', function(){
    it('should throw error if there is no Instance ID', function(){
        var resultPromise = awsms.getMetrics({});
        return resultPromise.should.be.rejectedWith(/\w*Must pass in instance id./);
        
    });
    it('should use parameters passed in to the getMetrics function', function(){
        var options = {};
        options.params = '{"Instance": "someInstanceId", "MetricName": "cpu_idle", "EndTime": "2016-06-06T19:18:00Z", "StartTime": "2016-06-06T13:18:00Z", "Period": "360", "Statistics": "Minimum"}';
        var resultPromise = awsms.getMetrics(options);
        return resultPromise.then(function(data){
            awsms.cloudwatch.getMetricStatistics.getCall(0).args[0].should.have.property("MetricName", "cpu_idle");
        });
        
    });
    it('should set the region on aws config', function(){
        awsTestUtil.awsStub.config = {};
        awsms.getMetrics({region: "aRegion", params: '{"Instance": "someInstanceId"}'});
        return awsTestUtil.awsStub.config.should.have.property('region', 'aRegion');
    });
    it('should resolve metrics data from cloudwatch', function(){
        var resultPromise = awsms.getMetrics({params: '{"Instance": "someInstanceId"}'});
        return resultPromise.then(function(data){
            data.should.equal(awsTestUtil.sampleMetricsData);
        });
    });
    it('should successfully create an instance', function(){
        var resultPromise = awsms.createInstance(instanceParams);
        return resultPromise.then(function(obj) {
            obj.should.have.property('InstanceId', 'somecrazyinstanceid');
        });
    });
    it('should follow recipe when creating instance', function(){
        var resultPromise = awsms.createInstance(instanceParams);
        return resultPromise.then(function(obj) {
            assert.isTrue(awsms.ops.createInstance.called);
            assert.isTrue(awsms.ops.startInstance.called);
        });
    });
    it('should update dependencies on instances', function(){
        var resultPromise = awsms.updateDependencies();
        return resultPromise.then(function(data){
            data.should.have.property('DeploymentId', 'some-deployment-id');
        });
    });
    it('should list available metrics data', function(){
        var resultPromise = awsms.listMetrics({});
        return resultPromise.then(function(data){
            data.should.have.property('Metrics');
        });
    });
    it('should configure the aws-sdk to use west region', function(){
        var resultPromise = awsms.listMetrics({region: "us-west-2"});
        return resultPromise.then(function(data){
            awsTestUtil.awsStub.config.should.have.property('region', 'us-west-2');
        });
    });
       
   
});