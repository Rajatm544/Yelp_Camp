var express 	= require("express"),
	router  	= express.Router(),
	Comment 	= require("../models/comment"),
	middleware	= require("../middleware"),
	Campground 	= require("../models/campground"); 

// INDEX - Shows all campgrounds
router.get("/", function(req, res) {
	// Get all campgounds from the database
	var campGrounds = Campground.find({}, function(err, AllCampGrounds) {
		if(err) {
			console.log(err);
		} else {
			// pass the data
			res.render("campgrounds/index", {campGrounds: AllCampGrounds});
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
	var description = req.body.description;
	var user = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, image: image, description: description, user: user}
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
	// find the campground and update
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp){
		if(err){
			req.flash("error", err.message);
			res.redirect("/campgrounds/" + req.params.id + "/edit");
		}
		else {
			// redirect to show page
			req.flash("success", updatedCamp.name + " has been updated");
			res.redirect("/campgrounds/" + req.params.id)
		}
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