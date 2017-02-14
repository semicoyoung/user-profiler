本模块服务于 user_profiler 项目，用于收集用户关键信息，然后推送到消息队列

example:

var express = require('express');
var app = new express();

var mqOptions = {
"accountId": "1922933588405985",
"accessKeyId": "LTAIU8AfwMXFnHPT",
"accessKeySecret": "xX5bWiZCZ8xlLiGxJFSHU5S5NVO4Uu",
"queueName": "user-profiler",
"queueRegion": "beijing"
};

var userProfile = require('zhike-user-profile-entrance')(mqOptions);

app.use('/user', userProfile);
app.post('/user', run(action));


