var mongo = require('mongoskin');
var mongoDB = mongo.db('localhost:27017/sermon', {
    safe: true
});

mongoDB.collection('speakers').find({}, function(err, result) {
    result.each(function(err, speaker) {
        if (speaker && speaker.name) {
            mongoDB.collection('sermons').count({speaker: speaker.name}, function(err, count) {
                mongoDB.collection('speakers').update({
                    name: speaker.name
                }, {
                    $set: {
                        count: count
                    }
                }, function(err, updated) {

                });
            });
        }
    })
});

mongoDB.collection('sources').find({}, function(err, result) {
    result.each(function(err, source) {
        if (source && source.name) {
            mongoDB.collection('sermons').count({source: source.name}, function(err, count) {
                mongoDB.collection('sources').update({
                    name: source.name
                }, {
                    $set: {
                        count: count
                    }
                }, function(err, updated) {

                });
            });
        }
    })
});

mongoDB.collection('albums').find({}, function(err, result) {
    result.each(function(err, album) {
        if (album && album.name) {
            mongoDB.collection('sermons').count({album: album.name, speaker: album.speaker}, function(err, count) {
                mongoDB.collection('albums').update({
                    name: album.name
                }, {
                    $set: {
                        count: count
                    }
                }, function(err, updated) {

                });
            });
        }
    })
});