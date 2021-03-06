'use strict';
var validator = require('validator');
var ALiMns = require('ali-mns');
var _ = require('lodash');
/*
 * @param mqOptions.accountId
 * @param mqOptions.accountKeyId
 * @param mqOptions.accountKeySecret
 * @param mqOptions.queueName
 * @param mqOptions.queueRegion
 */
function Extract (mqOptions) {
  mqOptions = mqOptions || {};
  if (!mqOptions.accountId || !mqOptions.accessKeyId || !mqOptions.accessKeySecret || !mqOptions.queueName || !mqOptions.queueRegion) {
    throw new Error('argument lack');
  }

  let account = new ALiMns.Account(mqOptions.accountId, mqOptions.accessKeyId, mqOptions.accessKeySecret);
  let mq = new ALiMns.MQ(mqOptions.queueName, account, mqOptions.queueRegion);

  return function (req, res, next) {
    let params = {};
    switch (req.method) {
      case 'GET':
        params = req.query;
        break;
      default:
        params = req.body;
        break;
    }

    _.assign(params, req.params);

    let keyMap = {
      'phone': 'phone',
      'Phone': 'phone',
      'sell': 'phone',
      'mobile': 'phone',
      'mobilePhone': 'phone',
      'mobile_phone': 'phone',
      'email': 'email',
      'mail': 'email',
      'user_id': 'user_id',
      'userId': 'user_id',
      'cookie_id': 'cookie_id',
      'cookieId': 'cookie_id',
      'cookie': 'cookie_id',
      'user_name': 'user_name',
      'userName': 'user_name',
      'name': 'user_name',
      'ip': 'ip',
      'IP': 'ip',
      'age': 'age',
      'address': 'address',
      'third': 'third',
      'source': 'source',
      'nickname': 'nickname',
      'birthday': 'birthday',
      'qq': 'qq',
      'QQ': 'qq',
      'qq_number': 'qq',
      'qqNumber': 'qq',
      'QQ_number': 'qq',
      'QQNumber': 'qq',
      'wechat': 'wechat',
      'weChat': 'wechat',
      '微信': 'wechat'
    };

    let extractResult = [];
    if (params instanceof Array) {
      for (let i = 0, len = params.length; i < len; i++) {
        let retObj = {};
        iterData(params[i], keyMap, retObj);
        if (!_.isEmpty(retObj)) {
          extractResult.push(retObj);
        }
      }
    } else if (params instanceof Object) {
      let retObj = {};
      iterData(params, keyMap, retObj);
      if (!_.isEmpty(retObj)) {
        extractResult.push(retObj);
      }
    }

    if (extractResult && extractResult.length) {
      let sendArr = [];
      for (let j = 0, jLen = extractResult.length; j < jLen; j++) {
        // if current data is too big, then abandon it
        if (byteCount(JSON.stringify(extractResult[j])) >= 64000) {
          continue;
        }

        if (byteCount(JSON.stringify(sendArr) + JSON.stringify(extractResult[j]) + ',') >= 64000) {
          mq.sendP(JSON.stringify(sendArr)).then(function () {}, function (error) {
            console.log(error);
          });
          sendArr = [];
        }

        sendArr.push(extractResult[j]);
      }

      if (sendArr && sendArr.length) {
        mq.sendP(JSON.stringify(sendArr)).then(function() {}, function(error) {
          console.log(error);
        });
      }
    }

    next();
  }
}

let iterData = function (data, keyMap, retObj) {
  // data is an Array
  if (data instanceof Array) {
    for (let i = 0, len = data.length; i < len; i++) {
      iterData(data[i], keyMap, retObj);
    }
  } else if (data && data instanceof Object) {  // data is an Object
    for (let key in data) {
      if (data[key] && data[key] instanceof Object) {
        iterData(data[key], keyMap, retObj);
      } else {
        let temp = null;
        try {
          temp = JSON.parse(data[key]);
        } catch (err) {

        }
        if (temp && temp instanceof Object) {
          iterData(temp, keyMap, retObj);
        } else if (keyMap[key]) {
          if (keyMap[key] == 'phone' && !validator.isMobilePhone(String(data[key]), 'zh-CN')) {
            continue;
          } else if (keyMap[key] == 'email' && !validator.isEmail(data[key])) {
            continue;
          } else {
            retObj[keyMap[key]] = data[key];
          }
        }
      }
    }
  }
};

let byteCount = function (s) {
  return encodeURI(s).split(/%..|./).length - 1;
}

module.exports = Extract;

