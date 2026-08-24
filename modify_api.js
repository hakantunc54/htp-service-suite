const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');
code = code.replace(
  "const wb = xlsx.utils.book_new();",
  "const format = request.nextUrl.searchParams.get('format');\n    if (format === 'json') {\n      return NextResponse.json({ fttb: fttbRows, bde: bdeRows, groupedFttb: groupedFttbRows, groupedBde: groupedBdeRows });\n    }\n\n    const wb = xlsx.utils.book_new();"
);
fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
