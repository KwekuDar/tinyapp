// how we generate random strings length = 6
function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
  };
  
  //check to see if email exist
  function emailExists(email, users) {
    for (let id in users) {
      if (users[id]["email"] === email) {
        return true;
      } 
    }
    return false
  };
  
  //check to see if password exist
  function findPassword(email, users) {
    for (let id in users) {
      if (email === users[id]["email"]) {
        return users[id]["password"];
      }
    }
    return undefined;
  };
  
  // find the id by email
  function findUserID(email, users) {
    for (let id in users) {
      if (email === users[id]["email"]) {
        return users[id]["id"];
      }
    }
    return undefined;
  };
  
  // returns URL matched with ID
  function urlsForUser (id, database) {
    const userURLs = {};
    for (let url in database) {
      if (id === database[url]["userID"]) {
        userURLs[url] = database[url];
      }
    }
    return userURLs;
  };
  
  
  
  // added it for mocha testing to match compass
  function getUserByEmail (email, database) {
    // loop in database keys
    for (let key in database) {
      // compare the emails, if they match return the user obj
      if (database[key]["email"] === email) {
        return database[key];
      }
    }
    return undefined;
  };
  
  
  
  
  module.exports = { generateRandomString, emailExists, findPassword, findUserID, urlsForUser, getUserByEmail };