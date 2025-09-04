const { getUserOrders } = require('../services/user.services');
const catchAsync = require('../utils/catchAsync');

const getOrders = catchAsync(async (req, res) => {
  const { userId } = req.params;

  console.log(userId);

  const orders = await getUserOrders(userId);

  res.send(orders);
});

module.exports = {
  getOrders,
};
