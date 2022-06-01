const User = require('../models/user');
const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const sendGridTransport = require('nodemailer-sendgrid-transport');

// const transporter = nodemailer.createTransport(sendGridTransport({
//   auth: {
//     api_key: ''
//   }
// }));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email})
    .then(user => {
      if(!user) {
        req.flash('error', 'Invalid Credentials')
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if(doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(result => {
            // console.log(result);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid Credentials')
        res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
  .then(userDoc => {
    if(userDoc) {
      req.flash('error', 'Email Exist Already')
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12)
    .then(hashPassword =>{
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items: [] }
      });
      res.redirect('/login');
      return user.save();
    })
    // .then(result => {
    //   res.redirect('/login');
    //  return  transporter.sendMail({
    //     to: email,
    //     from: 'shop@node-complete.com',
    //     subject: 'Signup Succeeded!',
    //     html: '<h1>You successfully signed up!</h1>'
    //   })
      
    // })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
    // res.redirect('/');
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(result => {
    // console.log(result);
    res.redirect('/');
  });
};
