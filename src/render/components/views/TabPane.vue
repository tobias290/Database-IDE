<template>
    <div id="container">
        <div id="tab-bar">
            <div v-bind:id="i" class="tab" v-for="(tab, i) in tabs" v-bind:class="{'active': tab.active || tabs.length === 1}" v-on:click="tabClick(i)">
                <!-- TODO: Create different context menus for table and editor -->
                <ContextMenu
                    v-bind:target="i.toString()"
                    v-bind:items="[
                        {title: 'Open in New Window', icon: 'fa-window-restore', disabled: true},
                        {type: 'separator'},
                        {title: 'Split Vertically', icon: 'fa-arrows-alt-v', disabled: true},
                        {title: 'Split Horizontally', icon: 'fa-arrows-alt-h', disabled: true},
                        {type: 'separator'},
                        {title: 'Close', icon: 'fa-times', click: () => closeTab(i)},
                        {title: 'Close Others', click: () => closeOtherTabs(i)},
                        {title: 'Close All', click: closeAllTabs}
                    ]"
                />
                <i class="fas" v-bind:class="{'fa-table': tab.type === 'table', 'fa-terminal': tab.type === 'editor'}"></i>
                <span>{{ tab.name }}</span>
                <i class="fas fa-times" v-on:click="closeTab(i)"></i>
            </div>

            <div id="new-console-btn" title="New Console" v-on:click="noOfConsoles++; addTab(`console ${noOfConsoles === 1 ? '' : noOfConsoles}`, 'editor')">
                <i class="fas fa-terminal"></i>
            </div>
        </div>

        <div v-if="tabs.length !== 0" class="content" v-for="(tab, i) in tabs" v-bind:class="{hide: currentTab.name !== tab.name, white: tabs.length !== 0}">
            <Table
                v-bind:id="'table_' + i"
                v-if="tab.type === 'table'"
                v-bind:table-name="tab.name"
                v-on:change-tab-name="changeTabNameFromIndex(i, $event)"
                v-on:add-tab="addTab"
            />

            <Editor
                v-else-if="tab.type === 'editor'"
                v-bind:content-file-path="tab.hasOwnProperty('filePath') ? tab.filePath : ''"
                v-bind:content="tab.hasOwnProperty('content') ? tab.content : ''"
                v-on:change-tab-name="changeTabNameFromIndex(i, $event)"
                v-on:add-tab="addEditorTabWithContent"
                v-on:modification-output="$emit('modification-output', $event)"
                v-on:table-output="$emit('table-output', $event)"
            />

            <div v-else class="empty-view-text">Error Opening Tab</div>
        </div>

        <div v-if="tabs.length === 0" class="content">
            <div class="empty-view-text">No Tabs Open</div>
        </div>
    </div>
</template>

<script>
    import Table from "./Table";
    import Editor from "./Editor";
    import ContextMenu from "../containers/ContextMenu";
    import Output from "../../js/Output";

    export default {
        name: "TabPane",
        components: {ContextMenu, Editor, Table},
        data() {
            return {
                tabs: [],
                currentTab: {},
                noOfConsoles: 0,
            }
        },
        methods: {
            /**
             * Opens the tab when clicked.
             *
             * @param {number} i - Index of the clicked tab in the 'tabs' array.
             */
            tabClick(i) {
                for (let j in this.tabs) {
                    if (i === parseInt(j)) {
                        this.tabs[j].active = true;
                        this.currentTab = this.tabs[j];
                    } else {
                        this.tabs[j].active = false;
                    }
                }
            },

            /**
             * Adds a new tab.
             *
             * @param {string} tabName - Name of the tab.
             * @param {string} type - Type of the tab (Either 'currentTable' or 'editor').
             */
            addTab(tabName, type) {
                // Stops the same currentTable opening twice
                if (type === "table")
                    for (let i in this.tabs)
                        if (this.tabs[i].name === tabName && (this.tabs[i].type === "table"))
                            return this.tabClick(parseInt(i));

                this.tabs.push({
                   name: tabName,
                   type: type,
                   active: true,
                });

                this.tabClick(this.tabs.length - 1);
            },

            /**
             * Creates a new tab with pre-set content. Called by an editor when it opens a file in a new tab.
             *
             * @param {string} tabName - Name of the new tab.
             * @param {string} filePath - Path to the file contents.
             * @param {string} contents - Contents of the new tab.
             */
            addEditorTabWithContent(tabName, filePath, contents) {
                this.tabs.push({
                    name: tabName,
                    type: "editor",
                    filePath: filePath,
                    content: contents,
                    active: true,
                });

                this.tabClick(this.tabs.length - 1);
            },

            /**
             * Removes a tab from the list.
             *
             * @param {number} i - Index of the clicked tab in the 'tabs' array.
             */
            closeTab(i) {
                // Remove and get the deleted tab
                let deleted = this.tabs.splice(i, 1);

                // If there are no tabs reset the console counter
                if (this.tabs.length === 0)
                    this.noOfConsoles = 0;

                // If the deletes tab is the same as the first tab then all the tabs are gone
                // Therefore delete the current tab
                if (deleted[0].name === this.tabs[0].name) {
                    this.currentTab = {};
                } else {
                    // FIXME: Doesn't work for some reason
                    this.tabClick(this.tabs.length - 1);
                }
            },

            /**
             * Closes all the tabs.
             */
            closeAllTabs() {
                this.tabs = [];
            },

            /**
             * Closes all the tabs apart from the given tab.
             *
             * @param {number} i - Index of tab to keep open.
             */
            closeOtherTabs(i) {
                let tabToKeep = this.tabs[i];

                this.tabs = [tabToKeep];

                this.tabClick(this.tabs.length - 1);
            },

            /**
             * Changed the name of specific tab.
             *
             * @param {number} i - Index of the tab.
             * @param {string} newName - New name for the tab.
             */
            changeTabNameFromIndex(i, newName) {
                this.tabs[i].name = newName;
            },

            /**
             * Changed the name of specific tab.
             *
             * @param {string} oldName - Old name of the tab.
             * @param {string} newName - New name for the tab.
             */
            changeTabNameFromName(oldName, newName) {
                // for (let i in this.tabs) {
                //     if (this.tabs[i].name === oldName) {
                //         this.tabs[i].name = newName;
                //
                //         if (this.currentTab.name === oldName)
                //             this.currentTab = this.tabs[i]
                //     }
                // }
            },

            /**
             * Reloads a certain tab.
             */
            refreshTabs(i) {
                // for (let i in this.tabs) {
                //     if (this.tabs[i].type === "currentTable") {
                //         this.$refs[this.tabs[i].name].refresh();
                //     }
                // }
            },
        }
    }
</script>

<style scoped>
    #tab-bar {
        background: #C1C1C1;
        height: 40px;
        overflow: auto;
        width: 100%;
    }

    .content {
        background: #F2F2F2;
        height: calc(100% - 40px);
        position: relative;
        overflow: auto;
        width: 100%;
    }

    .content.white {
        background: white;
    }

    .hide {
        visibility: hidden;
        position: absolute;
    }

    .tab {
        background: #D9D9D9;
        border-right: 1px solid #B2B2B2;
        box-sizing: padding-box;
        cursor: default;
        display: inline-block;
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        min-width: 100px;
        padding: 5px;
        text-align: center;
        user-select: none;
        width: fit-content;
    }

    .tab > span {
        padding: 0 5px 0 5px;
    }

    .tab > i:first-of-type {
        color: #717171;
        float: left;
        font-size: 12px;
    }

    .tab > i:last-of-type {
        color: #8E8E8E;
        float: right;
        font-size: 12px;
    }

    .tab > i:last-of-type:hover {
        color: #717171;
    }


    .tab.active {
        /*border-top: 3px solid white*/
        background: #F2F2F2;
    }

    #new-console-btn {
        float: right;
        height: 40px;
        line-height: 40px;
        text-align: center;
        width: 40px;
    }

    #new-console-btn:hover {
        background: #D9D9D9;
    }

    #content > div {
        height: 100%;
        width: 100%;
        position: absolute;
    }
</style>
