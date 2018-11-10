/**
 * Opens a file dialog.
 *
 * @param callback - Called when a file is opened. (Params -> err, filePath, contents)
 */
exports.open = (callback) => {
    let fs = require("fs");

    require("electron").dialog.showOpenDialog({
            title: "Open",
            filters: [
                {name: "SQL", extensions: ["sql"]},
            ],
            properties: ["openFile", "createDirectory"]
        },
        (fileNames) => {
            if (fileNames === undefined) return;

            let filePath = fileNames[0];

            fs.readFile(filePath, "utf8", function (err, contents) {
                if (err) return console.log(err);

                callback(err, filePath, contents);
            });
        });
};

/**
 * Opens a save dialog to allow the given contents to be saved to file.
 *
 * @param {string} contents - Contents to save.
 * @param callback - Called when the contents save been saved. (Params -> fileName)
 */
exports.save = (contents, callback) => {
    require("electron").dialog.showSaveDialog({
            title: "Save",
            filters: [
                {name: "SQL", extensions: ["sql"]},
            ],
            properties: ["openFile", "createDirectory"]
        },
        (fileName) => {
            if (fileName === undefined) return;

            let fs = require('fs');

            fs.writeFile(fileName, contents, function (err) {
                if (err) return console.log(err);

                callback(fileName);
            });
        });
};

/**
 * Saves the given contents to the given file path.
 *
 * @param {string} filePath - Location of the file where the contents should be saved.
 * @param contents - Contents to save at the given file path.
 */
exports.saveAutomatically = (filePath, contents) => {
    let fs = require('fs');

    fs.writeFile(filePath, contents, function (err) {
        if (err) return console.log(err);
    });
};
