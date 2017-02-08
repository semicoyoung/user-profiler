var validator = require('validator');
var ALiMns = require('ali-mns');

/*
 * @param mqOptions.accountId 
 * @param mqOptions.accountKeyId
 * @param mqOptions.accountKeySecret
 * @param mqOptions.queueName
 * @param mqOptions.queueRegion
*/
function Extract(mqOptions){
  if (!mqOptions.accountId || !mqOptions.accessKeyId || !mqOptions.accessKeySecret || !mqOptions.queueName || !mqOptions.region) {
    throw new Error('argument lack');
  }

  let account = new ALiMns.Account(mqOptions.accountId, mqOptions.accessKeyId, mqOptions.accessKeySecret);
  let mq = new ALiMns.MQ(mqOptions.queueName, account, mqOptions.queueRegion);
  this.mq = mq;
}

Extract.prototype.extract = function(data) {
  let extractData = [];
  let keyArr = ['phone', 'email', 'userId', 'user_id', 'cookieId', 'cookie_id', 'userName', 'user_name', 'qq', 'weChat', '微信', 'ip'];
  for (let i = 0, len = data.length; i < len; i++) {
    let json = data[i];
    let retObj = {};
    iterJson(json, keyArr, retObj);
    extractData.push(retObj);
  }

  this.mq.sendP(JSON.stringify(extractData)).then(function() {
    console.log('data===', extractData);
  }, function(error) {
    console.log(error.stack);
  });
};

let iterJson = function(json, keyArr, retObj) {
  for(var key in json) {
    if(json[key] && typeof json[key] == 'object') {
      iterJson(json[key], keyArr, retObj);
    } else {
      if (json[key] && json[key] != '' && keyArr.indexOf(key) != -1) {
        if (key == 'email' && !validator.isEmail(json[key])) {
          continue;
        }
        if (key == 'phone' && !validator.isMobilePhone(json[key], 'zh-CN')) {
          continue;
        }
        retObj[key] = json[key];
      }
    }
  }
};

module.exports = Extract;
