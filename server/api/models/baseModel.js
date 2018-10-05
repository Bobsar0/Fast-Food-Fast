// Handles the data in our application. Base is the parent class where other models will extend from

class BaseModel {
  constructor(username, userAddr, userrole) {
    this.username = username;
    this.userAddr = userAddr;
    this.userrole = userrole;
  }
}

export default BaseModel;
