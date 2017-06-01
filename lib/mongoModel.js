var mongo = require('./mongodb.js');

var mongoDb = mongo.GetDb();

module.exports = {
  'InternshipInfo': mongoDb.collection('InternshipInfo')
}

