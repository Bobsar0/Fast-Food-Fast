export default class BaseController {
  constructor(client, username, attr) {
    this.client = client;
    this.username = username;
    this.attr = attr;
  }
}
