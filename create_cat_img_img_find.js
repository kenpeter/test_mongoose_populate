// http://mongoosejs.com/docs/populate.html
// http://theholmesoffice.com/mongoose-connection-best-practice/
// http://mongoosejs.com/docs/api.html#document_Document-populate
// http://eddywashere.com/blog/switching-out-callbacks-with-promises-in-mongoose/
// https://gist.github.com/JedWatson/8519978


var async = require('async');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Promise = require('bluebird');
var Schema = mongoose.Schema;

//
var ImageSchema = new Schema({
  fileName : String,
  filePath : String,
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

//
var CategorySchema = new Schema({
  name: String,
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

//
var Image  = mongoose.model('Image', ImageSchema);

//
var Category = mongoose.model('Category', CategorySchema);



// mongo config
var config = require('./config').mongo;
// mongo url
var dbUrl = config.url();
// mongo option
var dbOption = config.mongoOptions;

// mongoose connect
mongoose.connect(dbUrl, dbOption);


// The idea for mongoose is that, it has many on methods.
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbUrl);

  var cat = {};
  var catData;
  var imgData;

  // http://eddywashere.com/blog/switching-out-callbacks-with-promises-in-mongoose/
  Image.remove({}).exec()
    .then(() => {
      return Category.remove({}).exec();
    })
    .then(() => {
      console.log('---- all remove ----');
      // category
      catData = {
        name: 'test_category'
      };
      cat = new Category(catData);

      return cat.save();
    })
    .then(() => {
      // img
      imgData = {
        fileName: 'test_img.jpg',
        filePath : '/tmp/test_img.jpg',
        category: cat
      };
      img = new Image(imgData);

      return img.save();
    })
    .then(() => {
      // img 1
      imgData = {
        fileName: 'test_img_1.jpg',
        filePath : '/tmp/test_img_1.jpg',
        category: cat
      };
      img = new Image(imgData);

      return img.save();
    })
    .then(() => {
      // Now pull images
      return Image
        .find({})
        .populate('category')
        .exec();
    })
    .then((res) => {
      // can get result from previous
      console.log("--- now pull all images ---");
      console.log(res);
      return Promise.resolve();
    })
    .then(() => {

      /*
      return Category.find().populate('images').exec((err, categories) => {
        return Promise.each(categories, (category) => {
          return new Promise((resolve, reject) => {
            Image.find().where('category').equals(category._id).exec((err, images) => {
              console.log('~~~~~~~~~');
              console.log(images);
              console.log('~~~~~~~~~');
              category.images = images;

              resolve();
            });
          });

        });
      });
      */

      // cat aggregate, basically compute it
      return Category.aggregate([
        // $match, means search
        // search param
        { "$match": { "name": "test_category" } },
        {
          // $lookup means search
          "$lookup": {
            // images is the local collection
            // why called images, because that is what is inside the mongo
            "from": "images",
            // images has its own _id
            "localField": "_id",
            // foreign field, which is category
            "foreignField": "category",
            // as images
            "as": "images"
          }
        }
      ]).exec();

    })
    .then((res) => {
      //
      console.log("--- known the category and pull all images 1---");
      myConsole(res);
      return Promise.resolve();
    })
    .then(() => {
      //
      console.log("--- all done ---");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
    });

});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});


// Define your function
function myConsole(myObject) {
  console.log(JSON.stringify(myObject, null, 4));
}
