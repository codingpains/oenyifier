var oenyi = require('oenyi');
var BadRequestError = require('./errors').BadRequestError;

var resizeImage = function(params, fn) {
  var resizeArgs = params.resize;

  oenyi(params.image)
    .toJPG()
    .resize(resizeArgs)
    .exec(fn);
};

var imageResizingFailed = function(err, res) {
  var ret = {code: 500, message: 'resizing failed'};

  res.writeHead(500);
  res.end(JSON.stringify(ret));
};

var invalidRequest = function(errors, res) {
  var messages = errors.map(function(err) {
    return err.message;
  });
  var ret = {code: 422, errors: messages};
  res.writeHead(422);
  res.end(JSON.stringify(ret));
};

var validateRequest = function(data) {
  var errors = [];

  if (!data.image) {
    errors.push(new BadRequestError('no image was sent'));
  }

  if (!parseInt(data.width, 10)) {
    errors.push(new BadRequestError('invalid value for resize width'));
  }

  if (!parseInt(data.height, 10)) {
    errors.push(new BadRequestError('invalid value for resize height'));
  }

  if (['cover', 'fit', 'contain'].indexOf(data.method.toLowerCase()) === -1) {
    errors.push(new BadRequestError('invalid value for resize method'));
  }

  if (!errors.length) return false;

  return errors;
};

module.exports = function(req, res) {
  var data = req.body;
  var params = { image: null, resize: {width: null, height: null, method: null}};
  var errors = validateRequest(data);
  if (errors) return invalidRequest(errors, res);

  params.image = data.image;
  params.resize.width = data.width;
  params.resize.height = data.height;
  params.resize.method = data.method.toLowerCase();

  if (req.body.image) {
    resizeImage(params, function(err, imageBuffer) {
      if (err) return imageResizingFailed(err, res);
      res.writeHead(200, {'Connection': 'close', 'Content-Type': 'image/jpeg'});
      res.end(imageBuffer);
    });
  }
};
