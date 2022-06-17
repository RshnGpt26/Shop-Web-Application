// Packages
  const path = require('path');
  const express = require('express');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');
  const session = require('express-session');
  const MongoDBStore = require('connect-mongodb-session')(session);
  const csrf = require('csurf');
  const flash = require('connect-flash');
  const multer = require('multer');

  const errorController = require('./controllers/error');
  const User = require('./models/user');

// MongoDB Connectivity URL
  const MONGODB_URI = 'mongodb://Roshan:Roshan256@cluster0-shard-00-00.fscf3.mongodb.net:27017,cluster0-shard-00-01.fscf3.mongodb.net:27017,cluster0-shard-00-02.fscf3.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-tplxrq-shard-0&authSource=admin&retryWrites=true&w=majority';

// Creating app using express
  const app = express();

// for storing session on server
  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
  })

// create csrf protection
  const csrfProtection = csrf();

// using multer to store image file on disk
  const fileStorge = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  });

// Filter the image file
  const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }

// Setting view engine
  app.set('view engine', 'ejs');
  app.set('views', 'views');

// Routes
  const adminRoutes = require('./routes/admin');
  const shopRoutes = require('./routes/shop');
  const authRoutes = require('./routes/auth');

// Middleware
  // To send form data(string, int, ...) from ejs to server
    app.use(bodyParser.urlencoded({ extended: false }));

  // To send form data(files) from ejs to server
    app.use(multer({ storage: fileStorge, fileFilter: fileFilter }).single('image'));

  // For static files
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/images', express.static(path.join(__dirname, 'images')));

  // for storing session on server
    app.use(session({ secret: 'My Secret', resave: false, saveUninitialized: false, store: store, }));

  // To protect website from csrf attack using session and csrf token
    app.use(csrfProtection);

    // 
    app.use(flash());

    // 
    app.use((req, res, next) => {
      res.locals.isAuthenticated = req.session.isLoggedIn;
      res.locals.csrfToken = req.csrfToken();
      next();
    });

  // Checks user is authenticate or not by using session for all pages 
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
    });

  // Routes
    app.use('/admin', adminRoutes);
    app.use(shopRoutes);
    app.use(authRoutes);
    app.use('/500', errorController.get500);
    app.use(errorController.get404);
    app.use((error, req, res, next) => {
      // res.status(error.httpStatusCode).render(...);
      // res.redirect('/500');
      // console.log(req);
      res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
      });
    });

// MongoDB Connectivity Method
  mongoose
  .connect(MONGODB_URI, 
    { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
  ) 
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
