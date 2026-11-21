const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(name, price, qty, hsn, gstRate) {
  return { name, price, qty, hsn, gstRate };
}

test('invoice matches checkout for HSN GST and a capped coupon discount', () => {
  const items = [
    item('Assam CTC Masala Chai 250g', 140, 2, '0902'),
    item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')
  ];
  const checkoutFigures = pricing.computeTotals(items, 'SAVE10');
  const invoiceFigures = invoice.computeInvoiceFigures({ coupon: 'SAVE10', items: items });

  assert.deepEqual(invoiceFigures, {
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total,
    rows: checkoutFigures.lines.map(line => ({
      name: line.name,
      sku: '-',
      hsn: line.hsn,
      qty: items.find(item => item.name === line.name).qty,
      price: items.find(item => item.name === line.name).price,
      gstPercent: line.gstPercent,
      line: line.gross,
      lineTax: line.tax
    }))
  });
});

const cases = [
  {
    name: 'CURRENT BEHAVIOUR: order #1001 mixed 5% and 12% with no coupon',
    id: 1001,
    coupon: '',
    items: [item('Assam CTC Masala Chai 250g', 140, 2, '0902', 18), item('Unpolished Toor Dal 1kg', 165, 2, '0713', 5)],
    invoiceExpected: { subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9, rates: [18, 5], lineTaxes: [50.4, 16.5] }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1002 SAVE10 on ₹1,020 subtotal',
    id: 1002,
    coupon: 'SAVE10',
    items: [item('Indrayani Basmati Rice 5kg', 640, 1, '1006', 5), item('Cold-Pressed Sunflower Oil 1L', 190, 2, '1512', 5)],
    invoiceExpected: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9, rates: [5, 5], lineTaxes: [28.8, 17.1] }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1004 SAVE10 capped at ₹150 on ₹2,240 subtotal',
    id: 1004,
    coupon: 'SAVE10',
    items: [item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508', 5)],
    invoiceExpected: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5, rates: [5], lineTaxes: [104.5] }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1008 all 18% with no coupon',
    id: 1008,
    coupon: '',
    items: [item('Assam CTC Masala Chai 250g', 140, 1, '0902', 18), item('Kokum Sherbet Concentrate 750ml', 180, 2, '2106', 18)],
    invoiceExpected: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590, rates: [18, 18], lineTaxes: [25.2, 64.8] }
  }
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const order = { id: scenario.id, coupon: scenario.coupon, items: scenario.items };
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutFigures = pricing.computeTotals(scenario.items, scenario.coupon);

    assert.equal(invoiceFigures.subtotal, scenario.invoiceExpected.subtotal);
    assert.equal(invoiceFigures.discount, scenario.invoiceExpected.discount);
    assert.equal(invoiceFigures.tax, scenario.invoiceExpected.tax);
    assert.equal(invoiceFigures.cgst, scenario.invoiceExpected.cgst);
    assert.equal(invoiceFigures.sgst, scenario.invoiceExpected.sgst);
    assert.equal(invoiceFigures.total, scenario.invoiceExpected.total);
    assert.deepEqual(invoiceFigures.rows.map(row => row.gstPercent), scenario.invoiceExpected.rates);
    assert.deepEqual(invoiceFigures.rows.map(row => row.lineTax), scenario.invoiceExpected.lineTaxes);

    assert.equal(checkoutFigures.subtotal, scenario.invoiceExpected.subtotal);
    assert.equal(checkoutFigures.discount, scenario.coupon === 'SAVE10'
      ? (scenario.id === 1004 ? 150 : 102)
      : 0);
  });
}
