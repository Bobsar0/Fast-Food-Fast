// Handles the data in our application. Base is the parent class where other models will extend from

class BaseModel {
  constructor(username, userAddr, userRank) {
    this.username = username;
    this.userAddr = userAddr;
    this.userRank = userRank;
  }
}

export default BaseModel;
