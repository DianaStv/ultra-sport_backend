const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const passportMiddleware = require('./middleware/passport');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');
const keys = require('./config/keys');
const app = express();

app.use(passport.initialize());
require('./middleware/passport')(passport)

mongoose.connect(keys.mongoURI)
  .then(() => console.log('MongoDb connected'))
  .catch(error => console.log(error))

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/order', orderRoutes);

module.exports = app;