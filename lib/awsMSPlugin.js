var AWS = require('aws-sdk');
AWS.config['region'] = 'us-east-1';
AWS.config.setPromisesDependency(require('bluebird'));

function isMSStack(stackdata){
    return stackdata['Name'] == 'cscmsdemo';
}

function isMSLayer(stackdata){
    return stackdata['Name'] == 'cscmslayer';
}

var awsms = {};
awsms.ops = new AWS.OpsWorks();
awsms['createInstance'] = function (instanceParams){
    var instanceData = {};
    return getStackId().then(function(stackid){
        instanceParams['StackId'] = stackid;
        var request = awsms.ops.describeLayers({StackId: stackid});
        return request.promise();
    }).then(function(layerdata){
        var layerarray = layerdata['Layers'];
        var layer = layerarray.find(isMSLayer);
        instanceParams['LayerIds'] = [layer['LayerId']];
        var request = awsms.ops.createInstance(instanceParams);
        return request.promise();
    }).then(function (instancedata){
        instanceData = instancedata;
        var request = awsms.ops.startInstance(instancedata);
        return request.promise()
    }).then(function(data){
        return instanceData;
    });
}

awsms['updateDependencies'] = function (options){
     return getStackId().then(function(stackdata){
         var params = {};
         params['StackId'] = stackdata;
         params['Command'] = { Name: 'update_dependencies'};
         var request = awsms.ops.createDeployment(params);
         return request.promise();
        });
}

awsms['listMetrics'] = function (options){
    if(options.region){
        AWS.config['region'] = options.region;    
    }
    awsms.cloudwatch = new AWS.CloudWatch();
    var request = awsms.cloudwatch.listMetrics({});
    return request.promise();
}

awsms['getMetrics'] = function (options){
    if(options.region){
        AWS.config['region'] = options.region;    
    }
    awsms.cloudwatch = new AWS.CloudWatch();
    var params = {}
    if(options.params){
        params = JSON.parse(options.params);
    }
    try{
        setRequiredParams(params);
    }catch(err){
        return Promise.reject(err);
    }
    var request = awsms.cloudwatch.getMetricStatistics(params);
    return request.promise();
}

function getStackId(){
    var request = awsms.ops.describeStacks();
    
    return request.promise().then(function(stackdata){
        var stackarray = stackdata['Stacks'];
        var msStack =  stackarray.find(isMSStack);
        return new Promise(function(resolve) {
            resolve(msStack['StackId']);
        });
    });
}

awsms['getStackId'] = getStackId;

function setRequiredParams(params){
    console.log(params);
    if(!params['Instance']){
        throw new Error("Must pass in instance id.");
    }
    params['Dimensions'] = [{Name: "InstanceId",
        Value: params['Instance']}];
    delete params['Instance'];
    if(!params['EndTime']){
        //params['EndTime'] = "2016-06-06T19:18:00Z";
        var endTime = new Date();
        params['EndTime'] = endTime;
    }
    if(!params['MetricName']){
         params['MetricName'] = "cpu_system";
    }
    params['Namespace'] = "AWS/OpsWorks";
    if(!params['StartTime']){
        //params['StartTime'] = "2016-06-06T13:18:00Z";
        var startTime = new Date();
        startTime.setHours(startTime.getHours() - 6);
        params['StartTime'] = startTime;
    }
    if(!params['Period']){
        params['Period'] = 300;
    }
    if(!params['Statistics']){
        params['Statistics'] = ['Average'];
    }
}

module.exports = awsms;
