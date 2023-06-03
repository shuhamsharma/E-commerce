const fs = require('fs');
module.exports = {
    readfile: function (callback) {
        fs.readFile("./data.json", 'utf-8', function (err, data) {
            let parsedata = [];
            if (data) {
                parsedata = JSON.parse(data);
            }
            callback(parsedata);
        })
    },
    writeFile: module.exports = function (data, callback) {
        fs.writeFile("./data.json", JSON.stringify(data), function (err, data) {
            callback();
        })
    },
    read_products:function(callback){
        fs.readFile("./products.json","utf-8",function(err,data){
            let parsedata=[];
            if(data)
            parsedata=JSON.parse(data);
            callback(parsedata);
        })
    },
    write_products:function(data,callback){
        fs.writeFile("./products.json",JSON.stringify(data),function(err,data){
            callback();
        })
    },
    read_admin:function(callback){
        fs.readFile("./admin_data.json","utf-8",function(err,data){
            let parsedata=[];
            if(data)
            parsedata=JSON.parse(data);
            callback(parsedata);
        })
    }
}


