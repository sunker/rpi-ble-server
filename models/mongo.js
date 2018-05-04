const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://localhost:27017/'

var mongo = {
  db: null,
  coordinates: null,

  connect: function () {

    MongoClient.connect(url, function (err, client) {
      console.log('err', err)
      console.log("Connected successfully to mongodb")
      const db = client.db('annika');
      mongo.db = db
      mongo.coordinates = db.collection('documents')
    })
  }
}

module.exports = mongo