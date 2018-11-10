/**
 * Mediator class to access methods to open dialogs on the main process.
 */
export default class DialogHandler {
    /**
     * @private
     *
     * @type {*} - Connection to the dialog module on the main process.
     */
    static dialog = window.require("electron").remote.require("./dialog");

    /**
     * @public
     *
     * Opens a file dialog.
     *
     * @param callback - Called when a file is opened. (Params -> err, filePath, contents)
     */
    static open(callback) {
        DialogHandler.dialog.open(callback);
    }

    /**
     * @public
     *
     * Opens a save dialog to allow the given contents to be saved to file.
     *
     * @param {string} contents - Contents to save.
     * @param callback - Called when the contents save been saved. (Params -> fileName)
     */
    static save(contents, callback) {
        DialogHandler.dialog.save(contents, callback);
    }

    /**
     * @public
     *
     * Saves the given contents to the given file path.
     *
     * @param {string} filePath - Location of the file where the contents should be saved.
     * @param contents - Contents to save at the given file path.
     */
    static saveAutomatically(filePath, contents) {
        DialogHandler.dialog.saveAutomatically(filePath, contents);
    }

    /**
     * @public
     *
     * Opens a specific file path in the OS native file explorer.
     *
     * @param {string} filePath - Path to open in file exporter
     */
    static showItemInFolder(filePath) {
        window.require('electron').remote.shell.showItemInFolder(filePath);
    }
}
