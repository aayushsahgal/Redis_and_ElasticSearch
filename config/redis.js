var redis = require('redis');

// setting up the redis server
var clientRedis = redis.createClient();

clientRedis.on('connect', function(err) {
    if(err)
		res.send(err);
    console.log('connected');
});

module.exports = clientRedis;