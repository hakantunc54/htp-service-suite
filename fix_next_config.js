const fs = require('fs');

const config = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '50mb',
  }
};

export default nextConfig;
`;

fs.writeFileSync('next.config.ts', config, 'utf8');
console.log("next.config.ts updated.");
