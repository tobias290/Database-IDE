<template>
    <div id="main-container">
        <div class="icon-bar">
            <!--<i class="fas fa-file" title="New"></i>-->
            <i
                class="fas fa-save"
                title="Save (Ctrl+S)"
                v-bind:class="{disabled: !canSave}"
                v-on:click="canSave ? save() : null"
            ></i>
            <i
                class="fas fa-folder-open"
                title="Open (Ctrl+O)"
                v-on:click="open(false)"></i>
            <i
                class="fas fa-external-link-alt"
                title="Open in New Window (Ctrl+Shift+O)"
                v-on:click="open(true)"
            ></i>
            <i
                class="fas fa-play"
                title="Execute (Ctrl+Enter)"
                v-bind:class="{active: canExecute, disabled: !canExecute}"
                v-on:click="canExecute ? execute() : null"
            ></i>
            <i
                class="fas fa-undo"
                title="Undo (Ctrl+Z)"
                v-on:click="$refs.editor.codemirror.doc.undo()"
            ></i>
            <i
                class="fas fa-redo"
                title="Redo (Ctrl+Shift+Z)"
                v-on:click="$refs.editor.codemirror.doc.redo()"
            ></i>
        </div>
        <div id="editor-container" v-on:click="updateIsSelectedText" v-on:contextmenu="updateIsSelectedText">
            <ContextMenu
                v-bind:target="'editor-container'"
                v-bind:items="[
                    {title: 'Cut', icon: 'fa-cut', click: cut, disabled: !isSelectedText},
                    {title: 'Copy', icon: 'fa-copy', click: copy, disabled: !isSelectedText},
                    {title: 'Paste', icon: 'fa-paste', click: paste},
                    {title: 'Delete', icon: 'fa-trash', click: deleteText, disabled: !isSelectedText},
                    {type: 'separator'},
                    {title: 'Select All', icon: 'fa-mouse-pointer', click: () => $refs.editor.codemirror.execCommand('selectAll')},
                    {type: 'separator'},
                    {title: 'Execute', icon: 'fa-play active', click: execute, disabled: !canExecute},
                    {type: 'separator'},
                    {title: 'Open in Explorer', icon: 'fa-folder', click: () => showItemInFolder(currentFilePath), disabled: currentFilePath === ''},
                ]"
            />
            <TextEditor v-bind:options="options" id="editor" ref="editor" />
        </div>
    </div>
</template>

<script>
    import ContextMenu from "../containers/ContextMenu";

    import DialogHandler from "../../js/DialogHandler";
    import Clipboard from "../../js/Clipboard";

    import { codemirror as TextEditor } from 'vue-codemirror'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/mode/sql/sql.js'
    import 'codemirror/theme/neat.css'
    import DB from "../../js/DB";
    import Output from "../../js/Output";

    export default {
        name: "Editor",
        components: {
            TextEditor,
            ContextMenu
        },
        props: {
            content: {
                type: String,
                required: false,
            },
            contentFilePath: {
                type: String,
                required: false,
            },
        },
        data() {
            return {
                options: {
                    autofocus: true,
                    extraKeys: {"Ctrl-Space": "autocomplete"},
                    indentWithTabs: true,
                    line: true,
                    lineNumbers: true,
                    matchBrackets : true,
                    mode: "text/x-mysql",
                    smartIndent: true,
                    tabSize: 4,
                    theme: "neat",
                },

                canSave: false,
                isSelectedText: false,
                canExecute: false,

                currentFilePath: "",
                lastSavedContents: "",
            }
        },
        beforeMount() {
            // Sets the current file path if the editor was created from a file
            this.currentFilePath = this.contentFilePath;
        },
        mounted() {
            // Sets the content if any was given during creation
            if (this.content !== "")
                this.$refs.editor.codemirror.doc.setValue(this.content);

            // Called whenever a change is made, check to see if the content is empty. If so disable execution button
            this.$refs.editor.codemirror.on("change", (codeMirror) => {
                this.canExecute = codeMirror.doc.getValue() !== "";
                this.canSave = codeMirror.doc.getValue() !== this.lastSavedContents;
            });

            // Add key maps (Cut, Copy, Paste, Select All automatically added)

            this.$refs.editor.codemirror.addKeyMap({
                "Ctrl-S": this.save
            });

            this.$refs.editor.codemirror.addKeyMap({
                "Ctrl-O": () => this.open(false)
            });

            this.$refs.editor.codemirror.addKeyMap({
                "Ctrl-Shift-O": () => this.open(true)
            });

            this.$refs.editor.codemirror.addKeyMap({
                "Ctrl-Enter": () => this.execute
            });
        },
        methods: {
            /**
             * Updates whether text can be copies or cut whenever a click event is registers within the editor.
             */
            updateIsSelectedText() {
                this.isSelectedText = this.$refs.editor.codemirror.doc.getSelection() !== "";
            },

            /**
             * Cuts the selected text.
             */
            cut() {
                Clipboard.writeText(this.$refs.editor.codemirror.doc.getSelection());
                this.deleteText();
            },

            /**
             * Copies the selected text.
             */
            copy() {
                Clipboard.writeText(this.$refs.editor.codemirror.doc.getSelection());
            },

            /**
             * Pastes the copied text.
             */
            paste() {
                this.$refs.editor.codemirror.doc.replaceSelection(Clipboard.readText());
            },

            /**
             * Deletes the selected text.
             */
            deleteText() {
                this.$refs.editor.codemirror.doc.replaceSelection("");
            },

            /**
             * Opens a specific file path in the OS native file explorer.
             */
            showItemInFolder() {
                DialogHandler.showItemInFolder(this.currentFilePath);
            },

            /**
             * Saves the current content
             */
            save() {
                // If a file is open automatically update it, otherwise open a save dialog
                if (this.contentFilePath !== "") {
                    DialogHandler.saveAutomatically(this.contentFilePath, this.lastSavedContents);

                    // Update last saved contents
                    this.lastSavedContents = this.$refs.editor.codemirror.doc.getValue();
                } else {
                    DialogHandler.save(this.lastSavedContents, (filePath) => {
                        // Update last saved contents
                        this.lastSavedContents = this.$refs.editor.codemirror.doc.getValue();

                        // Set the new content file path to the new file created
                        this.contentFilePath = filePath;

                        // Update the tab name to the new file
                        this.$emit("change-tab-name", filePath.split("\\")[filePath.split("\\").length - 1]);
                    });
                }

                // As no changed were made to the editor we must disable saving manually until a new change was made
                this.canSave = false;
            },

            /**
             * Opens a file and sets its contents editor
             *
             * @param {boolean} newWindow - If true it will opens the files contents in a new tab.
             */
            open(newWindow) {
                DialogHandler.open((err, filePath, contents) => {
                    if (err) return console.log(err);

                    if(newWindow) {
                        this.$emit("add-tab", filePath.split("\\")[filePath.split("\\").length - 1], filePath, contents);
                    } else {
                        // Set current file path
                        this.currentFilePath = filePath;

                        // Set the contents
                        this.$refs.editor.codemirror.doc.setValue(contents);

                        // Update last saved content and stop saving until changed are made
                        this.lastSavedContents = this.$refs.editor.codemirror.doc.getValue();

                        // As no changed were made to the editor we must disable saving manually until a new change was made
                        this.canSave = false;

                        // Change the tab name
                        this.$emit("change-tab-name", filePath.split("\\")[filePath.split("\\").length - 1]);
                    }
                })
            },

            /**
             * Executes the code within the editor.
             */
            execute() {
               let query = this.$refs.editor.codemirror.doc.getValue();

               DB.query(query, (err, results, executionTime) => {
                   if (err) return console.log(results);

                   console.log(results);

                   // If   - Type is object therefore it was query that modified the table is some way
                   // Else - It returned an array of results which will be outputted as a table
                   if (!Array.isArray(results)) {
                       this.$emit("modification-output", {sql: query, executionTime: executionTime, affectedRows: results.affectedRows});
                   } else {
                       this.$emit("table-output", {sql: query, executionTime: executionTime, results: results});
                   }
               })
            },
        }
    }
</script>

<style scoped>
    #main-container {
        width: 100%;
        height: 100%;
        overflow: auto;
    }

    #editor  {
        width: 100%;
        height: 100%;
    }

    #editor-container {
        height: calc(100% - 35px);
    }

    #editor-container > * {
        font-family: monospace !important;
    }

    .icon-bar {
        padding-top: 1px;
        border-bottom: 1px solid #B2B2B2;
    }
</style>
