// Importing the libraries
const jwt = require("jsonwebtoken");
// Importing the .env file with the secret key
require("dotenv").config();

// Function to create a token
exports.createToken = (requestUser) => {
  // Create a token with the user's id, username and email
  const token = jwt.sign(requestUser, process.env.SECRET_KEY, {
    // Define the expiration time of the token
    expiresIn: "3h",
  });
  console.log(`A token has been created: ${token}, at ${new Date()}`);
  return token;
};

// Function to verify the token
exports.cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    res.cookie("token", token, { httpOnly: true });
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};
