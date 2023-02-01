const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Fav Places in Spain!');
            res.redirect('/places');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}

module.exports.loginRender = (req,res) => {
    res.render('users/login');
}

module.exports.login = (req,res) => {
    req.flash('success', 'Nice to see you');
    const redirectUrl = req.session.returnTo || '/places';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Hope to see you soon!');
      res.redirect('/places');
    });
}

  // req.logout() is now an asynchronous function
// router.get('/logout', (req,res, next) => {
//     req.logout() 
//     req.flash('success', 'Hope to see you soon!');
//     res.redirect('/places');
// })