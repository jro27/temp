var inquirer = require("inquirer");
var awsms = require("./awsMSPlugin");

var awsinquirer = {};

awsinquirer['createInstance'] = function(){
    //var params = {};
    inquirer.prompt([
    {
        type: 'list',
        name: 'InstanceType',
        message: 'What type do you want?',
        choices: ['c3.small', 'c3.medium', 'c3.large', 'c3.po'],
    },
     {
        type: 'input',
        name: 'Hostname',
        message: 'Host name'
    },
    {
        type: 'input',
        name: 'SshKeyName',
        message: 'ssh key name'
    }
              
    ]).then(function(answers){
        return awsms.createInstance(answers);
    }).then(function(data){
        console.log(data);
    }).catch(function(err){
        console.log(err);
    });
}

module.exports = awsinquirer;