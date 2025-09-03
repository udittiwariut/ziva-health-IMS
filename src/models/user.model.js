const mongoose = require('mongoose');
const { toJSON } = require('./plugins/index');
const convertToObjectId = require('../utils/convertToObjectId');

const usersSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cart: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItem',
      },
    ],
    default: [],
  },
});

usersSchema.plugin(toJSON);

usersSchema.statics.isValidUserId = async function (userId) {
  const user = this.findOne({ _id: convertToObjectId(userId) });
  return !!user;
};

const UsersSchema = mongoose.model('Users', usersSchema);

module.exports = UsersSchema;
