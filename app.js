"use strict";

// This was by far my worst assignment, mostly a refactored solution. 
// with dcoumentation to show my understanding. 

// I feel this should not be on my portfolio. 

// (note - first cumulative project went poorly as well)
// I have a working version I refactored some things on solution file that does 
// work, I tried to update package.json on this file because I thought json-parser 
// wasn't working(I was wrong) - this version is messed up and refuses to run the
// server. I get this hideous error here when trying to run server.js: 

/// triggerUncaughtException(err, true /* fromPromise */);
// Error: getaddrinfo ENOTFOUND base

// ^ turning this version in to document this scary error. I felt surprised
// by the difficulty of this assigment, and feel I should be better than I am 
// right now. Wondering if I failed to retain enough information. 
// Fortunately I can read most of the solution code like a book and 
// understand what is going on, and feel confident I can employ similar techiniques
// on future projects. 

// accorind to Stack Overflow it might have something to do with this:

// getaddrinfo ENOTFOUND means client was not able to connect to given address.


// this code would work if the dependencies weren't messed up.

// I would prefer to move on from this nightmare and go onto the next unit. This
// was brutal. 



/** Express app for jobly. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
