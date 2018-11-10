<template>
    <div v-bind:id="itemId" class="table-list-item" ref="item" v-on:dblclick="$emit('display-table', table)">
        <ContextMenu
            v-bind:target="itemId"
            v-bind:items="[
                {title: 'View Table', icon: 'fa-table', click: () => $emit('display-table', table)},
                {type:  'separator'},
                {title: 'Rename Table', icon: 'fa-edit', click: renameTable},
                {title: 'Modify Table', icon: 'fa-edit', click: modifyTable},
                {type:  'separator'},
                {title: 'Drop Table', icon: 'fa-trash', click: dropTable},
                {title: 'Truncate Table', icon: 'fa-eraser', click: truncateTable},
            ]"
        />
        <div id="table-name">
            <span id="left">
                {{ table }}
            </span>
            <span id="right">
                <i class="icon fas fa-angle-left" v-bind:class="{'fa-angle-left': isUp, 'fa-angle-down': !isUp}" v-on:click="itemClick"></i>
            </span>
        </div>
        <div id="column-info">
            <div v-for="datum in columnInformation" v-html="getColumnData(datum)"></div>
        </div>
    </div>
</template>

<script>
    import DB from "../../js/DB";
    import ContextMenu from "../containers/ContextMenu";

    /**
     * Display a single currentTable is the database as an item in the currentTable list.
     *
     * @see TableList
     */
    export default {
        name: "TableListItem",
        components: {ContextMenu},
        props: {
            itemId: {
                type: String,
                required: true,
            },
            table: {
                type: String,
                required: true,
            },
            expandAll: {
                type: Boolean,
                required: true,
            },
        },
        beforeMount() {
            DB.query(`SHOW COLUMNS FROM ${this.table}`, (err, results) => {
                if (err) {
                    return console.log(results);
                }
                this.columnInformation = results;
            });
        },
        data() {
            return {
                isUp: true,
                columnInformation: [],
                height: 50,
            }
        },
        methods: {
            /**
             * Expands a list item when it is clicked on to display it's columns.
             */
            itemClick() {
                if (this.isUp) {
                    this.$refs.item.style.height = (this.columnInformation.length * 30) + 50 + "px";
                    this.isUp = false;
                } else {
                    this.$refs.item.style.height = "50px";
                    this.isUp = true;
                }
            },
            /**
             * Gets the information required for a specific column.
             *
             * @param {object} column - Specific column's object
             * @returns {string} - Returns the information required.
             */
            getColumnData(column) {
                return `<strong>${column["Field"]}</strong> (${column["Type"]})`
            },

            /**
             * Opens a window so a new name can be given to the currentTable.
             */
            renameTable() {
                this.$emit('show-rename-table-popup', this.table)
            },

            /**
             * Opens a window to modify columns and currentTable properties.
             */
            modifyTable() {
                this.$emit('show-modify-table-popup', this.table)
            },

            /**
             * Drops/deletes the currentTable.
             */
            dropTable() {
                DB.query(`DROP TABLE ${this.table}`, (err, results) => {
                    if (err) return console.log(results);

                    this.$emit("refresh");
                });
            },

            /**
             * Truncates the currentTable. (Removes all rows).
             */
            truncateTable() {
                DB.query(`TRUNCATE TABLE ${this.table}`, (err, results) => {
                    if (err) return console.log(results);
                });
            }
        },
        watch: {
            /**
             * Watcher waiting to be called by the parent component to expand the item.
             */
            expandAll() {
                this.itemClick();
            }
        }
    }
</script>

<style scoped>
    .icon {
        color: #8E8E8E;
    }

    .table-list-item {
        background: #F2F2F2;
        box-sizing: border-box;
        height: 50px;
        line-height: 50px;
        margin: auto;
        overflow: hidden;
        padding: 0 10px 0 15px;
        transition: height .5s linear;
        width: 100%;
    }

    .table-list-item:hover {
        background: white;
    }

    #table-name {
        height: 50px;
    }

    #left {
        cursor: default;
        float: left;
        line-height: 50px;
        height: 50px;
        -webkit-user-select: none;
        width: 50%;
    }

    #right {
        float: right;
        line-height: 50px;
        height: 50px;
        width: 50%;
        text-align: right;
    }

    #column-info {
        font-size: 12px;
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        white-space: nowrap;
    }
</style>
