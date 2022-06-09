const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb://Roshan:Roshan256@cluster0-shard-00-00.fscf3.mongodb.net:27017,cluster0-shard-00-01.fscf3.mongodb.net:27017,cluster0-shard-00-02.fscf3.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-tplxrq-shard-0&authSource=admin&retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
})

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));  
app.use(session({ secret: 'My Secret', resave: false, saveUninitialized: false, store: store, }));
app.use(csrfProtection)
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user) {
      return next();
    }
      req.user = user;
      next();
  })
  .catch(err => {
    next(new Error(err));
  });
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // app.status(error.httpStatusCode).render(...)
  res.redirect('/500');
})

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }) 
  .then(result => {
    // User.findOne().then(user => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'Roshan',
    //       email: 'Roshan@test.com',
    //       cart: {
    //         items: []
    //       }
    //     });
    //     user.save();
    //   }
    // });
    console.log('Connected Successfully!!');
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
