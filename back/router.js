var resizeImage = require('./core/resize-image');
var routes = {};
var requestHandler;
var notFound;
var multipart;

routes['POST /upload'] = resizeImage;

notFound = function(req, res) {
  var ret = {code: 404, message: 'path not found'};
  res.writeHead(404, { Connection: 'close' });
  res.end(JSON.stringify(ret));
};

respondToPath = function(method, path, req, res) {
  var action = routes[method + ' ' + path];

  if (!action) return notFound(req, res);
  action(req, res);
};

module.exports = respondToPath;
