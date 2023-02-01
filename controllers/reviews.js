const Review = require('../models/review');
const { Place } = require('../models/place');

module.exports.newPost = async (req,res) => {
    // await Review.deleteMany({});
    const place = await Place.findById(req.params.id);
    const review = new Review(req.body);
    review.author = req.user._id;
    place.reviews.push(review);
    await review.save();
    await place.save();
    req.flash('success', 'New review added! Thank you!');
    res.redirect(`/places/${place._id}`); 
}

module.exports.delete = async (req,res) => {
    // console.log(req.params);
    const { id, reviewId } = req.params;
    await Place.findByIdAndUpdate(id, { $pull: { reviews: reviewId }})
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review deleted! Thank you!');
    res.redirect(`/places/${id}`)
}