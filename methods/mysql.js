var Connection = require("tedious").Connection;
var Request = require("tedious").Request;
var TYPES = require("tedious").TYPES;

// Create connection to database
var config = {
  server: 'localhost',
  authentication: {
    type: "default",
    options: {

      userName: "shubham", // update me
      password: "123456", // update me
    },
  },
  options: {
    trustServerCertificate: true,
    database: "shopcart",
  },

};

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

module.exports = {
  conn: function conn() {
    return new Promise(function (resolve, reject) {
      var connection = new Connection(config);
      connection.connect();
      connection.on("connect", function (err) {
        // If no error, then good to proceed.
        if (err)
          reject(err);
        else {
          resolve(connection);
        }
      });

    })
  },
  getdata: function GetData(connection, stat) {
    return new Promise(function (resolve, reject) {
      let request = new Request(stat, function (err) {
        if (err) {
          reject(err);
        }
      });

      //getting the data in array of object format
      let rr = [];
      request.on('row', function (columns) {
        var result = {};
        columns.forEach(function (column) {
          if (column.value === null) {
            result[column.metadata.colName]=null;
          } else {
            result[column.metadata.colName] = column.value;
          }
        });
        rr.push(result);
      });
      
      // Close the connection after the final event emitted by the request, after the callback passes
      request.on("requestCompleted", function (rowCount, more) {
        resolve(rr);
        connection.close();
      });
      connection.execSql(request);
    })
  },
  add_data: function AddData(connection, stat) {
    return new Promise(function (resolve, reject) {
      let request = new Request(stat, function (err) {
        if (err) {
          reject(err)
        }
      });

      // Close the connection after the final event emitted by the request, after the callback passes
      request.on("requestCompleted", function () {
        resolve();
        connection.close();
      });
      connection.execSql(request);
    })

  },
  begin_transaction: function (connection,stat)
  {
    return new Promise(function (resolve, reject) {
      
      let request = new Request(stat, function (err) {
        if (err) {
          console.log("eroor in stat");
          connection.rollbackTransaction((error) => {
            if (error) {
              connection.close();
              console.log('transaction rollback error: ');
              reject(err)
            }
          });
        }
      });

      connection.beginTransaction((err) => {
        if (err) {
          console.log("error in begin transaction");
        }
      else{
      connection.execSql(request);
      }
    });

     
        request.on("requestCompleted",function(){
          connection.commitTransaction((err) => {
            if (err) {
              connection.close();
              console.log('commit transaction err: ', err);
              reject(err);
            }
          else{
            resolve();}
           })
        })
    
    })
  }
}
