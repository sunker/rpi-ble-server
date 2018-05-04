const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://localhost:27017/annika'

var mongo = {
  db: null,
  coordinates: null,

  connect: function () {

    MongoClient.connect(url, function (err, db) {
      console.log("Connected successfully to mongodb")
      mongo.db = db
      mongo.coordinates = db.collection('documents')
    })
  }
}

module.exports = mongo