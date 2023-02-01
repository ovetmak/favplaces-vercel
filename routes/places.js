const express = require('express');

const multer = require('multer'); // file uploads
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const router = express.Router();
const places = require('../controllers/places');
const catchAsync = require('../utils/catchAsync');
const { isLoggetIn, isAuthor, validatePlace } = require('../middleware');

// ********** INDEX **********
router.get('/', catchAsync( places.index ));

// ********** NEW (C from CRUD) **********
router.get('/new', isLoggetIn, places.new);
router.post('/', isLoggetIn, upload.array('image'), validatePlace, catchAsync(places.newPost))

// ********** SHOW (R from CRUD) **********
router.get('/:id', catchAsync(places.show))

// ********** EDIT (U from CRUD) **********
router.get('/:id/edit', isLoggetIn, isAuthor, catchAsync(places.editGet))
router.put('/:id', isLoggetIn, upload.array('image'), isAuthor, places.editPut)

// ********** DELETE (D from CRUD) **********
router.delete('/:id', isLoggetIn, isAuthor, places.delete)
 
module.exports = router; 

// Some space could be save with router.route: (!!! /new has to be first to avoid mistake )
// router.route('/')
// .get(catchAsync( places.index ));
// .post(isLoggetIn, validatePlace, catchAsync(places.newPost))
// 
// router.route('/:id')
// .get(catchAsync(places.show))
// .put(isLoggetIn, isAuthor, places.editPut)
// .delete(isLoggetIn, isAuthor, places.delete)
