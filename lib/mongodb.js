var mongoDb;

exports.SetDb = function(param) {
    mongoDb = param;
};

exports.GetDb = function() {
    return mongoDb;
};

exports.mongoDb = null;
