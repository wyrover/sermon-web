var mongo = require('mongoskin');
var mongoDB = mongo.db('localhost:27017/sermon', {safe: true});

var carrier = require('carrier');

process.stdin.resume();
carrier.carry(process.stdin, function(line) {
	var album = JSON.parse(line);

	if(album.speaker) {
		album.speaker = album.speaker.split('、')[0];
		album.speaker = album.speaker.replace(/(牧师|博士|长老|老师|教授)/, '');	
	}

	if(album.name) {
		album.name = album.name.replace(/《/, '');	
		album.name = album.name.replace(/》/, '');
	}

	if(album.speaker) {
		if(album.speaker === '远') {
			album.speaker = '远志明';
		} else if(album.speaker === '张') {
			album.speaker = '张伯笠';
		} else if(album.speaker === '唐') {
			album.speaker = '唐崇荣';
		} else if(album.speaker === '于宏')
			album.speaker = '于宏洁';
			
		if(album.speaker.length < 2) {
			album.speaker = '';
		}
	}

	if(album.source) {
		mongoDB.collection('sources').findOne({'name':album.source}, function(err, result) {
			if (err) {
				throw err;
			};

			if (! result) {
				mongoDB.collection('sources').insert({'name': album.source, 'status': 1}, function(err, result) {
					if (err) {
						throw err;
					};
				});
			}
		})
	}

	if(album.speaker) {
		mongoDB.collection('speakers').findOne({'name':album.speaker}, function(err, speaker) {
			if (err) {
				throw err;
			};

			console.log(speaker);

			if (! speaker) {
				mongoDB.collection('speakers').insert({'name': album.speaker, 'status': 1}, function(err, speaker) {
					if (err) {
						throw err;
					};
				});
			}
		})
	}

	if(album.speaker && album.name) {
		mongoDB.collection('albums').findOne({'name':album.name}, function(err, result) {
			if (err) {
				throw err;
			};

			if (! result) {
				mongoDB.collection('albums').insert({
					'name': album.name, 
					'status': 1,
					'speaker': album.speaker
				}, function(err, result) {
					if (err) {
						throw err;
					};
				});
			}
		})
	}

	if(album.items) {
		for(var i=0; i<album.items.length; i++) {
			var sermon = {
				speaker: (album.speaker) ? album.speaker : '',
				album: album.name,
				source: (album.source) ? album.source : '',
				url: album.items[i],
				name: album.items[i].replace(/^.*\/|\.[^.]*$/g, ''),
				status: 1
			};

			mongoDB.collection('sermons').insert(sermon, function(err, sermon) {
				if (err) {
					throw err;
				};
				console.log(sermon);
			});

		}
	}
	

});