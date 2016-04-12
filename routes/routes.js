var express = require('express');
var router = express.Router();
var async =  require('async');

var clientElastic = require('../config/elasticsearch.js');
var clientRedis = require('../config/redis.js');

router.post('/index', function(req, res, next) {
	
	var message = req.body.message;

	async.parallel({
    	// indexes the message into elasticsearch
	    elasticIndexing: function(callback) {
	        clientElastic.create({
			  index: 'myindex',
			  type: 'message',
			  body: {
			    message: message
			  }
			}, function (err, doc) {
				if(err)
					res.send(err);
				callback(null, doc);
			});
	    },
	    // indexes the message into redis
	    redisIndexing: function(callback) {
	        clientRedis.rpush(['list', message], function(err, doc) {
				if(err)
					res.send(err);
				var result={'created': 'true', 'Total messages in list': doc};
		    	callback(null, result);
			});
	    }
	}, 
		// returns the combined result from both indexing
		function(err, results) {
			if(err)
				res.send(err);
	       	res.json(results);
		});
});


router.get('/index', function(req, res, next) {
	
	// returns all the messages stored in the message list in redis
	clientRedis.lrange('list', 0, -1, function(err, docs) {
		if(err)
			res.send(err);
    	res.json(docs);
	});
});

router.get('/search/:querystring', function(req, res, next) {

	var search = req.params.querystring;
	
	// searches the message in elasticsearch and returns it 
	clientElastic.search({
	  index: 'myindex',
	  type: 'message',
	  body: {
    	query: {
      		match: {
        		message: search
        	}
      	}
      }
	}, function (err, doc) {
		if(err)
			res.send(err);
		res.json(doc);
	});
});

router.get('/search', function(req, res, next) {
	
	// searches and returns all the messages of index myindex from elasticsearch
	clientElastic.search({
	  index: 'myindex',
	  type: 'message'
	}, function (err, docs) {
		if(err)
			res.send(err);
		res.json(docs);
	});
});

module.exports = router;