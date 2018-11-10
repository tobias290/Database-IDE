<template>
    <div v-if="tableName != null" id="container">
        <div class="icon-bar">
            <i
                class="fas fa-plus"
                title="Add Row"
                v-on:click="addRow"
            ></i>
            <i
                class="fas fa-minus"
                title="Remove Row"
                v-bind:class="{'disabled': !canRemoveRow}"
                v-on:click="canRemoveRow ? removeRow() : null"
            ></i>
            <i
                class="fas fa-sync-alt"
                title="Refresh"
                v-on:click="refresh"
            ></i>
            <i
                class="fas fa-upload"
                title="Update"
                v-bind:class="{'disabled': !tableBeenChanged, 'active': tableBeenChanged}"
                v-on:click="tableBeenChanged ? updateTable() : null"
            ></i>
            <i
                class="fas fa-filter"
                title="Filter"
                v-bind:class="{'active-background': showFilter}"
                v-on:click="toggleFilter"
            ></i>
            <i
                class="fas fa-search-plus"
                v-on:click="zoom(true)"
                title="Zoom In"
            ></i>
            <i
                class="fas fa-search-minus"
                title="Zoom Out"
                v-on:click="zoom(false)"
            ></i>
            <span id="zoom">Zoom {{ currentZoom }}%</span>
        </div>
        <div v-if="showFilter" id="filter">
            <!-- TODO: implement history -->
            <!--<i class="fas fa-history"></i>-->
            <input
                v-bind:class="{'filter-error': filterError}"
                v-model="filterQuery"
                v-on:keyup.enter="filter"
                v-on:keydown="() => {this.filterError = false; this.filterErrorMessage = ''}"
                placeholder="Filter..."
                v-bind:title="filterErrorMessage"
            />
            <!-- TODO: Get text editor working -->
            <!--<TextEditor-->
                <!--ref="filterInput"-->
                <!--v-bind:options="filterOptions"-->
                <!--v-on:keyup.enter.filter="filter"-->
                <!--v-on:keydown.filter="() => {this.filterError = false; this.filterErrorMessage = ''}"-->
            <!--/>-->
        </div>
        <div id="table-container" ref="currentTable">
            <ContextMenu
                v-bind:target="'table_' + tableName"
                v-bind:items="[
                    {title: 'Edit', icon: 'fa-edit', click: () => cellDblClick(cellIsActive.key, cellIsActive.datum)},
                    {title: 'Go to Foreign Key', icon: 'fa-external-link-alt', disabled: !isForeignKey(cellIsActive.key), click: () => goToForeignKeyTable(cellIsActive.key)},
                    {type: 'separator'},
                    {title: 'Add Row', icon: 'fa-plus', click: addRow},
                    {title: 'Remove Row', icon: 'fa-minus', click: () => removeRow(cellIsActive.datum), disabled: !canRemoveRow},
                    {type: 'separator'},
                    {title: 'Update', icon: 'fa-upload active', click: updateTable, disabled: !tableBeenChanged},
                    {title: 'Refresh', icon: 'fa-sync-alt', click: refresh}
               ]"
            />
            <table v-bind:id="'table_' + tableName">
                <thead>
                    <tr>
                        <th></th>
                        <th v-for="column in columnInformation" v-bind:title="column['Comment'] !== '' ? column['Type'] + ' — Comment: ' + column['Comment'] : column['Type']">
                            {{ column["Field"] }}
                            <i
                                v-bind:class="{
                                    'fas fa-caret-down': currentSort.method === -1 && currentSort.column ===  column['Field'],
                                    'fas fa-sort':       currentSort.method ===  0 || currentSort.column !==  column['Field'],
                                    'fas fa-caret-up':   currentSort.method ===  1 && currentSort.column ===  column['Field'],
                                }"
                                v-on:click="sort(column['Field'])"
                            ></i>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(datum, i) in currentTable">
                        <td class="no-highlight">{{ i + 1 }}</td>
                        <td
                            v-for="key in Object.keys(datum)"
                            v-bind:class="{'active': cellIsActive.key === key && cellIsActive.datum === datum}"
                            v-on:contextmenu="cellClick(key, datum)"
                            v-on:click="cellClick(key, datum)"
                            v-on:dblclick="cellDblClick(key, datum)"
                        >
                            <span v-if="cellIsInput.key === key && cellIsInput.datum === datum">
                                <input
                                    id="cell-input"
                                    autofocus
                                    v-bind:value="datum[key]"
                                    v-on:keyup.enter="cellInputEnter($event, i, key, datum)"
                                />
                            </span>
                            <span v-else>
                                {{ datum[key] }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div v-else>
        <div class="empty-view-text">
            No Table Selected
        </div>
    </div>
</template>

<script>
    import DB from "../../js/DB";
    import ContextMenu from "../containers/ContextMenu";

    import { codemirror as TextEditor } from 'vue-codemirror'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/mode/sql/sql.js'
    import 'codemirror/theme/neat.css'
    import 'codemirror/addon/display/placeholder.js'

    /**
     * Displays the active currentTable showing all the fields and records.
     */
    export default {
        name: "Table",
        components: {ContextMenu, TextEditor},
        props: {
            tableName: {
                type: String | null,
                required: true,
            },
        },
        data() {
            return {
                columnInformation: [],

                originalTable: [],
                currentTable: [],

                tableBeenChanged: JSON.stringify(this.currentTable) !== JSON.stringify(this.originalTable),
                canRemoveRow: this.currentTable != null && this.originalTable != null && this.currentTable.length > 0,

                currentZoom: 100,

                filterOptions: {
                    autofocus: true,
                    extraKeys: {"Ctrl-Space": "autocomplete"},
                    line: true,
                    matchBrackets : true,
                    mode: "text/x-mysql",
                    scrollbarStyle: "null",
                    theme: "neat",
                    placeholder: "Filter...",
                },
                showFilter: false,
                filterQuery: "",
                filterError: false,
                filterErrorMessage: "",

                currentSort: {
                    method: 0,
                    column: "",
                },

                cellIsInput: {
                    key: "",
                    datum: {},
                },

                cellIsActive: {
                    key: "",
                    datum: {},
                },

                pendingQueries: [],
            }
        },
        beforeMount() {
            // Loads data on load.
            this.refresh();
        },
        updated() {
            if (!this.showFilter) return;

            this.$refs.filterInput.codemirror.on("beforeChange", (cm, change) => {
                let typedNewLine = change.origin === '+input' && typeof change.text === "object" && change.text.join("") === "";
                if (typedNewLine) {
                    return change.cancel();
                }

                let pastedNewLine = change.origin === 'paste' && typeof change.text === "object" && change.text.length > 1;

                if (pastedNewLine)
                    return change.update(null, null, [change.text.join(" ")]);

                return null;
            });
        },
        methods: {
            /**
             * @return {string} - Returns the primary key of the current currentTable
             */
            getPrimaryKey() {
                for (let column of this.columnInformation)
                    if (column["Key"] === "PRI")
                        return column["Field"];
            },

            /**
             * Zooms in/out the currentTable displaying the data.
             *
             * @param {boolean} zoomIn - If true it will zoom in, else it will zoom out.
             */
            zoom(zoomIn) {
                this.currentZoom = zoomIn ? this.currentZoom + 5 : this.currentZoom - 5;

                this.$refs.currentTable.style.zoom = this.currentZoom + "%";
            },

            /**
             * Refreshes the currentTable.
             */
            refresh() {
                DB.query(`SHOW FULL COLUMNS FROM ${this.tableName}`, (err, results) => {
                    if (err) return console.log(results);

                    this.columnInformation = results;
                });

                if (this.currentSort.method === 0 || this.currentSort.column === "") {
                    DB.query(`SELECT * FROM ${this.tableName}`, (err, results) => {
                        if (err) return console.log(results);

                        this.currentTable = results;
                        this.originalTable = results.slice();
                    });
                } else {
                    let sortKeyWord = this.currentSort.method === -1 ? "DESC" : "ASC";

                    DB.query(`SELECT * FROM ${this.tableName} ORDER BY ${this.currentSort.column} ${sortKeyWord}`, (err, results) => {
                        if (err) return console.log(results);

                        this.currentTable = results;
                        this.originalTable = results.slice();
                    });
                }
            },

            /**
             * Shows and hides the filter input.
             */
            toggleFilter() {
                this.showFilter = !this.showFilter;
                this.filterQuery = "";
                this.filterError = false;
                this.filterErrorMessage = "";
                this.refresh();
            },

            /**
             * Executes a filter command.
             */
            filter() {
                if (this.filterQuery === "")
                    return this.refresh();

                DB.query(`SELECT * FROM ${this.tableName} WHERE ${this.filterQuery}`, (err, results) => {
                    if (err) {
                        this.filterError = true;
                        this.filterErrorMessage = results.sqlMessage;
                    } else {
                        this.filterError = false;
                        this.filterErrorMessage = "";

                        this.currentTable = results;
                        this.originalTable = results.slice();
                    }
                });
            },

            /**
             * Adds a new row to the currentTable
             */
            addRow() {
                let newRow = {};

                for (let column of this.columnInformation) {
                    if (column["Extra"] === "auto_increment") {
                        // Row is automatically generated
                        newRow[column["Field"]] = "<generated>";
                    } else if (column["Default"] != null) {
                        // Row had a default value
                        newRow[column["Field"]] = "<default>"
                    } else {
                        // Row has no default value
                        newRow[column["Field"]] = null;
                    }
                }
                this.currentTable.push(newRow);
            },

            /**
             * Removes a row from the currentTable
             */
            removeRow(rowDatum={}) {
                // Can't remove a row if the table has none
                if (this.currentTable.length <= 0) return;

                // Name of the primary key column
                let tablePrimaryKey = this.getPrimaryKey();

                // Row which is being deleted
                let row;

                // Checks if the row being deleted is a new row which hasn't been uploaded yet
                let isNewRow;

                // If the given row is not empty then we aren't removing the latest row
                if (Object.values(rowDatum).length !== 0) {
                    for (let i in this.currentTable) {
                        if (this.currentTable[i][tablePrimaryKey] === rowDatum[tablePrimaryKey]) {
                            row = this.currentTable.splice(i, 1)[0];
                            isNewRow = i + 1 > this.originalTable.length;
                        }
                    }
                } else {
                    row = this.currentTable.pop();
                    isNewRow = this.currentTable.length > this.originalTable.length;
                }


                // Only if the given row isn't new do we want to drop it
                // If the column is new it hasn't been uploaded yet therefore we can just remove it from the list
                if (!isNewRow) {
                    this.pendingQueries.push(
                        DB.generateDeleteRowSql(
                            this.tableName,
                            tablePrimaryKey,
                            row[tablePrimaryKey]
                        )
                    );
                }
            },

            /**
             * Updates the currentTable after changed have been made
             */
            updateTable() {
                if (this.currentTable.length !== this.originalTable.length) {
                    // Generates the SQL for news rows by slicing the table after the original length
                    this.currentTable
                        .slice(this.currentTable.length - (this.currentTable.length - this.originalTable.length))
                        .forEach((newRow) => this.pendingQueries.push(DB.generateNewRowSql(this.currentTable, newRow)));
                }


                // Loop over each query and execute it
                for (let i in this.pendingQueries) {
                    DB.query(this.pendingQueries[i], (err, results) => {
                        if (err) return console.log(results);

                        // Remove query after executing it
                        this.pendingQueries.splice(i, 1);

                        // Refresh to get results
                        this.refresh();
                    });
                }
            },

            /**
             * Sets the sorting criteria.
             *
             * @param {string} column - Name of the current column to sort by
             */
            sort(column) {
                // Code executes if a new column is being sorted
                if (this.currentSort.column !== column && this.currentSort.column !== "") {
                    this.currentSort.method = 1;
                    this.currentSort.column = column;
                } else {
                    // Iterate over the sorting type and sets the method and field to the correct values
                    switch (this.currentSort.method) {
                        case -1: // Descending
                            this.currentSort.method = 0;
                            this.currentSort.column = "";
                            break;
                        case 0: // None
                            this.currentSort.method = 1;
                            this.currentSort.column = column;
                            break;
                        case 1: // Ascending
                            this.currentSort.method = -1;
                            this.currentSort.column = column;
                            break;
                    }
                }

                this.refresh()
            },

            /**
             * Called when a cell is clicked to clear any input that is active.
             *
             * @param {string} key - Column name.
             * @param {object} datum - Datum object.
             */
            cellClick(key, datum) {
                if (this.cellIsInput.key !== key || this.cellIsInput.datum !== datum) {
                    this.cellIsInput.key = "";
                    this.cellIsInput.datum = {};
                }

                if (this.cellIsActive.key !== key || this.cellIsActive.datum !== datum) {
                    this.cellIsActive.key = key;
                    this.cellIsActive.datum = datum;
                }
            },

            /**
             * Called when a cell is double clicked to clear any input that is active and to create an input on the cell clicked.
             *
             * @param {string} key - Column name.
             * @param {object} datum - Datum object.
             */
            cellDblClick(key, datum) {
                this.cellIsInput.key = this.cellIsInput.key === key ? "" : key;
                this.cellIsInput.datum = this.cellIsInput.datum === datum ? {} : datum;
            },

            /**
             * Called when the enter key in pressed on a cell input.
             *
             * @param {object} event - Event instance.
             * @param {number} i - Index of the current currentTable row in the 'currentTable' array.
             * @param {string} key - Column name.
             * @param {object} datum - Datum object.
             */
            cellInputEnter(event, i, key, datum) {
                // Create copy of object
                let row = Object.assign({}, this.currentTable[i]);

                // Update value
                row[key] = event.target.value;

                // Replace row
                this.currentTable[i] = row;

                // Update to see if any changes were name
                this.tableBeenChanged = JSON.stringify(this.currentTable) !== JSON.stringify(this.originalTable);

                // Only generate SQL if this is not a new row
                if (i + 1 <= this.originalTable.length) {
                    // FIXME: Chance that the primary key is composite

                    let primaryKey = this.getPrimaryKey();
                    let primaryKeyValue = this.currentTable[i][primaryKey];

                    let q = DB.generateUpdateRowSql(
                        this.tableName,
                        key,
                        event.target.value,
                        primaryKey,
                        primaryKeyValue
                    );

                    console.log(q);

                    // Add query to pending queries
                    this.pendingQueries.push(
                        q
                    );
                }

                // Invoke double click to remove the input
                this.cellDblClick(key, datum);
            },

            /**
             * Checks if the clicked cell is a foreign key.
             *
             * @param {string} key - Name of the clicked column.
             * @return {boolean} - Returns true if the clicked column is a foreign key
             */
            isForeignKey(key) {
                return this.columnInformation.some((column) => column["Field"] === key && column["Key"] === "MUL");
            },

            /**
             * Go to the table with the clicked foreign key.
             *
             * @param {string} key - Name of the clicked column.
             */
            goToForeignKeyTable(key) {
                DB.getTableKeyColumnUsageInformation(this.tableName, (err, results) => {
                    if (err) return console.log(results);

                    for (let columnInformation of results)
                        if (columnInformation["COLUMN_NAME"] === key)
                            this.$emit("add-tab", columnInformation["REFERENCED_TABLE_NAME"], "table");
                });
            }
        },
        watch: {
            /**
             * Watcher waiting to be called by the parent component to change the active currentTable.
             */
            tableName() {
                DB.query(`SHOW FULL COLUMNS FROM ${this.tableName}`, (err, results) => {
                    if (err) return console.log(results);

                    this.columnInformation = results;
                });

                DB.query(`SELECT * FROM ${this.tableName}`, (err, results) => {
                    if (err) return console.log(results);

                    this.currentTable = results;
                    this.originalTable = results.slice();
                });
            },
            /**
             * Every time the currentTable is changed this check to see if the currentTable is different to the original data
             */
            currentTable() {
                this.tableBeenChanged = JSON.stringify(this.currentTable) !== JSON.stringify(this.originalTable);
                this.canRemoveRow = this.currentTable.length > 0;
            }
        }
    }
</script>

<style>
    #filter .CodeMirror {
        background: #F2F2F2;
        box-sizing: border-box;
        border: none;
        border-top: 1px solid #B2B2B2;
        padding-left: 5px;
        padding-top: 4px;
    }
</style>

<style scoped>
    #container {
        background: white;
        height: 100%;
        width: 100%;
        overflow: auto;
    }

    #zoom {
        float: right;
        height: 30px;
        line-height: 30px;
        width: 100px;
    }

    #filter {
        background: #F2F2F2;
        height: 30px;
        width: 100%;
    }

    #filter > input {
        background: #F2F2F2;
        border: none;
        border-top: 1px solid #B2B2B2;
        border-bottom: 1px solid #B2B2B2;
        font-family: monospace, Monospaced !important;
        font-size: 14px;
        height: 100%;
        padding-left: 10px;
        width: 100%;
    }

    .filter-error {
        border-top: 1px solid #D9534F !important;
        border-bottom: 1px solid #D9534F !important;
    }

    #table-container {
        height: -webkit-calc(100% - 30px);
        width: 100%;
        overflow: auto;
        zoom: 100%;
    }

    #cell-input {
        background: white;
        border: none;
        font-family: 'Raleway', sans-serif;
        font-size: 12px;
        width: 100%;
        height: 25px;
    }
</style>
