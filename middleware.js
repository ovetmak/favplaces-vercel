const ExpressError = require('./utils/ExpressError');
const { favPlacesSchema, reviewSchema } = require('./schemas');
const { Place } = require('./models/place');
const Review = require('./models/review');
// const { Place, categories } = require('./model/place');
// const { Review } = require('./model/place');

module.exports.isLoggetIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Only for signed users!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validatePlace = (req, res, next) => {
    const { error } = favPlacesSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place.author.equals(req.user._id)) {
        req.flash('error', 'You can only edit places created by yourself!');
        return res.redirect(`/places/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You can only delete reviews created by yourself!');
        return res.redirect(`/places/${id}`)
    }
    next();
}