const express = require('express');
const router = express.Router({mergeParams: true });
const reviews = require('../controllers/reviews');
const { validateReview, isLoggetIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// ********** REVIEWs Write **********
router.post('/', isLoggetIn, validateReview, catchAsync(reviews.newPost)) 

// ********** REVIEWs Delete **********
router.delete('/:reviewId', isLoggetIn, isReviewAuthor, catchAsync(reviews.delete))

module.exports = router;