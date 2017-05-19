const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

require('dotenv').config();

const models = require('./models/index');
const Routes = require('./api/index');
const passportConfig = require('./services/auth');
const MONGO_URI = process.env.MONGO_URI;
const MongoStore = require('connect-mongo')(session);

mongoose.Promise = global.Promise;

mongoose.connect(MONGO_URI);
mongoose.connection
    .once('open', () => console.log('Connected to MongoDB'))
    .on('error', error => console.log('Error connecting to MongoDB:', error));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	store: new MongoStore({
		url: MONGO_URI,
		autoReconnect: true,
	}),
}));

//Disable webpack build if debugging backend functionality

if(process.env.NODE_ENV !== 'backend-dev'){
	const webpackMiddleware = require('../webpack.dev.middleware');
	app.use(webpackMiddleware);
}
else{
	app.get('/', (req,res) => res.send(req.session.passport))
}


app.use(passport.initialize());
app.use(passport.session());

//define all routes here
app.use('/auth', Routes.auth);
app.use('/league', Routes.league);
app.use('/team', Routes.team);
app.use('/player', Routes.player);

app.get('*', (req, res) => res.redirect('/'));
//Temporary fix for syncing up with react-routers urls
//avoids causing a server-side error when refreshing browser on the /login page

module.exports = app;
