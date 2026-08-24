const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

const replacement = `
    const totals = { fttb: {}, bde: {}, fttbTotal: 0, bdeTotal: 0 };
    
    // Add logic to calculate totals based on actual priceApplied
    fttbOrders.forEach(o => {
      o.services.forEach(s => {
        if (!totals.fttb[s.serviceItem.name]) totals.fttb[s.serviceItem.name] = { qty: 0, revenue: 0 };
        totals.fttb[s.serviceItem.name].qty += s.quantity;
        totals.fttb[s.serviceItem.name].revenue += s.priceApplied;
        totals.fttbTotal += s.priceApplied;
      });
    });

    bdeOrders.forEach(o => {
      o.services.forEach(s => {
        if (!totals.bde[s.serviceItem.name]) totals.bde[s.serviceItem.name] = { qty: 0, revenue: 0 };
        totals.bde[s.serviceItem.name].qty += s.quantity;
        totals.bde[s.serviceItem.name].revenue += s.priceApplied;
        totals.bdeTotal += s.priceApplied;
      });
    });

    const format = request.nextUrl.searchParams.get('format');
    if (format === 'json') {
      return NextResponse.json({ fttb: fttbRows, bde: bdeRows, groupedFttb: groupedFttbRows, groupedBde: groupedBdeRows, totals });
    }
`;

code = code.replace(
  "const format = request.nextUrl.searchParams.get('format');\n    if (format === 'json') {\n      return NextResponse.json({ fttb: fttbRows, bde: bdeRows, groupedFttb: groupedFttbRows, groupedBde: groupedBdeRows });\n    }",
  replacement
);
fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
