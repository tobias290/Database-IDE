<template>
    <div v-if="error" class="empty-view-text">Error Getting Tables</div>
    <div v-else-if="tables.length === 0" class="empty-view-text">No Tables</div>

    <div id="tables" v-else>
        <div id="title">Tables</div>
        <div id="tables-icon-bar" class="icon-bar">
            <div>
                <i
                    class="fas fa-sync-alt"
                    title="Refresh"
                    v-on:click="refresh"
                ></i>
                <i
                    v-bind:class="{ 'fas fa-chevron-circle-down': expand, 'fas fa-chevron-circle-up': !expand}"
                    v-bind:title="expand ? 'Retract All' : 'Expand All'"
                    v-on:click="expandAll"
                ></i>
                <i
                    class="fas fa-plus"
                    title="New Table"
                ></i>
            </div>
        </div>

        <!-- Table list item for each table in the database -->
        <TableListItem
            v-for="(table, i) in tables"
            :key="table"
            v-bind:item-id="'table_' + i"
            v-bind:table="table"
            v-bind:expand-all="expand"
            v-on:display-table="$emit('display-table', $event)"
            v-on:refresh="refresh"
            v-on:show-rename-table-popup="renameTablePopupTable = $event; $refs.renameTablePopup.toggle(true)"
            v-on:show-modify-table-popup="modifyTablePopupTable = $event; $refs.modifyTablePopup.toggle(true)"
        />

        <!-- Popup to rename table -->
        <Popup ref="renameTablePopup">
            <span slot="title">Rename</span>
            <RenameTableForm
                slot="content"
                v-bind:original-table-name="renameTablePopupTable"
                v-on:cancel="$refs.renameTablePopup.toggle(false); renameTablePopupTable = ''"
                v-on:submitted="$refs.renameTablePopup.toggle(false); refresh(); $emit('change-table-tab-name', $event)"
            /> <!-- TODO/NOTE: Refreshed table list but currently doesn't update for an open tab -->
        </Popup>

        <!-- Popup to modify a certain table -->
        <Popup ref="modifyTablePopup">
            <span slot="title">Modify <strong>{{ modifyTablePopupTable }}</strong></span>
            <ModifyTableForm
                slot="content"
                v-bind:table-name="modifyTablePopupTable"
                v-on:cancel="$refs.modifyTablePopup.toggle(false); modifyTablePopupTable = ''"
                v-on:submitted="$refs.modifyTablePopup.toggle(false); refresh()"
            />
        </Popup>
    </div>
</template>

<script>
    import TableListItem from "./TableListItem";
    import Popup from "../containers/Popup";
    import RenameTableForm from "../forms/RenameTableForm";

    import DB from "../../js/DB";
    import ModifyTableForm from "../forms/ModifyTableForm";

    /**
     * Displays the list of tables in the database.
     */
    export default {
        name: "TableList",
        components: {ModifyTableForm, TableListItem, Popup, RenameTableForm},
        /**
         * Called before the component is mounted.
         */
        beforeMount() {
            DB.query("SHOW TABLES", (err, results) => {
                if (err) {
                    this.error = true;
                    return console.log(results);
                }

                // Converts the JSON object to an array with the table names
                results.map((datum) => this.tables.push(datum[Object.keys(datum)[0]]));
            });
        },
        data() {
            return {
                error: false,
                tables: [],
                expand: false,

                renameTablePopupTable: "",
                modifyTablePopupTable: "",
            }
        },
        methods: {
            /**
             * Expands all the list items.
             */
            expandAll() {
                this.expand = !this.expand;
            },

            /**
             * Refresh the tables.
             */
            refresh() {
                this.tables = [];

                DB.query("SHOW TABLES", (err, results) => {
                    if (err) {
                        this.error = true;
                        return console.log(results);
                    }

                    // Converts the JSON object to an array with the table names
                    results.map((datum) => this.tables.push(datum[Object.keys(datum)[0]]));

                    this.$emit('refresh-open-tab-tables');
                });
            },
        }
    }
</script>

<style scoped>
    #tables {
        background: #F2F2F2;
        height: 100%;
        max-height: 850px;
        width: 200px;
    }

    #title {
        font-size: 16px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        text-decoration: underline;
        width: 100%;
    }

    #tables-icon-bar {
        border-top: 1px solid transparent; /* Aligns bottom border with tab pane's tab bar bottom border */
        border-bottom: 1px solid #B2B2B2;
        margin: auto 2px auto 2px;
        overflow: auto;
        white-space: nowrap;
    }

    #tables-icon-bar > div {
        margin: auto;
        width: fit-content;
    }

    #refresh, #expand-all {
        background: #D9D9D9;
        border: none;
        font-size: 14px;
        height: 30px;
        width: 100%;
    }

    #expand-all {
        border-top: 1px solid #B1B1B1;
    }

    #refresh:hover, #expand-all:hover {
        background: #C1C1C1;
    }
</style>
