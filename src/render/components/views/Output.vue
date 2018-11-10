<template>
    <div>
        <div id="output-container">
            <div v-if="output.length !== 0" v-for="output in output" class="output cm-s-neat">
                <div><span class="cm-comment"><i>sql></i></span></div>
                <div><TextEditor v-bind:options="highlightedTextOptions" v-bind:value="output.sql"/></div>
                <div v-if="output.type === OUTPUT_TYPES.MODIFICATION"><strong>Rows Affected {{ output.rowsAffected }}</strong></div>
                <div id="execution-time"><strong>Executed in {{ output.executionTime }}ms</strong></div>
                <div v-if="output.type === OUTPUT_TYPES.TABLE">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th v-for="column in Object.keys(output.results[0])">
                                    {{ column }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(datum, i) in output.results">
                                <td class="no-highlight">{{ i + 1 }}</td>
                                <td v-for="key in Object.keys(datum)">
                                    {{ datum[key] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-else class="empty-view-text">No Output</div>
        </div>
        <ContextMenu
            v-bind:target="'output-container'"
            v-bind:items="[
                    {title: 'Clear', icon: 'fa-times', click: () => this.output = []},
                ]"
        />
    </div>
</template>

<script>
    import ContextMenu from "../containers/ContextMenu";

    import { codemirror as TextEditor } from 'vue-codemirror'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/mode/sql/sql.js'
    import 'codemirror/theme/neat.css'

    export default {
        name: "Output",
        components: {ContextMenu, TextEditor},
        data() {
            return {
                highlightedTextOptions: {
                    mode: "text/x-mysql",
                    theme: "neat",
                    readOnly: true,
                },

                OUTPUT_TYPES: {
                    QUERY: 0,
                    TABLE: 1,
                    MODIFICATION: 2,
                },

                output: [],
            }
        },
        methods: {
            /**
             * NOTE: This type may not be required
             *
             * Output to the console that a query has been performed.
             *
             * @param {string} sql - SQL code that was executed.
             * @param {string} executionTime - Time took for the query to be executed.
             */
            queryOutput(sql, executionTime) {
                this.output.push({
                    type: this.OUTPUT_TYPES.QUERY,
                    sql: sql,
                    executionTime: executionTime,
                    date: new Date()
                });
            },

            /**
             * Output a table of results to the console of a query that was executed.
             *
             * @param {string} sql - SQL code that was executed.
             * @param {string} executionTime - Time took for the query to be executed.
             * @param {Array} results - Set set to output as a table.
             */
            tableOutput(sql, executionTime, results) {
                this.output.push({
                    type: this.OUTPUT_TYPES.TABLE,
                    sql: sql,
                    executionTime: executionTime,
                    results: results,
                });
            },

            /**
             *
             * Output a query that has affected table rows.
             *
             * @param {string} sql - SQL code that was executed.
             * @param {string} executionTime - Time took for the query to be executed.
             * @param {string|number} rowsAffected - Number of rows that were affected/changed by the given query.
             */
            modificationOutput(sql, executionTime, rowsAffected) {
                this.output.push({
                    type: this.OUTPUT_TYPES.MODIFICATION,
                    sql: sql,
                    executionTime: executionTime,
                    rowsAffected: rowsAffected,
                });
            }
        }
    }
</script>

<style scoped>
    #output-container {
        background: white;
        height: 100%;
        padding: 5px 0 -10px 2px;
        width: 100%;
        overflow-y: scroll;
    }

    #output-container .output {
        margin-top: 10px;
    }

    #output-container .output > div:not(:last-of-type) {
        display: inline-block;
        height: 30px;
        margin-left: 5px;
        vertical-align: bottom;
    }

    #output-container > .output > #execution-time {
        line-height: 25px;
    }

    table {
        line-height: normal;
        margin: 10px;
        border-left: 1px solid #B2B2B2;
    }
</style>
