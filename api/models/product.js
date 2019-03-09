const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true,
    trim : true,
  },
  price : {
    type: Number,
    require: true,
  },
  kind : {
    type: String,
    require: true,
  },
  created : {
    type: Date,
    default: Date.now,
  },
  productImage : {
    type : String,
    required : true,
  }
});


module.exports = mongoose.model('Product', productSchema);
