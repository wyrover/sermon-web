var mongo = require('mongoskin');
var mongoDB = mongo.db('localhost:27017/sermon', {safe: true});

module.exports = function(app) {
	app.get('/speakers', function(req, res){
		mongoDB.collection('speakers').find({status: 1}).sort({count: -1}).toArray(function(err, speakers){
			res.send(speakers);
		});
	});

	app.get('/sources', function(req, res){
		mongoDB.collection('sources').find({status: 1}).sort({count: -1}).toArray(function(err, sources){
			res.send(sources);
		});
	});

	app.get('/sources/:name/albums', function(req, res){
		mongoDB.collection('albums').find({status: 1, source: req.params.name}).sort({count: -1}).toArray(function(err, albums){
			res.send(albums);
		});
	});

	app.get('/speakers/:name/albums', function(req, res){
		mongoDB.collection('albums').find({status: 1, speaker: req.params.name}).sort({count: -1}).toArray(function(err, albums){
			res.send(albums);
		});
	});

	app.get('/albums/:id/sermons', function(req, res){
		mongoDB.collection('albums').findById(req.params.id, function(err, album) {
			mongoDB.collection('sermons').find({status: 1, album: album.name, speaker: album.speaker}).toArray(function(err, sermons){
				res.send(sermons);
			});
		})
		
	})
};
