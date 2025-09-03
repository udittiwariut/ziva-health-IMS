const mongoose = require('mongoose');

const modal = require('./index');

async function seedData() {
  // const categories = await modal.Categories.insertMany([
  //   { name: 'Vitamins', description: 'Daily essential vitamins' },
  //   { name: 'Minerals', description: 'Key minerals for overall health' },
  //   { name: 'Supplements', description: 'Health & fitness supplements' },
  //   { name: 'Proteins', description: 'Protein powders & shakes' },
  //   { name: 'Herbal Products', description: 'Natural herbal remedies' },
  //   { name: 'Immunity Boosters', description: 'Support for strong immune system' },
  //   { name: 'Sports Nutrition', description: 'Performance & endurance supplements' },
  // ]);

  // Products
  // const products = await modal.Products.insertMany([
  //   // Vitamins
  //   {
  //     name: 'Vitamin C 1000mg',
  //     sku: 'VITC-1000',
  //     price: 15.99,
  //     stock_quantity: 120,
  //     category_id: categories[0]._id,
  //   },
  //   {
  //     name: 'Vitamin D3 5000 IU',
  //     sku: 'VITD3-5000',
  //     price: 12.49,
  //     stock_quantity: 80,
  //     category_id: categories[0]._id,
  //   },
  //   {
  //     name: 'Vitamin B-Complex',
  //     sku: 'VITB-COMPLEX',
  //     price: 18.99,
  //     stock_quantity: 60,
  //     category_id: categories[0]._id,
  //   },

  //   // Minerals
  //   {
  //     name: 'Magnesium Citrate 400mg',
  //     sku: 'MIN-MAG400',
  //     price: 14.99,
  //     stock_quantity: 70,
  //     category_id: categories[1]._id,
  //   },
  //   {
  //     name: 'Zinc Gluconate 50mg',
  //     sku: 'MIN-ZINC50',
  //     price: 9.99,
  //     stock_quantity: 90,
  //     category_id: categories[1]._id,
  //   },

  //   // Supplements
  //   {
  //     name: 'Omega-3 Fish Oil',
  //     sku: 'SUP-OMEGA3',
  //     price: 19.99,
  //     stock_quantity: 50,
  //     category_id: categories[2]._id,
  //   },
  //   {
  //     name: 'Probiotic 10 Strains',
  //     sku: 'SUP-PROBIO10',
  //     price: 22.99,
  //     stock_quantity: 40,
  //     category_id: categories[2]._id,
  //   },

  //   // Proteins
  //   {
  //     name: 'Whey Protein (Chocolate, 2lb)',
  //     sku: 'PROT-WHEY-CHOCO',
  //     price: 29.99,
  //     stock_quantity: 40,
  //     category_id: categories[3]._id,
  //   },
  //   {
  //     name: 'Plant Protein (Vanilla, 1.5lb)',
  //     sku: 'PROT-PLANT-VAN',
  //     price: 27.49,
  //     stock_quantity: 35,
  //     category_id: categories[3]._id,
  //   },

  //   // Herbal Products
  //   {
  //     name: 'Ashwagandha 600mg',
  //     sku: 'HERB-ASHWA600',
  //     price: 16.99,
  //     stock_quantity: 55,
  //     category_id: categories[4]._id,
  //   },
  //   {
  //     name: 'Turmeric Curcumin 1000mg',
  //     sku: 'HERB-TURM1000',
  //     price: 21.99,
  //     stock_quantity: 45,
  //     category_id: categories[4]._id,
  //   },

  //   // Immunity Boosters
  //   {
  //     name: 'Elderberry Gummies',
  //     sku: 'IMM-ELDERGUM',
  //     price: 13.99,
  //     stock_quantity: 75,
  //     category_id: categories[5]._id,
  //   },
  //   {
  //     name: 'Immune Support Pack (C + D + Zinc)',
  //     sku: 'IMM-PACK-CDZ',
  //     price: 25.99,
  //     stock_quantity: 30,
  //     category_id: categories[5]._id,
  //   },

  //   // Sports Nutrition
  //   {
  //     name: 'Creatine Monohydrate 300g',
  //     sku: 'SPORT-CREA300',
  //     price: 24.99,
  //     stock_quantity: 65,
  //     category_id: categories[6]._id,
  //   },
  //   {
  //     name: 'BCAA Powder (Fruit Punch, 200g)',
  //     sku: 'SPORT-BCAA-FP',
  //     price: 26.99,
  //     stock_quantity: 50,
  //     category_id: categories[6]._id,
  //   },
  // ]);

  // // Example Order
  // const order = await modal.Orders.create({
  //   user_id: new mongoose.Types.ObjectId(), // dummy user
  //   total: 45.98,
  //   status: 'paid',
  // });

  // // Example Order Items
  // await modal.OrderItems.insertMany([
  //   {
  //     order_id: order._id,
  //     product_id: products[0]._id,
  //     quantity: 2,
  //     price_at_time: 15.99,
  //   },
  //   {
  //     order_id: order._id,
  //     product_id: products[2]._id,
  //     quantity: 1,
  //     price_at_time: 19.99,
  //   },
  // ]);

  const users = [
    { name: 'Jon Snow' },
    {
      name: 'Tyrion Lannister',
    },
    {
      name: 'Sansa Stark',
    },
    {
      name: 'Jaime Lannister',
    },
  ];

  await modal.Users.insertMany(users);

  console.log('✅ Seed data inserted');
  mongoose.disconnect();
}

module.exports = {
  seedData,
};
