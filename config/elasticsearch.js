var elasticsearch = require('elasticsearch');

// setting up the elasticsearch server
var clientElastic = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

module.exports = clientElastic;