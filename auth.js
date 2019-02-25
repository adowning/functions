let readline = require("readline");
let googleAuth = require("google-auth-library");
let fs = require("fs");
//8704003255-sbca2t95nvspus3qm3ju18d0fs1vtnmr.apps.googleusercontent.com
//d7ApbvNAW93clmGnI7xXK462
// const { GoogleAuth } = require("google-auth-library");
let SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; //you can add more scopes according to your permission need. But in case you chang the scope, make sure you deleted the ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json file
const TOKEN_DIR = "/home/ash" + "/.credentials/"; //the directory where we're going to save the token
const TOKEN_PATH = TOKEN_DIR + "sheets.googleapis.com-nodejs-quickstart.json"; //the file which will contain the token
// const gal = require("google-auth-library");
// const auth = new gal.GoogleAuth();
// const oAuth2Client = new gal.OAuth2Client();
const { GoogleAuth, JWT, OAuth2Client } = require("google-auth-library");

// var jwtClient;
class Authentication {
  authenticate() {
    // console.log(this.getClientSecret());
    return new Promise((resolve, reject) => {
      let credentials = this.getClientSecret();
      let authorizePromise = this.authorize(credentials);
      authorizePromise.then(resolve, reject);
    });
  }
  getClientSecret() {
    return require("./credentials.json");
  }
  authorize(credentials) {
    var client_secret = credentials.web.client_secret;
    var client_id = credentials.web.client_id;
    var redirect_uri = credentials.web.redirect_uris[0];
    // var auth = new GoogleAuth();
    // var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    console.log(redirect_uri);
    jwtClient = new JWT(client_id, client_secret, redirect_uri);

    return new Promise((resolve, reject) => {
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          this.getNewToken(jwtClient).then(
            oauth2ClientNew => {
              resolve(jwtClientNew);
            },
            err => {
              reject(err);
            }
          );
        } else {
          jwtClient.credentials = JSON.parse(token);
          resolve(jwtClient);
        }
      });
    });
  }
  getNewToken(oauth2Client, callback) {
    return new Promise((resolve, reject) => {
      var authUrl = jwtClient.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
      });
      console.log("Authorize this app by visiting this url: \n ", authUrl);
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question("\n\nEnter the code from that page here: ", code => {
        rl.close();
        jwtClient.getToken(code, (err, token) => {
          if (err) {
            console.log("Error while trying to retrieve access token", err);
            reject();
          }
          jwtClient.credentials = token;
          this.storeToken(token);
          resolve(jwtClient);
        });
      });
    });
  }
  storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != "EEXIST") {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to " + TOKEN_PATH);
  }
}

module.exports = new Authentication();
