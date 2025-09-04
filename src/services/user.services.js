const httpStatus = require('http-status');
const { Users, OrderItems, Orders } = require('../models');
const ApiError = require('../utils/ApiError');
const convertToObjectId = require('../utils/convertToObjectId');

const getUserOrders = async (userId) => {
  const isValidUserId = await Users.isValidUserId(userId);

  if (!isValidUserId) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid User Id`);
  }
  const orderIds = (await Orders.find({ user_id: convertToObjectId(userId), isDeleted: false }, { _id: 1 }).lean()).map(
    (val) => val._id
  );

  const pipeline = [
    {
      $match: { order_id: { $in: orderIds }, isDeleted: false },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$order_id',
        items: {
          $push: {
            _id: '$_id',
            product_id: '$product_id',
            quantity: '$quantity',
            price_at_time: '$price_at_time',
            name: '$product.name',
            sku: '$product.sku',
          },
        },
      },
    },
  ];

  const orders = await OrderItems.aggregate(pipeline);

  return orders;
};

const getCartCount = async (userId) => {
  const isValidUserId = await Users.isValidUserId(userId);

  if (!isValidUserId) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid User Id`);
  }

  const result = await Users.aggregate([
    { $match: { _id: convertToObjectId(userId) } },
    {
      $project: {
        itemCount: { $size: '$cart' },
      },
    },
  ]);

  const count = result[0];

  const formatedRes = {
    count: 0,
  };
  if (count) {
    formatedRes.count = count.itemCount;
  }

  return formatedRes;
};

module.exports = {
  getUserOrders,
  getCartCount,
};
