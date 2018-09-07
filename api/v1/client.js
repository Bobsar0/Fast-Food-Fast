import config from './config/config';

// Defines client constructor
class Client {
  constructor(host, path) {
    this.host = host;
    this.path = path;
  }

  search(username, attr) {
    this.username = username;
    this.attr = attr;
    return this;
  }
}

const client = new Client({
  host: `${config.local.host}:${config.local.port}`,
  path: 'api/v1/',
});
const data = {};
client.search = () => new Promise((resolve, reject) => resolve(data).catch(reject));

export default client;
