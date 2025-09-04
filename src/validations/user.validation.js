const Joi = require('joi');
const { objectId } = require('./custom.validation');

const userIdParams = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  userIdParams,
};
