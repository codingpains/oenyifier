var util = require('util');

function BadRequestError(message) {
  Error.captureStackTrace(this, BadRequestError);
  this.name = 'BadRequestError';
  this.message = message;
}

util.inherits(BadRequestError, Error);

exports.BadRequestError = BadRequestError;
