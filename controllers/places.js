const { Place, categories } = require('../models/place');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1Ijoib3ZldG1hayIsImEiOiJjbDlmYmgxeTYwZHA1M3BycWVtbXMxcnN1In0.t8MewFKiZ9Mii4-ayloTgg';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const { category } = req.query;
    if (category) {
        const places = await Place.find({ category })
        res.render('places/index', { places, category })
    } else {
        const places = await Place.find({})
        res.render('places/index', { places, category: 'All' })
    }
}

module.exports.new = async (req, res) => {
    res.render('places/new', { categories });
}

module.exports.newPost = async (req, res, next) => {
    // const place = new Place(req.body.place); this form works when we use place[title], place[location] names in ejss
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1,
    }).send()
    const place = new Place(req.body);
    place.geometry = geoData.body.features[0].geometry;
    place.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.author = req.user._id;
    await place.save();
    console.log(place);
    req.flash('success', 'Successfully created a place!');
    res.redirect(`places/${place._id}`);
}

module.exports.show = async (req, res, next) => {
    const { id } = req.params;
    const place = await Place.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
            //   model: 'Review'
        }
    }).populate('author');
    // geoData
    if(!place.geometry.coordinates) {
    const geoData = await geocoder.forwardGeocode({
        query: place.location,
        limit: 1,
    }).send()
    place.geometry = geoData.body.features[0].geometry;
    // geoData
    }
    if (!place) {
        req.flash('error', 'Cannot find that place!');
        return res.redirect('/places');
    }
    res.render('places/show', { place })
}

module.exports.editGet = async (req, res, next) => {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place) {
        req.flash('error', 'Cannot find that place!');
        return res.redirect('/places');
    }
    res.render('places/edit', { place, categories })
}

module.exports.editPut = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    // const product = await Product.findById(id); find & update (one way)
    const place = await Place.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.images.push(...imgs);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(place);
    }
    // geoData
    const geoData = await geocoder.forwardGeocode({
        query: place.location,
        limit: 1,
    }).send()
    place.geometry = geoData.body.features[0].geometry;
    // geoData
    await place.save();
    req.flash('success', 'Successfully updated a place!');
    res.redirect(`/places/${place._id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    const deletedPlace = await Place.findByIdAndDelete(id);
    req.flash('success', 'Place deleted! Thank you!');
    res.redirect('/places')
}