const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// First Task: sqlForPartialUpdate - Documenting what this does:

//formatter. Changes camelCase to snake_Case to make queries, so that it
// is feasible to make direct queries in class methods, so that we can make
// PATCH or PUT (partial update in routes).


// is called in multiple places - company.js & users.js:

// is exported to company.js, and user.js in models and is required in each file. 

// company.js - this partialUpdate f() is used in Company class method to help update 
//company by fixing format, class method makes direct queries to db. Method is 
//called in routes for company update route. 

// users.js - used in User class method to help update a user, by fixing format
//class method makes direct queries to db. Method is called in routes for user 
//update route. 


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // if there is no data in array throw an error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

