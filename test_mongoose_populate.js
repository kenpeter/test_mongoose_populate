// http://mongoosejs.com/docs/populate.html
// http://theholmesoffice.com/mongoose-connection-best-practice/
// http://mongoosejs.com/docs/api.html#document_Document-populate

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
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
  images: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
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
  // http://eddywashere.com/blog/switching-out-callbacks-with-promises-in-mongoose/
  Image.remove({}).exec()
    .then(() => {
      return Category.remove({}).exec();
    })
    .then(() => {
      console.log('---- all remove ----');
      // category
      var catData = {
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
      // Now pull
      return Image
        .findOne({})
        .populate('category')
        .exec();
    })
    .then(() => {
      console.log("--- all done ---");
      process.exit(0);
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
