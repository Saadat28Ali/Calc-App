// imports  --------------------------------------------------------------

const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");

// constant values -------------------------------------------------------

const WIDTH = 280;
const HEIGHT = 500;

// functions -------------------------------------------------------------

function createWindow(type) {

	// creates different kinds of browser windows

	if (type==="main") {
		main_win_obj = new BrowserWindow(
		{
			minWidth: WIDTH, 
			minHeight: HEIGHT,
			width: WIDTH, 
			height: HEIGHT, 
			resizable: true, 
			alwaysOnTop: false,
			frame: false, 
			x: 900, 
			y: 200, 
			maximizable: false, 
			fullscreenable: false, 
			icon: path.join(__dirname, "icon.ico"), 
			transparent: true,
			backgroundColor: "rgba(0, 0, 0, 0)", 
			webPreferences: {
				nodeIntegration: true, 
				preload: path.join(__dirname, "preload.js"), 
				devTools: false, 
			}
		}
		)

		main_win_obj.loadFile("index.html");
		main_win_obj.webContents.openDevTools();
		return main_win_obj;
	}
}

// main ------------------------------------------------------------------

app.whenReady().then(
	() => {
		ipcMain.on("msg", 
			(event, arg) => {
				if (arg == "quit") {
					app.quit();
				}
			}
		)
		createWindow("main");
	}
);
// console.log("main.js is working");
