<!-- Describe the project -->

# JWT user authentication API

<!-- Describe the project in brief -->

## Description

This is a simple user authentication API that uses JWT for authentication. It is built with Node.js, Express, PostgreSQL and knex.js.

<!-- Describe the motivation behind the project -->

## Motivation

To learn how to build a user authentication API with JWT and simplify the process of creating a new project.

<!-- Describe the features and how to use -->

## Features

- User registration
- User login
- User logout
- User profile
- User update profile
- User delete profile

## How to use

In order to use it, first clone the repository and install the dependencies.

# Install dependencies

You'll need to have Node.js, PostgreSQL and npm installed on your machine.

Node.js: https://nodejs.org/en/download/

PostgreSQL: https://www.postgresql.org/download/

npm: https://www.npmjs.com/get-npm

# Clone the repository

git clone https://github.com/andretakeo/JwtAuthentication.git

# Configuring

Create a .env file and add the following environment variables:

- SECRET_KEY=secret_key
- DATABASE_USER=user
- DATABASE_PASSWORD=password
- DATABASE_HOST=host

# Secret Key

- The secret key is used to sign the JWT token.
- It can be any string of your choice, but using some kind of gibberish generated randomly should be safer.

# Database

- The database used is PostgreSQL.
- When you install PostgreSQL, it will ask you to create a password for the default user (postgres).
- The default user is the user that will be used to connect to the database.
- The default user is also the user that will be used to create the database.

# npm files

- simply run npm install to install all the dependencies.

# Running

- To run the project, simply run npm start.
- The project will be running on port 8080 (http://localhost:8080).
- It will give you an error if the database is not created, so you'll need to create the database using the createDatabse and createTable functions in server.js.
- After creating the database and the table, you can run the project again. Should work just fine.
