<template>
    <Form v-on:submit="submit" id="container">
        <div id="table-inputs">
            <!-- Rename Table -->
            <div>
                <div class="form-icon">
                    <i class="fas fa-table"></i>
                </div>
                <input
                    type="text"
                    placeholder="Table Name"
                    title="Rename Table"
                    v-bind:value="modifiedTableInformation.name"
                    v-on:keyup="textInputChange(COLUMN_TYPES.INPUT_TYPES.TABLE_NAME, null, $event)"
                />
            </div>
            <div>
                <!-- Table Comment -->
                <div class="form-icon" title="Comment">
                    <i class="fas fa-comment-alt"></i>
                </div>
                <input
                    type="text"
                    placeholder="Comment"
                    title="Comment"
                    v-bind:value="modifiedTableInformation.comment"
                    v-on:keyup="textInputChange(COLUMN_TYPES.INPUT_TYPES.TABLE_COMMENT, null, $event)"
                />
            </div>
        </div>

        <div class="column" v-bind:class="{'reorder': reorder}" v-bind:id="i" v-for="(column, i) in modifiedColumnInformation">
            <div class="reorder-column" v-bind:class="{'display': reorder}">
                <span><strong>{{ column.name }}</strong>  — {{ column.type }}</span>
                <div>
                    <i
                        class="fas fa-arrow-down"
                        v-bind:class="{'disabled': i === modifiedColumnInformation.length - 1}"
                        v-bind:title="!(i === modifiedColumnInformation.length - 1) ? 'Move Down' : ''"
                        v-on:click="!(i === modifiedColumnInformation.length - 1) ? moveColumn(i, false) : null"
                    ></i>
                    <i
                        class="fas fa-arrow-up"
                        v-bind:class="{'disabled': i === 0}"
                        v-bind:title="!(i === 0) ? 'Move Up' : ''"
                        v-on:click="!(i === 0) ? moveColumn(i, true) : null"
                    ></i>
                </div>
            </div>

            <div class="top" v-bind:class="{'hide': reorder}">
                <!-- Column Name -->
                <div class="form-icon" title="Column Name">
                    <i class="fas fa-columns"></i>
                </div>
                <input
                    type="text"
                    placeholder="Name"
                    title="Name"
                    v-bind:value="column.name"
                    v-on:keyup="textInputChange(COLUMN_TYPES.INPUT_TYPES.NAME, i, $event)"
                />

                <!-- Column Type -->
                <div class="form-icon" title="Column Type">
                    <i class="fas fa-code"></i>
                </div>
                <input
                    type="text"
                    placeholder="Data Type"
                    title="Data Type"
                    v-bind:value="column.type"
                    v-on:keyup="textInputChange(COLUMN_TYPES.INPUT_TYPES.DATA_TYPE, i, $event)"
                />

                <!-- Column Default -->
                <div class="form-icon" title="Default">
                    <i class="fas fa-thumbtack"></i>
                </div>
                <input
                    type="text"
                    placeholder="Default"
                    title="Default"
                    v-bind:value="column.default"
                    v-on:keyup="textInputChange(COLUMN_TYPES.INPUT_TYPES.DEFAULT, i, $event)"
                />
            </div>

            <div class="bottom" v-bind:class="{'hide': reorder}">
                <!-- Column Not Null -->
                <label class="checkbox-container">
                    Not Null
                    <input
                        type="checkbox"
                        v-bind:checked="column.not_null"
                        v-on:click="checkMarkChange(
                            COLUMN_TYPES.CHECK_MARK_TYPES.NOT_NULL,
                            i,
                            $event
                        )"
                    />
                    <span class="checkmark"></span>
                </label>

                <!-- Column Auto Increment -->
                <label class="checkbox-container">
                    Auto Increment
                    <input
                        type="checkbox"
                        v-bind:checked="column.auto_increment"
                        v-on:click="checkMarkChange(
                            COLUMN_TYPES.CHECK_MARK_TYPES.AUTO_INCREMENT,
                            i,
                            $event
                        )"
                    />
                    <span class="checkmark"></span>
                </label>

                <!-- Column Primary Key -->
                <label class="checkbox-container">
                    Primary Key
                    <input
                        type="checkbox"
                        v-bind:checked="column.primary_key"
                        v-on:click="checkMarkChange(
                            COLUMN_TYPES.CHECK_MARK_TYPES.PRIMARY_KEY,
                            i,
                            $event
                        )"
                    />
                    <span class="checkmark"></span>
                </label>

                <!-- Column Unique -->
                <label class="checkbox-container">
                    Unique
                    <input
                        type="checkbox"
                        v-bind:checked="column.unique"
                        v-on:click="checkMarkChange(
                            COLUMN_TYPES.CHECK_MARK_TYPES.UNIQUE,
                            i,
                            $event
                        )"
                    />
                    <span class="checkmark"></span>
                </label>

                <!-- Column Comment -->
                <div class="form-icon" title="Comment">
                    <i class="fas fa-comment-alt"></i>
                </div>
                <input
                    type="text"
                    placeholder="Comment"
                    title="Comment"
                    v-bind:value="column.comment"
                    v-on:keyup="textInputChange(COLUMN_TYPES.INPUT_TYPES.COMMENT, i, $event)"
                />
            </div>
            <div class="delete-column" v-bind:class="{'hide': reorder}" v-on:click="dropColumn(i)">Delete</div>
        </div>
        <div class="column last add-column" v-bind:class="{'hide': reorder}">
            <input type="button" value="Add Column" v-on:click="addColumn">
        </div>
        <div class="option-buttons">
            <input
                type="button"
                value="Cancel"
                class="cancel"
                v-on:click="$emit('cancel')"
            />
            <input
                type="button"
                value="Reorder Columns"
                v-bind:value="reorder ? 'Modify Columns' : 'Reorder Columns'"
                v-on:click="reorder = !reorder"
            />
            <input
                type="button"
                v-bind:value="showForeignKeyPanel ? 'Columns' : 'Foreign Keys'"
                v-on:click="showForeignKeyPanel = !showForeignKeyPanel"
            />
            <input
                type="submit"
                value="Modify"
                class="submit"
                v-bind:disabled="
                    JSON.stringify(originalColumnInformation) === JSON.stringify(modifiedColumnInformation) &&
                    JSON.stringify(originalTableInformation) === JSON.stringify(modifiedTableInformation)
                "
            />
        </div>
    </Form>
</template>

<script>
    import DB from "../../js/DB";
    import Form from "../containers/Form";
    import ContextMenu from "../containers/ContextMenu";

    export default {
        name: "ModifyTableForm",
        components: {ContextMenu, Form},
        props: {
            tableName: {
                type: String,
                required: true,
            }
        },
        data() {
            return {
                COLUMN_TYPES: {
                    INPUT_TYPES: {
                        TABLE_NAME:    0,
                        TABLE_COMMENT: 1,
                        NAME:          2,
                        DATA_TYPE:     3,
                        DEFAULT:       4,
                        COMMENT:       5,
                    },
                    CHECK_MARK_TYPES: {
                        NOT_NULL:       0,
                        AUTO_INCREMENT: 1,
                        PRIMARY_KEY:    2,
                        UNIQUE:         3,
                    }
                },

                reorder: false,
                showForeignKeyPanel: false,

                originalTableInformation: {},
                modifiedTableInformation: {},

                originalColumnInformation: [],
                modifiedColumnInformation: [],
                droppedColumnInformation:  [],
            }
        },
        methods: {
            /**
             * Called whenever a text input's value has been changed.
             *
             * @param {number} inputType - Type of input so it knows which column element to modify.
             * @param {number} columnIndex - Index of the column being modified.
             * @param {Event} event - Event instance.
             */
            textInputChange(inputType, columnIndex, event) {
                switch (inputType) {
                    case this.COLUMN_TYPES.INPUT_TYPES.TABLE_NAME:
                        this.modifiedTableInformation.name = event.target.value;
                        break;
                    case this.COLUMN_TYPES.INPUT_TYPES.TABLE_COMMENT:
                        this.modifiedTableInformation.comment = event.target.value;
                        break;
                    case this.COLUMN_TYPES.INPUT_TYPES.NAME:
                        this.modifiedColumnInformation[columnIndex].name = event.target.value;
                        break;
                    case this.COLUMN_TYPES.INPUT_TYPES.DATA_TYPE:
                        this.modifiedColumnInformation[columnIndex].type = event.target.value;
                        break;
                    case this.COLUMN_TYPES.INPUT_TYPES.DEFAULT:
                        this.modifiedColumnInformation[columnIndex].default = event.target.value;
                        break;
                    case this.COLUMN_TYPES.INPUT_TYPES.COMMENT:
                        this.modifiedColumnInformation[columnIndex].comment = event.target.value;
                        break;
                }
            },

            /**
             * Called whenever a check-mark's value has been changed.
             *
             * @param {number} checkMarkType - Type of input so it knows which column element to modify.
             * @param {number} columnIndex - Index of the column being modified.
             * @param {Event} event - Event instance.
             */
            checkMarkChange(checkMarkType, columnIndex, event) {
                switch (checkMarkType) {
                    case this.COLUMN_TYPES.CHECK_MARK_TYPES.NOT_NULL:
                        this.modifiedColumnInformation[columnIndex].not_null = event.target.checked;
                        break;
                    case this.COLUMN_TYPES.CHECK_MARK_TYPES.AUTO_INCREMENT:
                        this.modifiedColumnInformation[columnIndex].auto_increment = event.target.checked;
                        break;
                    case this.COLUMN_TYPES.CHECK_MARK_TYPES.PRIMARY_KEY:
                        this.modifiedColumnInformation[columnIndex].primary_key = event.target.checked;
                        break;
                    case this.COLUMN_TYPES.CHECK_MARK_TYPES.UNIQUE:
                        this.modifiedColumnInformation[columnIndex].unique = event.target.checked;
                        break;
                }
            },


            /**
             * Adds a new column.
             */
            addColumn() {
                this.modifiedColumnInformation.push({
                    name:           "",
                    type:           "",
                    default:        "",
                    not_null:       false,
                    auto_increment: false,
                    primary_key:    false,
                    unique:         false,
                    comment:        "",
                });
            },

            /**
             * Drops the clicked column from the table.
             *
             * @param {number} i - Index of column to drop.
             */
            dropColumn(i) {
                this.droppedColumnInformation.push(this.modifiedColumnInformation.splice(i, 1)[0])
            },

            /**
             * Moves the column's position in the table.
             *
             * @param {number} columnIndex - Position of the column the 'modifiedColumnInformation' array.
             * @param {boolean} moveUp - If true the column will move up a position, else it will move down a position.
             */
            moveColumn(columnIndex, moveUp) {
                this.modifiedColumnInformation.splice(
                    moveUp ? columnIndex - 1 : columnIndex + 1,
                    0,
                    this.modifiedColumnInformation.splice(columnIndex, 1)[0]
                );
            },

            /**
             * Generates all the SQL required to re-order columns.
             *
             * @returns {Array} - Returns the array of all the queries to execute.
             */
            generateColumnOrderSql() {
                let queries = [];

                // Create copy of original to help with reordering
                let originalColumnInformationCopy = this.originalColumnInformation.slice();

                // Loop over the original as it will be changed as the modified columns get visited
                for (let i in originalColumnInformationCopy) {
                    // If the column is different to the original it means it has changed position
                    if (originalColumnInformationCopy[i].name !== this.modifiedColumnInformation[i].name) {
                        // Create full column definition
                        let fullColumnDefinition = DB.generateFullColumnDefinitionSql(
                            this.modifiedColumnInformation[i].name,
                            this.modifiedColumnInformation[i].type,
                            this.modifiedColumnInformation[i].default,
                            this.modifiedColumnInformation[i].not_null,
                            this.modifiedColumnInformation[i].auto_increment,
                            this.modifiedColumnInformation[i].unique,
                            this.modifiedColumnInformation[i].comment,
                        );

                        // If the first has changed a different statement is required
                        if (parseInt(i) === 0)
                            queries.push(`ALTER TABLE ${this.tableName} MODIFY COLUMN ${fullColumnDefinition} FIRST`);
                        else if (parseInt(i) !== originalColumnInformationCopy.length - 1)
                            queries.push(`ALTER TABLE ${this.tableName} MODIFY COLUMN ${fullColumnDefinition} AFTER \`${originalColumnInformationCopy[parseInt(i)].name}\``);
                        else
                            break;

                        // Loop over the original and update the 'modifiedColumnInformation' column in the 'originalColumnInformationCopy to its new position
                        for (let j in originalColumnInformationCopy) {
                            if (originalColumnInformationCopy[j].name === this.modifiedColumnInformation[i].name) {
                                originalColumnInformationCopy.splice(j, 1);
                                originalColumnInformationCopy.splice(parseInt(i), 0, this.modifiedColumnInformation[i]);
                                break;
                            }
                        }
                    }
                }

                return queries;
            },

            /**
             * Generates all the SQL required to drop any columns that were removed.
             *
             * @returns {Array} - Returns the array of all the queries to execute.
             */
            generateDroppedColumnsSql() {
                let queries = [];

                // Loops over all the dropped tables and deletes them from the database
                for (let droppedColumn of this.droppedColumnInformation) {
                    queries.push(DB.generateDropColumnSql(this.tableName, droppedColumn.name));
                }

                return queries;
            },

            /**
             * Generates all the SQL required to update any columns that have been changed.
             *
             * @returns {Array} - Returns the array of all the queries to execute.
             */
            generateColumnChangeSql() {
                let queries = [];

                // Loop over each of the modified column as either adds it if it's new or modify a current column
                for (let i in this.modifiedColumnInformation) {
                    let originalColumn = this.originalColumnInformation[i];
                    let modifiedColumn = this.modifiedColumnInformation[i];

                    // New Columns
                    if (i >= this.originalColumnInformation.length) {
                        queries.push(
                            DB.generateNewColumnSql(
                                this.tableName,
                                ...Object.values(modifiedColumn)
                            )
                        )
                    } else if (
                        // If any column definitions have been changed the whole column will be updated
                        Object.keys(modifiedColumn).some((key) => modifiedColumn[key] !== originalColumn[key])
                    ) {
                        queries.push(
                            DB.generateUpdateColumnStatement(
                                this.tableName,
                                originalColumn.name,
                                originalColumn.primary_key,
                                ...Object.values(modifiedColumn)
                            )
                        )
                    }
                }

                return queries;
            },

            /**
             * Generates all the SQL required to change information about the table (table name, table comment).
             *
             * @returns {Array} - Returns the array of all the queries to execute.
             */
            generateTableChangeSql() {
                let queries = [];

                // Changes the table comment if it has changed
                if (this.modifiedTableInformation.comment !== this.originalTableInformation.comment) {
                    queries.push(
                        DB.generateChangeTableCommentSql(
                            this.tableName,
                            this.modifiedTableInformation.comment
                        )
                    )
                }

                // Rename table query done last so the changing table name doesn't effect the other queries
                if (this.modifiedTableInformation.name !== this.originalTableInformation.name) {
                    queries.push(
                        DB.generateRenameTableSql(
                            this.originalTableInformation.name,
                            this.modifiedTableInformation.name
                        )
                    )
                }

                return queries;
            },

            /**
             * Called when the form is submitted.
             * Executes all the pending queries.
             */
            submit() {
                // NOTE: Possibly just execute as making them (depends how output works)

                let queries = [
                    ...this.generateColumnChangeSql(),
                    ...this.generateDroppedColumnsSql(),
                    ...this.generateColumnOrderSql(),
                    ...this.generateTableChangeSql(),
                ];

                console.log(queries);
                return;

                // Loops over each query and executes it
                for (let query of queries) {
                    DB.query(query, (err, results) => {
                        if (err) return console.log(results);
                    });
                }

                // Emit submitted event and close the form
                this.$emit("submitted");
            }
        },
        watch: {
            /**
             * Updates the column information whenever the currentTable name is changed.
             */
            tableName() {
                this.reorder             = false;
                this.showForeignKeyPanel = false;

                this.originalTableInformation = {};
                this.modifiedTableInformation = {};

                this.originalColumnInformation = [];
                this.modifiedColumnInformation = [];
                this.droppedColumnInformation  = [];

                // As it starts off as an empty string we don't want to run the query otherwise it caused an error.
                if (this.tableName === "") return;

                DB.query(DB.generateTableStatusSql(this.tableName), (err, results) => {
                    if (err) return console.log(results);

                    let tableInformation = {
                        name:    results[0]["Name"],
                        comment: results[0]["Comment"],
                    };

                    this.originalTableInformation = Object.assign({}, tableInformation);
                    this.modifiedTableInformation = Object.assign({}, tableInformation);
                });

                DB.query(DB.generateShowTableColumnsSql(this.tableName, true), (err, results) => {
                    if (err) return console.log(results);

                    // Converts into readable format
                    for (let column of results) {
                        let newColumn = {
                            name:           column["Field"],
                            type:           column["Type"],
                            default:        column["Default"],
                            not_null:       column["Null"] === "NO",
                            auto_increment: column["Extra"] === "auto_increment",
                            primary_key:    column["Key"] === "PRI",
                            unique:         column["Key"] === "UNI",
                            comment:        column["Comment"],
                        };

                        this.originalColumnInformation.push(Object.assign({}, newColumn));
                        this.modifiedColumnInformation.push(Object.assign({}, newColumn));
                    }
                });
            }
        }
    }
</script>

<style scoped>
    input {
        padding-left: 10px;
    }

    #container {
        height: 100%;
    }

    #table-inputs {
        align-items: center;
        border-bottom: 2px solid #BBB;
        display: flex;
        height: 60px;
        justify-content: space-between;
        padding-bottom: 5px;
        width: 100%;
    }

    #table-inputs > div {
        display: flex;
        padding: 5px;
        width: calc(50% - 15px);
    }

    #table-inputs > div > input {
        width: 100%;
    }

    .column {
        height: fit-content;
        margin-bottom: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        position: relative;
        width: 100%;
    }

    .column.reorder {
        height: 50px;
        padding: 0;
    }

    .column:not(:last-child) {
        border-bottom: 1px solid #BBB;
        margin-bottom: 0;
    }

    .column .reorder-column {
        align-items: center;
        display: flex;
        height: 50px;
        justify-content: space-between;
        line-height: 50px;
        position: absolute;
        top: 0;
        visibility: hidden;
        width: 100%;
    }

    .column .reorder-column > span {
        padding-left: 10px;
    }

    .column .reorder-column > div {
        padding-right: 10px;
    }

    .column .reorder-column > div > i {
        border-radius: 50%;
        color: #555;
        float: right;
        font-size: 20px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        transition: .1s linear;
        transition-property: background-color, color;
        width: 40px;
    }


    .column .reorder-column i.disabled {
        color: #AAA  !important;
    }

    .column .reorder-column i:not([class~="disabled"]):first-of-type:hover {
        background: #D9D9D9;
        color: red;
    }

    .column .reorder-column i:not([class~="disabled"]):last-of-type:hover {
        background: #D9D9D9;
        color: green;
    }

    .column .reorder-column i:not([class~="disabled"]):active {
        background: #C1C1C1 !important;
    }

    .column .reorder-column.display {
        position: static;
        visibility: visible;
    }


    .column.add-column.hide, .top.hide, .bottom.hide {
        height: 0;
        visibility: hidden;
    }

    .column.last {
        border-bottom: none;
        padding-bottom: 0;
    }

    .column.add-column {
        text-align: center;
    }

    .column.add-column > input[type="button"] {
        width: 200px !important;
    }

    .column > div > * {
        float: left;
    }

    .column input:not(:last-child) {
        margin-right: 10px;
    }

    .column .top {
        margin-bottom: 10px;
        overflow: hidden;
        width: 100%;
    }

    .column .top input, .bottom input {
        width: calc((100% / 3) - 50px) !important;
    }

    .column .bottom {
        align-items: center;
        display: flex;
        overflow: hidden;
    }

    .column .bottom div {
        margin-left: 3px;
    }

    .column .delete-column {
        background: #FE8583;
        cursor: pointer;
        font-weight: bolder;
        height: 0;
        line-height: 40px;
        margin: 10px auto -10px auto;
        opacity: 0;
        transition: .3s linear;
        transition-property: height, opacity;
        text-align: center;
        width: 100%;
    }

    .column:hover .delete-column:not([class~="hide"]) {
        height: 40px;
        opacity: 1;
    }

    .column .delete-column:hover {
        background: #E96D6B;
    }

    .column .delete-column:active {
        background: #D16260;
    }

    .option-buttons {
        align-items: center;
        background: #F2F2F2;
        border-top: 1px solid #B2B2B2;
        bottom: -60px;
        display: flex;
        height: 60px;
        justify-content: space-around;
        left: 0;
        margin: auto;
        position: fixed;
        right: 0;
        white-space: nowrap;
        width: 100%;
    }

    .option-buttons > input {
        width: 180px !important;
    }
</style>
