/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */
module.exports = {
  cwd: 'build',
  files: ['src/index.html', 'src/js/main.js'],
  port: 3000,
  server: {
    baseDir: 'dist',
    routes: {
      '/node_modules': 'node_modules',
    },
  },
  ui: false,
  watch: true,
  watchEvents: ['change'],
};
