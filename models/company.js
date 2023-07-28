"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filters={}) {

    // if populated could look something like this...
                      // {
                      //   "name": "\"stark\"",
                      //   "min": "4",
                      //   "max": "8"
                      // }
// assisted by Springboard's solution - struggled with this one
      //documented my understanding refactored/renamed a bit to demonstrate understanding
 // patterned matched refactored VERY slightly, but I get an error this doesn't work,
 // not sure why. Get this strange error - note: this assignment feels way above my
 // abilities, should I be concerned? Am I not learning enough?

//  {
// 	"error": {
// 		"message": "Cannot read properties of null (reading '1')",
// 		"status": 400
// 	}
// }   // error source seems to be from node modules;  might be a simple fix?
 

//good news, I understand 90%  how the search is filtered.

    const companiesRes = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           `;

      let whereSomethingIs = []; // filteting: WHERE something = something
      let valsForParams = [];    // values we pass into the query!

      // if populated, extact these keys from the search query
      const { minEmployees, maxEmployees, name } = filters;

      if (minEmployees > maxEmployees) {
        throw new BadRequestError("Min cannot be greater than max");
      }

      if (minEmployees !== undefined) {  // if I enter vals into search bar
        valsForParams.push(minEmployees); // i.e /?minEmployees=5
        whereSomethingIs.push(`num_employees >= $${valsForParams.length}`); // $1
        // we do values.length because we need $1 for params to secure our db query
      }

      if (maxEmployees !== undefined) {
        valsForParams.push(maxEmployees);
        whereSomethingIs.push(`num_employees <= $${valsForParams.length}`);  // $2
      }

      if (name) {
        valsForParams.push(`%${name}%`); //ILIKE is where we find partial match.
        whereSomethingIs.push(`name ILIKE $${valsForParams.length}`);   //$3
      }  //Allows matching of strings based on comparison with a pattern.
  
      if (whereSomethingIs.length > 0) {  // if there are any WHERE expressions at all...
        companiesRes += " WHERE " + whereSomethingIs.join(" AND "); //... add them to the query
      }

      
      let orderBy = " ORDER BY name";
      companiesRes += orderBy
      

    const searchQueryResults = await db.query(companiesRes, valsForParams)
    return searchQueryResults.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
