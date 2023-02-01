const mongoose = require('mongoose');
const { Place, categories } = require('../model/place');
const Review = require('../model/review');
const favPlaces = require('./favPlaces');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/placesSpain');
  console.log('Mongoose Listening (SEEDS) on port: 3000');
}

const seedDB = async () => {
    await Place.deleteMany({});
    await Review.deleteMany({});
    for (let i=0; i <10; i++) {
        const p = new Place({
            title: favPlaces[i].title,
            location: favPlaces[i].location,
            geometry: {
                type: "Point",
                coordinates: [
                    favPlaces[i].longitude,
                    favPlaces[i].latitude,
                ]
            },
            description: favPlaces[i].description,
            category: favPlaces[i].category,
            images: favPlaces[i].images,
            author: '6348474fb67aecd775eef6d5',
        })
        await p.save();
    }
}

seedDB();
