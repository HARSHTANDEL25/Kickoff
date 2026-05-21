import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
        remotePatterns: [
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'e1.365dm.com' },
      { protocol: 'https', hostname: 'e0.365dm.com' },
      { protocol: 'https', hostname: 'e2.365dm.com' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
      { protocol: 'https', hostname: 'i2.wp.com' },
      { protocol: 'https', hostname: 'a.espncdn.com' },
      { protocol: 'https', hostname: 'icdn.football-italia.net' },
      { protocol: 'https', hostname: 'icdn.caughtoffside.com' },

    ],
  }
  
};

export default nextConfig;
