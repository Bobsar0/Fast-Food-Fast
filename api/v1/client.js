import config from './config/config';

// Defines client constructor
class Client {
  constructor(host, path) {
    this.host = host;
    this.path = path;
  }
}

const client = new Client({
  host: `${config.local.host}:${config.local.port}`,
  path: 'api/v1/',
});
// TEST data is empty for now. Just to test the API
const data = {};
client.search = () => new Promise((resolve, reject) => resolve(data).catch(reject));
client.save = () => new Promise((resolve, reject) => resolve(data).catch(reject));
client.get = () => new Promise((resolve, reject) => resolve(data).catch(reject));
client.update = () => new Promise((resolve, reject) => resolve(data).catch(reject));
client.delete = () => new Promise((resolve, reject) => resolve(data).catch(reject));

export default client;
