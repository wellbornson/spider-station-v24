const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, os: false, child_process: false,
        'node:fs': false, 'node:path': false, 'node:os': false,
        'node:child_process': false, 'node:stream': false,
        'node:process': false, 'node:buffer': false, 'node:crypto': false,
        'node:url': false, 'node:util': false, 'node:net': false,
        'node:http': false, 'node:https': false, 'node:zlib': false,
      };
    }
    return config;
  },
};
module.exports = nextConfig;
