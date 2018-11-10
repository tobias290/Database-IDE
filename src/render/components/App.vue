<template>
    <div id="app">
        <TableList
            id="table-list-panel"
            v-on:display-table="$refs.tabPane.addTab($event, 'table')"
            v-on:refresh-open-tab-tables="$refs.tabPane.refreshTabs()"
            v-on:change-table-tab-name="$refs.tabPane.changeTabNameFromName($event)"
        />
        <Separator v-bind:direction="'horizontal'" v-bind:panels="['tables', 'right-panel']" v-bind:panel-min-size="0" />
        <div id="right-panel">
            <TabPane
                v-on:modification-output="$refs.output.modificationOutput($event.sql, $event.executionTime, $event.affectedRows)"
                v-on:table-output="$refs.output.tableOutput($event.sql, $event.executionTime, $event.results)"
                id="tab-pane"
                ref="tabPane"
            />
            <Separator v-bind:direction="'vertical'" v-bind:panels="['tab-pane', 'output-panel']" />
            <Output id="output-panel" ref="output" />
        </div>
    </div>
</template>

<script>
    import Output from "./views/Output";
    import Separator from "./Separator";
    import TableList from "./views/TableList";
    import TabPane from "./views/TabPane";
    /**
     * Base component.
     */
    export default {
        name: 'App',
        components: {
            Output,
            Separator,
            TableList,
            TabPane,
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Raleway');

    html, body, #app {
        background: #F2F2F2;
        font-family: 'Raleway', sans-serif;
        height: 100%;
        margin: 0;
        overflow: hidden;
        padding: 0;
        width: 100%;
    }

    button:focus, input:focus, select:focus {
        outline: none;
    }

    table {
        border-collapse: collapse;
        cursor: default;
        font-size: 12px;
        height: fit-content;
    }

    /* Ignore the first column as it will be styled differently */
    th:not(:first-child), td:not(:first-child) {
        border: 1px solid #B2B2B2;
    }

    /* No border on left so it aligns better  */
    th:first-child, td:first-child {
        border-top: 1px solid #B2B2B2;
        border-right: 1px solid #B2B2B2;
        border-bottom: 1px solid #B2B2B2;
    }

    th > i {
        float: right;
    }

    th, td:first-child {
        background: #F2F2F2;
    }

    th, td {
        height: 20px;
        min-width: 120px;
        max-width: 200px;
        overflow: hidden;
        padding: 5px;
        text-overflow: ellipsis;
        user-select: none;
        white-space: nowrap;
        width: 120px;
    }

    tr:hover {
        background: #F2F2F2;
    }

    td:not(:first-child):hover {
        background: #D9D9D9;
    }

    td:not(:first-child).active {
        background: #C1C1C1;
    }

    ::-webkit-scrollbar {
        background: transparent;
        height: 10px;
        width: 10px;
    }

    ::-webkit-scrollbar-thumb {
        background: #9D9D9D;
        border-radius: 10px;
        border: 2px solid #F2F2F2;
    }

    ::-webkit-scrollbar-thumb:hover{
         background: #848484;
    }

    #app {
        border-top: 1px solid #B2B2B2;
        display: flex;
    }

    #top-bar {
        background: red;
        height: 30px;
        width: 100%;
    }

    #table-list-panel {
        height: 100%;
        width: 200px;
        overflow-y: auto;
        border-right: 1px solid #B2B2B2;
    }

    #right-panel {
        height: 100%;
        width: calc(100% - 200px);
    }

    #right-panel > ::-webkit-scrollbar {
        background: white;
    }

    #right-panel > #tab-pane {
        background: white;
        height: 70%;
        width: 100%;
        position: relative;
    }

    #right-panel > #output-panel {
        background: #F2F2F2;
        height: 30%;
        width: 100%;
    }

    /* The code editor will take up 100% of its container */
    .CodeMirror {
        height: 100%;
        font-family: monospace, Monospaced !important;
        font-size: 14px;
    }

    .icon-bar {
        background: #F2F2F2;
        width: 100%;
        height: 30px;
        user-select: none;
        display: block;
    }

    .icon-bar i {
        color: #8E8E8E;
        font-size: 18px;
        height: 30px;
        line-height: 30px;
        width: 30px;
        padding: 5px;
    }

    .icon-bar i:not([class~="disabled"]):hover {
        background: #D9D9D9;
    }

    .icon-bar .disabled {
        color: #C3C3C3;
    }

    .icon-bar .active {
        color: #5CB85C;
    }

    .icon-bar .active-background {
        background: #D9D9D9 !important;
    }

    .empty-view-text {
        bottom: 0;
        cursor: default;
        font-size: 30px;
        height: fit-content;
        left: 0;
        margin: auto;
        position: absolute;
        right: 0;
        text-align: center;
        top: 0;
        user-select: none;
        width: fit-content;
    }
</style>
