var http = require('http');
var url = require('url');
var Busboy = require('busboy');
var cors = require('cors')();
var router = require('./router');
var port = process.env.PORT || 3000;

console.log('Starting sever on port ' + port);

var multipart = function(req, done) {
  var busboy = new Busboy({ headers: req.headers });
  var buffers = [];

  if (!req.body) {
    req.body = {};
  }

  busboy.on('file', function(field, file) {
    file.on('data', function(data) {
      buffers.push(data);
    });
    file.on('end', function() {
      req.body[field] = Buffer.concat(buffers);
    });
  });

  busboy.on('field', function(field, val) {
    req.body[field] = val;
  });

  busboy.on('finish', done);

  req.pipe(busboy);
};

var requestHandler = function(req, res) {
  var path = url.parse(req.url).pathname;
  console.log('Request to ' + req.method + ' ' + path);

  if (req.method === 'POST' && req.headers['content-type']) {
    multipart(req, function() {
      cors(req, res, function() {
        router(req.method.toUpperCase(), path, req, res);
      });
    });
  } else {
    router(req.method.toUpperCase(), path, req, res);
  }
};

http.createServer(requestHandler).listen(port);
