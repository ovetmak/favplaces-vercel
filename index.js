if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose');
const app = express()
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const path = require('path')
const bodyParser = require('body-parser')
// const TestModel = require('./models/data')
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const usersRoutes = require('./routes/users');
const placesRoutes = require('./routes/places');
const reviewsRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

// ********** Mongoose connection **********
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/placesSpain';
// process.env.DB_URL || 

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
    // await mongoose.connect(dbUrl);
    console.log('Mongoose Listening (INDEX) on port: 3000');
}

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //to serve our public files

app.use(mongoSanitize({
    replaceWith: '_'
}));

// const store = new MongoStore({
//     url: dbUrl,
//     secret: 'code',
//     touchAfter: 24*60*60,
// })

// store.on('error', function(e) {
//     console.log('Session store error', e)
// })

const secret = process.env.SECRET || 'code';

const sessionConfig = {
    secret,
    store: MongoStore.create({
        mongoUrl:dbUrl,
        secret,
        touchAfter: 24*60*60,
    }),
    name: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/drnktbk7b/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/drnktbk7b/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/drnktbk7b/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/drnktbk7b/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drnktbk7b/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/drnktbk7b/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

// app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// !!!session app.use(session(sessionConfig)); should be put before!!!

app.use((req,res,next) => {
    // ********* Fixed bug when you went to new places and then back after login it sended you not on a places but on a new place...
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    // ********* 
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', usersRoutes);
app.use('/places', placesRoutes);
app.use('/places/:id/reviews', reviewsRoutes); //if we need access to :id we have to use ...{mergeParams: true }) argument in express.Router({mergeParams: true });

// ********** HOME Page **********
app.get('/', (req,res) => {
    res.render('home');
})

// ********** ERROR handler **********
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong. Sorry!'
    res.status(statusCode).render('error', { err });
})

// ********** Listening **********
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Favourite Places app listening on port ${port}`)
})

module.exports = app;