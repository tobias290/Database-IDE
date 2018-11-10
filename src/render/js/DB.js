/**
 * Various method relating to databases as well as methods to access the database methods on the main process.
 */
import Output from "./Output";

export default class DB {
    /**
     * @private
     *
     * @type {*} - Connection to the db module on the main process.
     */
    static db = window.require("electron").remote.require("./db");

    /**
     * @public
     *
     * Query the database.
     *
     * @param {string} sql - SQL code to execute.
     * @param {Function} callback - Callback called after the query is executed. (Params -> err, results, executionTime [seconds])
     * @param {boolean} output - If true it will display the query in the output, else it won't.
     */
    static query(sql, callback, output=false) {
        DB.db.query(sql, (err, results, executionTime) => {
            if (output) Output.queryOutput(sql, executionTime);

            callback(err, results, executionTime);
        });
    }

    /**
     * Queries the database for information relating to the columns on the given table.
     *
     * @param {string} tableName - Table name.
     * @param {Function} callback - Callback called after the query is executed. (Params -> err, results, executionTime [seconds])
     * @param {boolean} output - If true it will display the query in the output, else it won't.
     */
    static getTableKeyColumnUsageInformation(tableName, callback, output=false) {
        let sql = DB.generateTableKeyColumnUseageSql(tableName);

        DB.db.query(sql, (err, results, executionTime) => {
            if (output) Output.queryOutput(sql, executionTime);

            callback(err, results, executionTime);
        }, output);
    }

    /**
     * @public
     *
     * Generates the SQL code needed to get information about the columns relating to the given table.
     *
     * @param {string} tableName - Table name.
     * @return {string} - Returns the SQL required to get the column information.
     */
    static generateTableKeyColumnUseageSql(tableName) {
        return `SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = '${tableName}';`
    }

    /**
     * @public
     *
     * Generates the SQL required to so the status of a table.
     *
     * @param {string} tableName - Table name.
     * @return {string} - Returns the SQL required to so the status of a table.
     */
    static generateTableStatusSql(tableName) {
        return `SHOW TABLE STATUS WHERE Name = '${tableName}'`;
    }

    /**
     *
     * @public
     *
     * Generates the SQL required to change a table's name.
     *
     * @param {string} originalTableName - Original table name.
     * @param {string} newTableName - New table name.
     * @return {string} - Returns the sql required to change a table name
     */
    static generateRenameTableSql(originalTableName, newTableName) {
        return `RENAME TABLE \`${originalTableName}\` TO \`${newTableName}\``
    }

    /**
     * @public
     *
     * Generates the SQL required to change a table's comment.
     *
     * @param {string} tableName - Table's name.
     * @param {string} comment - New comment for the table
     * @return {string} -  Returns the sql required to change a table's comment
     */
    static generateChangeTableCommentSql(tableName, comment) {
        return `ALTER TABLE \`${tableName}\` COMMENT '${comment}'`
    }

    /**
     * @public
     *
     * Generates the SQL required to show the column information about a certain table.
     *
     * @param {string} tableName - Table name.
     * @param {boolean} full - If true the 'FULL' keyword will be added which gives extra information such as comments.
     * @return {string} - Returns the SQl required to generate column information.
     */
    static generateShowTableColumnsSql(tableName, full=false) {
        return `SHOW ${full ? "FULL" : ""} COLUMNS FROM \`${tableName}\``;
    }

    /**
     * @public
     *
     * Generates the SQL code needed to create a full column definition statement.
     *
     * @param {string} name - Column name.
     * @param {string} type - Column's data type.
     * @param {string} defaultValue - Default value of the column.
     * @param {boolean} notNull - True if the column cannot be empty, otherwise false.
     * @param {boolean} autoIncrement - True if the column will automatically increment, otherwise false.
     * @param {boolean} unique - True if the column is to be unique, otherwise false.
     * @param {string} comment - Comment for the columns definition.
     * @return {string} - Returns the SQL required to generate a new row.
     */
    static generateFullColumnDefinitionSql(name, type, defaultValue, notNull, autoIncrement, unique, comment) {
        let statement = "";

        statement += `\`${name}\` ${type}`;
        statement += notNull ? " NOT NULL" : "";
        statement += autoIncrement ? " AUTO_INCREMENT" : "";
        statement += unique ? " UNIQUE": "";
        statement += defaultValue !== "" ? ` DEFAULT ${defaultValue}`: "";
        statement += comment !== "" && comment !== undefined ? ` COMMENT '${comment}'`: "";

        return statement;
    }

    /**
     * @public
     *
     * Generates the SQL code needed to create a new column.
     *
     * @param {string} tableName - Table name.
     * @param {string} name - Column name.
     * @param {string} type - Column's data type.
     * @param {string} defaultValue - Default value of the column.
     * @param {boolean} notNull - True if the column cannot be empty, otherwise false.
     * @param {boolean} autoIncrement - True if the column will automatically increment, otherwise false.
     * @param {boolean} primaryKey - True if the column will be a primary key, otherwise false.
     * @param {boolean} unique - True if the column is to be unique, otherwise false.
     * @param {string} comment - Comment for the columns definition.
     * @return {string} - Returns the SQL required to generate a new row.
     */
    static generateNewColumnSql(tableName, name, type, defaultValue, notNull, autoIncrement, primaryKey, unique, comment) {
        let statement = `ALTER TABLE \`${tableName}\``;

        statement += ` ADD COLUMN `;
        statement += DB.generateFullColumnDefinitionSql(name, type, defaultValue, notNull, autoIncrement, unique, comment) + " ";
        statement += primaryKey ? `, ADD PRIMARY KEY (${name})` : "";
        statement += ";";

        return statement;
    }

    static generateDropColumnSql(tableName, columnName) {
        return `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;
    }

    /**
     * @public
     *
     * Generates the SQL required to move a column to a new position in the table.
     *
     * @param {string} tableName - Table name.
     * @param {Array} columnInformation - Name of the column which is being moved.
     * @param {string|null} afterColumnName - Name of column to position given column after. If false the column will be first.
     * @return {string} - Returns the SQL needed to move a columns position.
     */
    static generateMoveColumnSql(tableName, columnInformation, afterColumnName) {
        if (afterColumnName == null) {

        } else {

        }
    }

    /**
     * @public
     *
     * Generates the SQL code needed to update/modify an existing column.
     *
     * @param {string} tableName - Table name.
     * @param {string} oldName - Column's original name.
     * @param {boolean} hasPrimaryKey - If true the the original column has a primary key.
     * @param {string} name - Column's new name.
     * @param {string} type - Column's data type.
     * @param {string} defaultValue - Default value of the column.
     * @param {boolean} notNull - True if the column cannot be empty, otherwise false.
     * @param {boolean} autoIncrement - True if the column will automatically increment, otherwise false.
     * @param {boolean} primaryKey - True if the column will be a primary key, otherwise false.
     * @param {boolean} unique - True if the column is to be unique, otherwise false.
     * @param {string} comment - Comment for the columns definition.
     * @return {string} - Returns the SQL required to update/modify a the column.
     */
    static generateUpdateColumnStatement(tableName, oldName, hasPrimaryKey, name, type, defaultValue, notNull, autoIncrement, primaryKey, unique, comment) {
        let statement = `ALTER TABLE \`${tableName}\``;

        // Starting statement depends on whether the column name has changed or not
        statement += oldName !== name ? ` CHANGE \`${oldName}\` ` : ` MODIFY `;
        statement += DB.generateFullColumnDefinitionSql(name, type, defaultValue, notNull, autoIncrement, unique, comment) + " ";

        // If the original didn't have a primary key and the updated does add one, if not nothing needs adding
        statement += primaryKey ? `, ADD PRIMARY KEY (${name})` : "";

        // If the original column has a primary key and the updated doesn't that means we need to drop the primary key
        statement += hasPrimaryKey && !primaryKey  ? `, DROP PRIMARY KEY` : "";

        statement += ";";

        return statement;
    }

    /**
     * @public
     *
     * Generates the SQL required to creating a new row.
     *
     * @param {string} tableName - Name of the currentTable in which the row is being updated.
     * @param {object} newRow - New row object. (Fields with '<generated>' or '<default>' are ignored.)
     * @returns {string} - Returns the SQL code.
     */
    static generateNewRowSql(tableName, newRow) {
        let insertData = {};

        for (let column of Object.keys(newRow)) {
            // Only insert data if it is does not have a default value and it is not automatically generated
            if (newRow[column] !== "<generated>" && newRow[column] !== "<default>") {
                insertData[column] = newRow[column];
            }
        }

        if (Object.keys(insertData).length === 0)
            return `INSERT INTO ${tableName} () VALUES ()`;
        else
            return `INSERT INTO ${tableName} ('${Object.keys(insertData).join("' , '")}') VALUES ('${Object.values(insertData).join("' , '")}')`;
    }

    /**
     * @public
     *
     * Generates the SQL required to update a given row.
     *
     * @param {string} tableName - Name of the currentTable in which the row is being updated.
     * @param {string} column - Name of column which is being updated.
     * @param {string} newValue - New value for the field.
     * @param {string|number} primaryKeyColumn - Name of the primary key column for this currentTable.
     * @param {string|number} primaryKeyValue - Value of the current row's value for the primary key
     * @returns {string} - Returns the SQL code.
     */
    static generateUpdateRowSql(tableName, column, newValue, primaryKeyColumn, primaryKeyValue) {
        return `UPDATE ${tableName} SET ${column} = '${newValue}' WHERE ${primaryKeyColumn} = ${primaryKeyValue}`;
    }

    /**
     * @public
     *
     * Generates the SQL required to delete a given row.
     *
     * @param {string} tableName - Name of the table to delete from.
     * @param {string} primaryKeyColumn - Name of the primary key column for this currentTable.
     * @param {string} primaryKeyValue - Value of the current row's value for the primary key
     * @return {string} - Returns the SQL code to delete a row.
     */
    static generateDeleteRowSql(tableName, primaryKeyColumn, primaryKeyValue) {
        return `DELETE FROM ${tableName} WHERE ${primaryKeyColumn} = '${primaryKeyValue}'`;
    }
}
