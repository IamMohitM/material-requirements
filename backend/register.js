// Path alias resolution for CommonJS modules
const path = require('path');
const Module = require('module');

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function(request, parent, isMain) {
  // Map TypeScript path aliases to actual paths
  const aliases = {
    '@config': path.join(__dirname, 'dist/config'),
    '@middleware': path.join(__dirname, 'dist/middleware'),
    '@entities': path.join(__dirname, 'dist/entities'),
    '@services': path.join(__dirname, 'dist/services'),
    '@routes': path.join(__dirname, 'dist/routes'),
    '@utils': path.join(__dirname, 'dist/utils'),
    '@types': path.join(__dirname, 'dist/types'),
    '@': path.join(__dirname, 'dist'),
  };

  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (request.startsWith(alias + '/')) {
      const relativePath = request.slice(alias.length + 1);
      request = path.join(aliasPath, relativePath);
      break;
    }
  }

  return originalResolveFilename.call(this, request, parent, isMain);
};
