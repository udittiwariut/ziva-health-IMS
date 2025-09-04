const generateLowStockEmail = (products) => {
  const productRows = products
    .map(
      (p) =>
        `<tr>
          <td>${p.name}</td>
          <td>${p.sku}</td>
          <td>${p.stock_quantity}</td>
        </tr>`
    )
    .join('');

  return `
    <html>
      <body>
        <p>The following products are running low in stock:</p>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Available Stock</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p>Please restock these items as soon as possible.</p>
        <p>Regards,<br/>Inventory Team</p>
      </body>
    </html>
  `;
};

module.exports = { generateLowStockEmail };
