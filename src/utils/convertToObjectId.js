const mongoose = require('mongoose');

const convertToObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

module.exports = convertToObjectId;
