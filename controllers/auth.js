const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
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
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
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
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    // console.log(errors.array()[0].msg);
    return res.status(422)
    .render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({email: email})
    .then(user => {
      if(!user) {
        return res.status(422)
        .render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid Credentials',
          oldInput: { 
            email: email,
            password: password,
          },
          validationErrors: [],
        });
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
        return res.status(422)
        .render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid Credentials',
          oldInput: { 
            email: email,
            password: password,
          },
          validationErrors: [],
        });
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
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    // console.log(errors.array()[0].msg);
    return res.status(422)
      .render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt.hash(password, 12)
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
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(result => {
    // console.log(result);
    res.redirect('/');
  });
};

exports.getReset = (req, res,next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
}