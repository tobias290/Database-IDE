export default class Output {
    /**
     * NOTE: This type may not be required
     *
     * @public
     *
     * Output to the console that a query has been performed.
     *
     * @param {string} sql - SQL code that was executed.
     * @param {string} executionTime - Time took for the query to be executed.
     */
    static queryOutput(sql, executionTime) {
        if (global.hasOwnProperty("vue"))
            global.vue.$refs.app.$refs.output.queryOutput(sql, executionTime);
    }

    /**
     * @public
     *
     * Output a table of results to the console of a query that was executed.
     *
     * @param {string} sql - SQL code that was executed.
     * @param {string} executionTime - Time took for the query to be executed.
     * @param {Array} results - Set set to output as a table.
     */
    static tableOutput(sql, executionTime, results) {
        if (global.hasOwnProperty("vue"))
            global.vue.$refs.app.$refs.output.tableOutput(sql, executionTime, results);
    }

    /**
     * @public
     *
     * Output a query that has affected table rows.
     *
     * @param {string} sql - SQL code that was executed.
     * @param {string} executionTime - Time took for the query to be executed.
     * @param {string|number} rowsAffected - Number of rows that were affected/changed by the given query.
     */
    static modificationOutput(sql, executionTime, rowsAffected) {
        if (global.hasOwnProperty("vue"))
            global.vue.$refs.app.$refs.output.modificationOutput(sql, executionTime, rowsAffected);
    }
}
