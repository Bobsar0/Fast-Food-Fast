// Handles the data in our application. Base is the parent class where other models will extend from

class BaseModel {
  constructor(username, userAddr, userRank) {
    this.username = username;
    this.userAddr = userAddr;
    this.userRank = userRank;
  }

  // Setter for store object
  set store(store) {
    this.store = store;
  }

  // Getter for store collection
  get collection() {
    if (this.collection) return this.collection;
    this.collection = this.store.collection();
    return this.collection;
  }
}

export default BaseModel;
