/**
 * Calls methods from the clipboard module of electron.
 */
export default class Clipboard {
    /**
     * @public
     *
     * Clipboard class from electron.
     *
     * @type {Electron.Clipboard}
     */
    static clipboard = window.require("electron").clipboard;

    /**
     * @public
     *
     * Writes text to the clipboard.
     *
     * @param {string} text - Text to write to clipboard.
     */
    static writeText(text) {
        Clipboard.clipboard.writeText(text);
    }

    /**
     * @public
     *
     * @return {string} - Returns the text in the clipboard.
     */
    static readText() {
        return Clipboard.clipboard.readText();
    }
}
