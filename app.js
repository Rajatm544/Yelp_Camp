var express 	   = require("express"),
	bodyParser     = require("body-parser"),
	mongoose 	   = require("mongoose"),
	app 		   = express(),
	flash 		   = require("connect-flash"),
	passport 	   = require("passport"),
	localStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	User 		   = require("./models/user"),
	Campground     = require("./models/campground"),
	Comment        = require("./models/comment"),
	seedDB		   = require("./seeds");

var authRoutes		  = require("./routes/index"),
	commentsRoutes 	  = require("./routes/comments"),
	campgroundsRoutes = require("./routes/campgrounds");

// Connect mongodb
mongoose.connect("mongodb+srv://Rajat:NH7eQ1BZUYli1JQ8@cluster0-vloon.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});
// Set ejs as the default template format; ejs-embedded JS
app.set("view engine",  "ejs");
// Tell express that style sheets are in the "public" folder
app.use(express.static(__dirname + "/public"));
// We need this to use body-parser and retrieve form data
app.use(bodyParser.urlencoded({ extended : true} ));
// Use method-override to use the PUT & DELETE Routes
app.use(methodOverride("_method"));
// Use connect-flash to send flash messages
app.use(flash());

// seed the DB with intial data
// seedDB();

// PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Some secret message that you don't want to know",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// To show/hide links in navbar AND To implement flash messages
app.use(function(req, res, next){
	// res.locals is equivalent to the global variable
	res.locals.currentUser = req.user;
	// sending the flash message object to all templates
	res.locals.errorMessage = req.flash("error");
	res.locals.successMessage = req.flash("success");
	return next();
});

// To import the routes of various types
app.use("/", authRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

app.listen(process.env.PORT, "0.0.0.0", function() {
	console.log("Server has started");
});


