const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            // nodeIntegration: false,
            // preload: "./preload.js"
            // Add preload to access wanted methods; Check -> https://electronjs.org/docs/tutorial/security
        }
    });

    mainWindow.loadURL('http://localhost:8081');
    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', () => {
    createWindow();
    require("./db").dbConnect();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null)
        createWindow();
});
