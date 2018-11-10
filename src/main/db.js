let db;

/**
 * Connect to the database.
 */
exports.dbConnect = () => {
    let config = require("../render/config.json");
    let mysql = require("mysql");

     db = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
    });
};

/**
 * Query the database.
 *
 * @param {string} sql - SQL code to execute.
 * @param {Function} callback - Callback called after the query is executed. (Params -> err, results, executionTime [seconds])
 */
exports.query = (sql, callback) => {
    let preQuery = process.hrtime();

    db.query(sql, (err, results) => {
        if (err) return callback(true, err);

        let executionTime = process.hrtime(preQuery);
        executionTime = executionTime[1] / 1e+6;

        callback(err, results, executionTime);
    });
};
