#!/usr/bin/env node

var fs = require('fs');
var cli = require('cli');
var awsinquirer = require("./awsInquirer");
var awsms = require("./awsMSPlugin");

var cscmscli = {
    listMetrics: function(options){
        awsms.listMetrics({}).then(function(metricsData){
            console.log(JSON.stringify(metricsData, null, 4));
        });
    },
    getMetrics: function(options){
        awsms.getMetrics(options).then(function(metricsData){
            console.log("return of metrics data");
            
            console.log(metricsData);
        }).catch(function(err){
            console.log("err of metrics data");
            for (var name in err) {
            if (err.hasOwnProperty(name)) {
                console.log(name);
            }
        }
            console.log(err);
        });
    },
    createInstance: function(options){
        if(options.file){
          var contents = fs.readFileSync(options.file);
          var jsonContent = JSON.parse(contents);
          awsms.createInstance(jsonContent, function(err, data){
           if(err) console.log(err, err.stack);
           else console.log(data);
          });
        }
        else{
            awsinquirer.createInstance();
        }
    }, 
    updateDependencies: function(options){
        awsms.updateDependencies(options);
    },
    getStackId: function(options){
        awsms.getStackId(options).then(function(data){
            console.log(data);
        });
    }
  };


cli.parse({
    log:   ['l', 'Enable logging'],
    file:  ['f', 'JSON file with request parameters', 'file'],
    serve: [false, 'Serve static files from PATH', 'path', './public'],
    region: ['r', "Region", "string"],
    params: ['p', "Parameters as json string", "string"]
    
}, ['createInstance', 'listMetrics', 'getMetrics', 'updateDependencies', 'getStackId']);

cli.main(function(args, options) {
    var params = {};
    try{
        cscmscli[cli.command](options);
    }catch(err){
        console.log("main error");
        for (var name in err) {
            if (err.hasOwnProperty(name)) {
                console.log(name);
            }
        }
        cli.fatal(err);
    }
    
});