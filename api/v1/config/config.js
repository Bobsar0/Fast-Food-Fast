const config = {
  local: {
    mode: 'local',
    host: 'localhost',
    port: 8080,
  },
  production: {
    mode: 'production',
    host: 'HEROKU',
    port: 8000,
  },
};
// export default mode => config[mode || process.argv[2] || 'local'] || config.local;
export default config;
