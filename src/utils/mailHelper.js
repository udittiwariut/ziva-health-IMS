const nodeMailer = require('nodemailer');
const { generateLowStockEmail } = require('./mailTemplate');

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});
const sendLowStockEmail = async (recipientEmail, products) => {
  if (!products.length) return;

  const mailOptions = {
    from: `"Inventory Alerts" <${process.env.EMAIL_FROM}>`,
    to: recipientEmail,
    subject: '⚠️ Low Stock Alert',
    html: generateLowStockEmail(products),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Low stock alert sent successfully!');
  } catch (err) {
    console.error('Error sending low stock alert:', err);
  }
};

module.exports = {
  sendLowStockEmail,
};
