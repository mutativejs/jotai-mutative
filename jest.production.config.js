// The Jest config of package.json, with mutative mapped to its production
// CommonJS build. React keeps its development build, which act() needs.
const { jest: config } = require('./package.json');

module.exports = {
  ...config,
  moduleNameMapper: {
    '^mutative$': 'mutative/dist/mutative.cjs.production.min.js',
  },
};
