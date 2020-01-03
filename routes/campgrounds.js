var express 	 = require("express"),
	router  	 = express.Router(),
	Comment 	 = require("../models/comment"),
	middleware	 = require("../middleware"),
	// Geocoder requirements
	NodeGeocoder = require('node-geocoder'),
 	options 	 = {
	  provider: 'google',
	  httpAdapter: 'https',
	  apiKey: process.env.GEOCODER_API_KEY,
	  formatter: null
	},
	geocoder  	 = NodeGeocoder(options),
	Campground 	 = require("../models/campground"); 

// INDEX - Shows all campgrounds
router.get("/", function(req, res) {
	// Get all campgounds from the database
	var campGrounds = Campground.find({}, function(err, AllCampGrounds) {
		if(err) {
			console.log(err);
		} else {
			// pass the data
			res.render("campgrounds/index", {campGrounds: AllCampGrounds, page: "campgrounds"});
		}
	});
});

// NEW - Show the form to craeta a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
});

// CREATE - Create a new campground
router.post("/", middleware.isLoggedIn, function(req, res) {
	// Get data from form
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var description = req.body.description;
	var user = {
		id: req.user._id,
		username: req.user.username
	};
	// To post the location using geocoder
	geocoder.geocode(req.body.location, function (err, data) {
	    if (err || !data.length) {
	    	console.log(err.message);
	    	req.flash('error', 'Invalid address');
	    	return res.redirect('back');
	    }
	    var lat = data[0].latitude;
	    var lng = data[0].longitude;
	    var location = data[0].formattedAddress;
		var newCampground = {name: name, image: image, price: price, location: location, description: description, user: user}
		// Creata a new campground and save it to the DB
		Campground.create(newCampground, function(err, newlyCreatedCamp) {
			if(err) {
				req.flash("error", err.message);
				res.redirect("/campgrounds");
			} 
			else {
				// Redirect to the campgrounds page
				req.flash("success", "New campground created!");
				res.redirect("/campgrounds");
			}
		});
	});
});

// SHOW - Show the info about one campground
router.get("/:id", function(req, res) {
	// Find the campground with the provided id
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
		if(err) {
			console.log(err);
		} 
		else {
			// render the show page corresponding to the id
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT - Show the form to edit the campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash("error", err.message);
			// redirect to show page
			res.redirect("/campgrounds/" + req.params.id);
		}
		else {
			// render the form to edit
			res.render("campgrounds/edit", {campground: campground});
		}
	})
});

// UPDATE - Update a particular campground
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	// To update location
	geocoder.geocode(req.body.location, function (err, data) {
	    if (err || !data.length) {
	      req.flash('error', 'Invalid address');
	      return res.redirect('back');
	    }
	    req.body.campground.lat = data[0].latitude;
	    req.body.campground.lng = data[0].longitude;
	    req.body.campground.location = data[0].formattedAddress;
		// find the campground and update
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp){
			if(err){
				req.flash("error", err.message);
				res.redirect("/campgrounds/" + req.params.id + "/edit");
			}
			else {
				// redirect to show page
				req.flash("success", updatedCamp.name + " has been successfully updated!");
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
});

// DELETE - Delete the campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	// find the campground and delete
	Campground.findByIdAndRemove(req.params.id, function(err, removedCamp){
		if(err){
			req.flash("error", err.message);
			res.redirect("/campgrounds/");
		}
		else {
			req.flash("success", "Successfully deleted campground");
			res.redirect("/campgrounds/");	
		}
	});
});

module.exports = router;