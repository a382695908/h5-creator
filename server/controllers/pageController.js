var pageModel = require('../model/page');
var moment = require('moment')

exports.preview = function*() {
  var ctx = this;
  var body = ctx.request.body;
  if (!body.content) {
    return this.body = {
      code: 0,
      msg: '内容不能为空'
    }
  }

  var pageContent;
  if (body.id) {
    pageContent = yield pageModel.findOne({
      "_id": body.id
    });
    pageContent.content = body.content;
    pageContent.name = body.name;
    pageContent.save();
    return this.body = {
      code: 1,
      data: {
        content: pageContent.content,
        id: pageContent._id,
        link: 'http://192.168.1.13:3001/preview?id=' + pageContent._id,
        name: pageContent.name
      }
    }
  }

  var page = new pageModel(body);
  var newObj = yield page.save();
  return this.body = {
    code: 1,
    data: {
      content: newObj.content,
      id: newObj._id,
      link: 'http://192.168.1.13:3001/preview?id=' + newObj._id,
      name: newObj.name
    }
  }
}

exports.delete = function*() {
  var ctx = this;
  var body = ctx.request.body;
  if (!body.id) {
    return this.body = {
      code: -1,
      msg: 'id不能为空'
    }
  }

  const result = yield pageModel.remove({
    _id: body.id
  });
  if (result.result.n) {
    return this.body = {
      code: 0,
      msg: '删除成功'
    }
  }
  return this.body = {
    code: 0,
    msg: '没有找到匹配的数据'
  }
}

exports.getPagelist = function*() {
  var ctx = this;
  var body = ctx.request.query;
  var limit = 20;
  var start = (body.page || 0) * limit;
  var pageContent;
  if (body.id) {
    pageContent = yield pageModel.findOne({
      "_id": body.id
    });
    return this.body = {
      code: 1,
      data: {
        content: pageContent.content,
        id: pageContent._id,
        link: 'http://192.168.1.13:3001/preview?id=' + pageContent._id,
        name: pageContent.name
      }
    }
  }

  var result = yield pageModel.find({}).skip(start).limit(limit).sort('-create_time');
  var count = yield pageModel.count();
  for (var i = 0, l = result.length; i < l; i++) {
    if (result[i].create_time) {
      result[i].create_time = moment(result[i].create_time).format("YYYY-MM-DD HH:mm:ss");
      console.log(result[i].create_time)
    } else {
      result[i].create_time = '时间丢了'
    }
  }

  return this.body = {
    code: 1,
    data: {
      lists: result || [],
      count: count || 0
    }
  }
}
