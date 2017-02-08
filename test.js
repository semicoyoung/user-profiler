'use strict';

var Entrance = require('./index');

var entrance = new Entrance({
   "accountId": "1922933588405985",
   "accessKeyId": "LTAIU8AfwMXFnHPT",
   "accessKeySecret": "xX5bWiZCZ8xlLiGxJFSHU5S5NVO4Uu",
   "queueName": "user-profiler",
   "queueRegion": "beijing"
});

entrance.extract([{user_id: 1}])
