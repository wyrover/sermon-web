var mongo = require('mongoskin');
var mongoDB = mongo.db('localhost:27017/sermon', {
    safe: true
});

module.exports = function(app) {
    app.get('/speakers.json', function(req, res) {
        mongoDB.collection('speakers').find({
            status: 1
        }).sort({
            count: -1
        }).toArray(function(err, speakers) {
            if (err) {
                console.log(err);
                res.send([]);
            } else {
                res.send(speakers);
            };
        });
    });

    app.get('/sources.json', function(req, res) {
        mongoDB.collection('sources').find({
            status: 1
        }).sort({
            count: -1
        }).toArray(function(err, sources) {
            if (err) {
                console.log(err);
                res.send([]);
            } else {
                res.send(sources);
            };
        });
    });

    app.get('/sources/:name/albums.json', function(req, res) {
        mongoDB.collection('albums').find({
            status: 1,
            source: req.params.name
        }).sort({
            count: -1
        }).toArray(function(err, albums) {
            if (err) {
                console.log(err);
                res.send([]);
            } else {
                res.send(albums);
            };
        });
    });

    app.get('/speakers/:name/albums.json', function(req, res) {
        mongoDB.collection('albums').find({
            status: 1,
            speaker: req.params.name
        }).sort({
            count: -1
        }).toArray(function(err, albums) {
            if (err) {
                console.log(err);
                res.send([]);
            } else {
                res.send(albums);
            }
        });
    });

    app.get('/albums/:id/sermons.json', function(req, res) {
        mongoDB.collection('albums').findById(req.params.id, function(err, album) {
            if (album) {
                mongoDB.collection('sermons').find({
                    status: 1,
                    album: album.name,
                    speaker: album.speaker
                }).toArray(function(err, sermons) {
                    if (err) {
                        console.log(err);
                        res.send([]);
                    } else {
                        res.send(sermons);
                    };
                });

            } else {
                res.send([]);
            };

        });
    });
};
