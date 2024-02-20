const {ipcRenderer, ipcMain, contextBridge} = require("electron");

// console.log("HEY");

function quitter() {
	ipcRenderer.send("msg", "quit");
}

contextBridge.exposeInMainWorld("quit", quitter);