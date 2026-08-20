const fs = require('fs');

const content = `export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"
  ]
};
`;

fs.writeFileSync('src/middleware.ts', content, 'utf8');
