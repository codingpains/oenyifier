var http = require('http');
var url = require('url');
var Busboy = require('busboy');
var router = require('./router');
var port = 3000;

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

  if (req.method === 'POST' && req.headers['content-type']) {
    multipart(req, function() {
      router(req.method.toUpperCase(), path, req, res);
    });
  } else {
    router(req.method.toUpperCase(), path, req, res);
  }
};

http.createServer(requestHandler).listen(port);
