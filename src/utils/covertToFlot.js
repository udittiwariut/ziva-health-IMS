const covertToFlot = (num) => {
  if (Number.isNaN(num)) return null;
  return parseFloat(Number(num).toFixed(2));
};

module.exports = covertToFlot;
