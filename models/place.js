const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const categories = ["city", "restaurant", "sight", "mountain path", "mirador"];
exports.categories = categories;

const ImageSchema = new Schema({
    url: String,
    filename: String,
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const favPlacesSchema = new Schema({
    title: String,
    location: String,
    geometry:  {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    // latitude: Number,
    // longitude: Number,
    description: String,
    // gmapsLink: String,
    category: {
        type: String,
        enum: categories
    },
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        },
    ],
}, opts);

favPlacesSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href='/places/${this._id}'>${this.title}</a>
    <p>${this.description.substring(0,20)}...</p>`;
}); 

// Middleware to delete review after we delete place...
favPlacesSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            // await Review.remove({
            // ---- remove is another way to do it
            _id: { $in: doc.reviews }
        })
    }
})

const Place = mongoose.model('Place', favPlacesSchema);
module.exports = { Place, categories }
