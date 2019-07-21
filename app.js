const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient
let db;

MongoClient.connect('mongodb://localhost:27017/myNewDatabase', function (err, client) {
  if (err) throw err

  db = client.db('myNewDatabase')
  console.log('Connected to DB');
})


app.get('/', function (req, res) {
  db.collection('myCollection').find().toArray(function (err, result) {
    if (err) throw err

    res.send(result)
  })

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});