const express = require("express");
const bcrypt = require("bcrypt");

// Adjust the path to your User model
const User = require("../models").User;

const router = express.Router();

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ where: { email: email } });

    const id = user.dataValues.id;

    console.log("id " + id);

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.save(() => {
        req.session.user_id = id;
        req.session.logged_in = true;
        req.session.user_name = user.first_name;
      });// Store user ID in session
      res.redirect(`/boards/${user.id}`); // Redirect to associated page

    } else {
      res.render("login", { error: "Invalid credentials" }); // Display error message
    }
  } catch (error) {
    res.render("login", { error: "An error occurred" }); // Display error message

  }
});


//to signup
router.post('/signup', async (req, res) => {
  try {
    const userData = await User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
    });

    // Automatically log in the newly signed up user
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.status(200).json({ user: userData, message: 'Signup successful' });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// to logout
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    // Remove the session variables
    req.session.destroy(() => {
      // confirm that user by name has been logged out in console
      req.session.logged_in = false; // Set logged_in to false
      console.log('User logged out:', req.session.user_id);
      res.redirect('/'); // Redirect to homepage
    });
  } else {
    res.status(404).end();
  }
});


module.exports = router;
