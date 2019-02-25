const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const { google } = require("googleapis");
const jsonDiff = require("json-diff");
const FireStoreParser = require("firestore-parser");
const key = require("./newkey.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
var auth;

// exports.serviceItemCreate = functions.firestore
//   .document("test/{workorderId}/serviceItems/{serviceItemId}")
//   .onCreate((snap, context) => {
//     console.log(snap);
//     return Spreadsheet().updateSpreadsheet(snap);
//     //  return item;
//     //  return Spreadsheet().appendRow(item);
//   });
const WEBHOOK_URL =
  "https://script.google.com/d/11RcQ8a26oCqLSqmhm1qWQX0mWJUhHbk-h6aiMbfn2KaQsTiZmVtS5BDA/exec";

exports.serviceItem_updated = functions.firestore
  .document("test/{workorderId}/serviceItems/{serviceItemId}")
  .onUpdate((change, context) => {
    console.log(change);
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const diff = jsonDiff.diffString(previousValue, newValue);
    console.log(change);
    console.log(context);
  });

exports.serviceItem_created = functions.firestore
  .document("test/{workorderId}/serviceItems/{serviceItemId}")
  .onCreate(async (snap, context) => {

    console.log(snap.data());
    var arr = [];
    var arr2 = [];

    for (var property in snap.data()) {
      if (snap.data().hasOwnProperty(property)) {
        arr.push(property.toString());
      }
    }
    for (var key in snap.data()) {
      if(!snap.data()[key]){
        snap.data()[key] = 'n/a'
      }

      var value = snap.data()[key];
      

      if (!Array.isArray(value) && value !== Object(value)) {
        arr2.push(value);
      }else{
        value = ' '
        arr2.push(value)
      }
    }
    appendData(arr);
    appendData(arr2);

  });

function appendData(data) {
  auth = new google.auth.JWT(key.client_email, null, key.private_key, SCOPES);
  var sheets = google.sheets("v4");
  sheets.spreadsheets.values.append(
    {
      auth: auth,
      spreadsheetId: "17X8QN_n4SvWcPbSTpsOGN1jNEHQMdqKOxJtVf4706ZI",
      range: "Sheet1!A2:G", //Change Sheet1 if your worksheet's name is something else
      valueInputOption: "USER_ENTERED",
      resource: {
        // values: [["Void", "Canvas", "Website"], ["Paul", "Shan", "Human"]]
        values: [data]
      }
    },
    (err, response) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      } else {
        console.log("Appended");
      }
    }
  );
}

// authentication.authenticate().then(auth => {
//   appendData(auth);
function update(i, newRow) {
  auth = new google.auth.JWT(key.client_email, null, key.private_key, SCOPES);
  var sheets = google.sheets("v4");
  sheets.spreadsheets.values.append(
    {
      auth: auth,
      spreadsheetId: "17X8QN_n4SvWcPbSTpsOGN1jNEHQMdqKOxJtVf4706ZI",
      range: `Sheet1!A${i}:G${i}`, //Change Sheet1 if your worksheet's name is something else
      valueInputOption: "USER_ENTERED",
      resource: {
        // values: [["Void", "Canvas", "Website"], ["Paul", "Shan", "Human"]]
        values: newRow
      }
    },
    (err, response) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      } else {
        console.log("Appended");
      }
    }
  );
}
function getDataAndUpdate(id, newRow) {
  auth = new google.auth.JWT(key.client_email, null, key.private_key, SCOPES);

  var sheets = google.sheets("v4");
  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: "17X8QN_n4SvWcPbSTpsOGN1jNEHQMdqKOxJtVf4706ZI",
      range: "Sheet1!A2:C" //Change Sheet1 if your worksheet's name is something else
    },
    (err, response) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      var rows = response.data.values;
      if (rows.length === 0) {
        console.log("No data found.");
      } else {
        console.log(rows.length);
        for (var i = 0; rows.length; i++) {
          // console.log(rows[i]);
          var row = rows[i];
          var thisId = row[0];
          if (id === thisId) {
            update(i, newRow);
          }
          console.log(row.join(", "));
        }
      }
    }
  );
}
// getDataAndUpdate("123", [
//   ["Void", "Canvas", "Website"],
//   ["Paul", "Shan", "Human"]
// ]);
// authentication.authenticate().then(auth => {
//   getData(auth);
// });
