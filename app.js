const express = require('express');
const app = express();
const path = require('path');
const routeHome = require('./api/routes/home');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routeUser = require('./api/routes/user');
const mongoose = require("mongoose");
const routeProduct = require('./api/routes/product');
const routeOrder = require('./api/routes/order');
const cookieParser = require('cookie-parser');
require ('custom-env').env('staging')
//mongoose.connect("mongodb://localhost/myUser", { useNewUrlParser: true, useCreateIndex: true, });
const mlab = process.env.MLAB;

mongoose.connect(mlab, { useNewUrlParser: true, useCreateIndex: true});

var db = mongoose.connection;

db.on('error', (error) => {
  console.log(error);
});
db.once('open', function() {
  console.log('Connected to database successfully');
});

app.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authoriztion");
  if (req.method === "OPTIONS")
	{
		res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
		return res.status(200).json();
	}
	next();
});

app.set("views","./api/views");
app.set("view engine", 'ejs');
app.use(express.static(path.join(__dirname, './public/')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/uploads', express.static('./public/images/uploads'));
app.use(morgan('dev'));
app.use(cookieParser());


app.use('/', routeHome);
app.use('/user', routeUser);
app.use('/product', routeProduct);
app.use('/order', routeOrder);

app.use((req,res,next) => {
	const error = new Error("Not found");
	error.status = 404;
	next(error);
});

app.use((error,req,res,next) => {
	res.status(error.status || 500);
	res.json({
		error : {
			message : error.message
		}
	})
});

module.exports = app;




