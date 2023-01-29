// Creating the server with express
const express = require("express");
const app = express();

// Defining the port
const PORT = 8080;

// Importing the libraries
const cookieParser = require("cookie-parser"); // Parse cookies
const bcrypt = require("bcrypt"); // Hashing passwords
const { createToken, cookieJwtAuth } = require("./token/jwt"); // Importing the functions from jwt.js to create and verify tokens
const { randomUUID } = require("crypto"); // Generate random UUID

//-----------------Database-----------------//
// Using knex and PostgreSQL
// The client is "pg" and the connection is to a local database called "users";

// Declaring the database and it's connection
const knex = require("knex")({
  client: "pg",
  connection: {
    // The connection is to a local
    host: "localhost",
    user: "",
    password: "",
    database: "",
  },
});

// Testing the connection
function testDbConnection() {
  // This query doesn't do anything, it's just to test the connection to the database
  knex
    .raw("SELECT 1+1 AS result")
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

//-----------------Creating / Resetting Database-----------------//
// THESE FUNCTIONS ARE ONLY FOR TESTING PURPOSES, IF YOU WANT TO USE THEM, YOU NEED TO COMMENT OUT THE CODE IN THE SERVER.JS FILE

// Creating the database if it doesn't exist
async function createDatabase() {
  knex.connection.database = "postgres";
  await knex.raw("DROP DATABASE IF EXISTS users");
  await knex.raw("CREATE DATABASE users");
  knex.connection.database = "users";
  console.log("Database created");
}

// Function to create a the table "users" with id uuid, name, username, email and password
async function createTable() {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("name");
    table.string("username");
    table.string("email");
    table.string("password");
  });
  console.log("Table created");
}

// Function to reset the database
async function resetDatabase() {
  await knex.raw("DROP DATABASE IF EXISTS users");
  await knex.raw("CREATE DATABASE users");
  knex.connection.database = "users";
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("name");
    table.string("username");
    table.string("email");
    table.string("password");
  });
  console.log("Database reset");
}

// Function to reset the table "users"
async function resetTable() {
  await knex.schema.dropTable("users");
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("name");
    table.string("username");
    table.string("email");
    table.string("password");
  });
  console.log("Table reset");
}

//-----------------Database functions-----------------//

// Function to insert a user into the database and make sure the data is valid
// name, email and password are required and should be strings
async function insertUser(user) {
  if (
    typeof user.name === "string" &&
    typeof user.username === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string"
  ) {
    await knex("users").insert(user);
    console.log("User inserted");
  } else {
    console.log("Invalid data");
  }
}

// Function to get all users from the database
async function getUsers() {
  const users = await knex.select("*").from("users");
  console.log(users);
}

// Function to get a user from the database
async function getUser(id) {
  const user = await knex("users").where({ id: id });
  console.log(user);
}

// Function to update a user in the database and make sure the data is valid
async function updateUser(id, user) {
  if (
    typeof user.name === "string" &&
    typeof user.username === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string"
  ) {
    await knex("users").where({ id: id }).update(user);
    console.log("User updated");
  } else {
    console.log("Invalid data");
  }
}

// Function to delete a user from the database
async function deleteUser(id) {
  await knex("users").where({ id: id }).del();
  console.log("User deleted");
}

async function search(search, searchType) {
  const users = await knex("users").where(searchType, search);
  return users;
}
//-----------------Hashing password-----------------//

function hashedPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

// Function to check if password is correct
function checkPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

//-----------------SERVER-----------------//

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Home" });
});

//------USER------//

// register & login & logout

// Register
app.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "Missing data" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too short" });
  }

  // Checking if user already exists
  const foundUserByEmail = await search(email, "email");
  const foundUserByUsename = await search(email, "email");

  if (foundUserByEmail.length > 0) {
    return res.status(400).json({ message: "Email is already being used" });
  }

  if (foundUserByUsename.length > 0) {
    return res.status(400).json({ message: "Username already being used" });
  }

  // Hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Creating user
  const user = {
    id: randomUUID(),
    name,
    username,
    email,
    password: hashedPassword,
  };

  // Creating token
  const token = createToken(user);

  // Storing token in cookie
  res.cookie("token", token, { httpOnly: true });

  // Storing user in database
  await insertUser(user);

  res.json({ message: "User created" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = {
    email,
    password,
  };

  // Checking if user exists

  let foundUser = await search(email, "email");

  if (foundUser.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  const validPassword = bcrypt.compareSync(password, foundUser[0].password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid password" });
  }

  // Create Token
  const token = createToken(user);

  // Storing token in cookie
  res.cookie("token", token, { httpOnly: true });
  res.json({ message: "User logged in" });

  // Returning user to the client
  // res.redirect("/user");
});

// Logout
app.get("/logout", cookieJwtAuth, (req, res) => {
  // Deleting token from cookie
  res.clearCookie("token");

  // Informing client that user is logged out
  res.json({ message: "User logged out" });
});

// User
app.get("/user", cookieJwtAuth, async (req, res) => {
  // uses the cookieJwtAuth middleware to check if the user is logged in, if has a valid token and gets the user from the token;
  // returns the user to the client
  let foundUser = await search(req.user.email, "email");

  // Creating a new object to send to the client without the password
  let sentUser = {
    id: foundUser[0].id,
    name: foundUser[0].name,
    username: foundUser[0].username,
    email: foundUser[0].email,
  };

  // sending user to the client
  res.json({ user: sentUser });
});

app.delete("/user/:id", cookieJwtAuth, (req, res) => {
  // uses the cookieJwtAuth middleware to check if the user is logged in, if has a valid token and gets the user from the token;
  // deletes the user from the database
  deleteUser(req.user.id);

  // deletes the token from the cookie
  res.clearCookie("token");

  // returns a message to the client
  res.json({ message: "User deleted" });
});

// A common user should not be able to access this route, only an admin
// app.get("/users", cookieJwtAuth, (req, res) => {
//   res.json({ users });
// });

//-----------------PORT-----------------//

// Listening to port 8080 by default
app.listen(PORT, () => {
  testDbConnection();
  console.log(`Example app listening at http://localhost:${PORT}`);
});
