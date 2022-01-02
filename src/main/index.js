import { app, ipcMain, globalShortcut} from 'electron'
const electron = require("electron")
const windowManager = require("electron-window-manager")
let electronScreen
let displays
let externalDisplay 
let paused = false


/*------------------ Import all HW Scripts ------------------*/
//Still missing: Read Directory from config
let devices = []
const hwScripts = {}
var hwScriptsDefinitions = []

let parentGlue = {
    /**
     * 
     * @param {*} type 
     * @param {*} arg 
     */
    connector: function (type, arg) {
        if (type == "console") {
            adminWindow.object.webContents.send("hardware", { "type": "console", "arg": arg })
        } else if (type == "config") {
            if (arg.type == "addDevice") {
                devices.push({ "name": arg.name, "script": arg.sender })
                adminWindow.object.webContents.send("hardware", { "type": "returnDevices", "devices": devices })
            } else if (arg.type == "removeDevice") {
                for (let i = 0; i < devices.length; i++) {
                    if (devices[i].name == arg.name) {
                        devices.splice(i, 1)
                    }
                }
                adminWindow.object.webContents.send("hardware", { "type": "returnDevices", "devices": devices })
            } else if (arg.type == "allDevices") {
                let tmp = []
                for (let i = 0; i < devices.length; i++) {//Delete every device thats from the calling script
                    if (devices[i].script != arg.sender) {
                        tmp.push(devices[i])
                    }
                }
                tmp.concat(arg.devices)//Then add the new list
                devices = tmp
            }
        } else if (type == "event") {
            surveyWindow.object.webContents.send("hardware", { "type": "event", "arg": arg})
        }
    }
}

/**
 * 
 * @param {*} r 
 */
function importAll(r) {
    r.keys().forEach((key) => (hwScripts[key] = r(key)));
    for (var key of Object.keys(hwScripts)) {
        hwScripts[key].constr(parentGlue)
    }
} 

importAll(require.context('./scripts/', true, /\.js$/))

for (var key of Object.keys(hwScripts)) {
    hwScriptsDefinitions.push(hwScripts[key].definitions)
}

/**
 * 
 */
ipcMain.on("hardware", (event,arg) => {
    switch (arg.type) {
        case "getScripts"://To: Adminpage, From: Adminpage
            adminWindow.object.webContents.send("hardware", {"type": "returnScripts", "scripts": hwScriptsDefinitions})
            break
        case "createDevice": //To: HW Scripts, From: Adminpage
            for (let key of Object.keys(hwScripts)) {
                if(hwScripts[key].definitions.scriptName == arg.scriptName){
                    hwScripts[key].addDevice(arg.deviceName, arg.parameters)
                    break
                }
            }
            break
        case "getDevices": //To: AdminPage, From: Adminpage
            adminWindow.object.webContents.send("hardware", {"type": "returnDevices", "devices": devices})
            break
        case "removeDevice": //To: HW Scripts, From: Adminpage
            for (let key of Object.keys(hwScripts)) {
                if(hwScripts[key].definitions.scriptName == arg.scriptName){
                    hwScripts[key].removeDevice(arg.deviceName)
                    break
                }
            }
            break
        case "sendSurveyData": //To: HW Scripts, From: Surveypage
            for (let key of Object.keys(hwScripts)) {
                hwScripts[key].surveyData(arg.arg)
            }
            break
        case "command"://To: HW Scripts, From: Surveypage
            for (let key of Object.keys(hwScripts)) {
                hwScripts[key].command(arg.device, arg.command)
            }
            break
    }
})

/*-----------------------------------------------------------*/

//logic for which page a window should load
ipcMain.on("WindowManagement", (event,arg) => {
  if(arg == "ready"){
    if(event.sender.id == 1){
      event.sender.send("WindowManagement", "AdminPage")
    }
    if(event.sender.id != 1){
      event.sender.send("WindowManagement", "SurveyPage")
    }
  }
})

//Comm for manual channels
ipcMain.on("surveyChannel", (event,arg) => {
  console.log("received message")
  if(event.sender.id != 1){
    adminWindow.object.webContents.send("surveyChannel", arg)
  }
  if(event.sender.id == 1){
    surveyWindow.object.webContents.send("surveyChannel", arg)
  }
})

ipcMain.on("displays", (event,arg) => {
  console.log("received displays message")
  if(arg.arg == "getDisplays"){
    event.sender.send("displays",{"displays":displays})
    console.log("sent displays")
  }else if(arg.arg == "setExternalDisplay"){
    externalDisplay = arg.externalDisplay
    event.sender.send("displays",{"externalDisplay":externalDisplay})
    console.log("sent externaldisplay")
  }
})

//Survey+Answer data handler for communication between windows
ipcMain.on("surveyOps", (event,arg) =>{ //All things that could happen to the survey. Will be sent by AdminWindow
  if(arg == "start"){//Start the Survey
    console.log("Opening Survey")
    surveyWindow.open()
    surveyWindow.object.setBounds({ x: (externalDisplay.bounds.x + 50), y: (externalDisplay.bounds.y + 50), width: 800, height: 600})
    surveyWindow.object.maximize()
    surveyWindow.object.setFullScreen(true) 

    surveyWindow.object.on('closed', () => {//Adds Listener so that if the Survey is closed, the AdminWindow will know
     // event.sender.send("surveyOps", "aborted")
      //paused = false
      console.log("Survey closed")
    })
    event.sender.send("surveyOps", "opened")

  }else if(arg == "getSurveyData"){
    adminWindow.object.webContents.send("surveyOps", "getSurveyData")

  }else if(arg.arg == "sendSurveyData"){
    surveyWindow.object.webContents.send("surveyOps", {"arg": "sendSurveyData","survey": arg.survey, "port":arg.port})
  }else if(arg.arg == "sendAnswers"){
    adminWindow.object.webContents.send("surveyOps", {"arg": "sendAnswers","answers": arg.answers})
  }else if(arg == "readyToEnd"){
    adminWindow.object.webContents.send("surveyOps", "readyToEnd")
  }else if(arg == "Beenden"){
    surveyWindow.object.webContents.send("surveyOps", arg)
  }else if(arg == "ended"){
    if(surveyWindow.object != null){
      surveyWindow.close()
    }
    paused = false
    adminWindow.object.webContents.send("surveyOps", "ended")
  }else if(arg == "abort"){//Abort the Survey
    if(surveyWindow.object != null){
      surveyWindow.close()
    }
    paused = false
    event.sender.send("surveyOps", "aborted")

  }else if((arg == "pause") || ( arg == "unpause")){//Pause org unpause the survey
    if(arg == "pause"){
      paused = true
    }else if(arg == "unpause"){
      paused = false
    }
    surveyWindow.object.webContents.send("surveyOps", arg)
    event.sender.send("surveyOps", arg)
  }
})
//-------------------------------------------------------------

let mainWindow
const adminURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/loading`
  : `file://${__dirname}/index.html`
const surveyURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/loading`
  : `file://${__dirname}/index.html`

windowManager.init()
windowManager.templates.set("admin",{
  "height": 768,
  "useContentSize": true,
  "width": 1366,
  "icon": (__dirname + "/../renderer/assets/eliot.png"),
  "resizable": true,
  'menu': null,
})

windowManager.templates.set("survey",{
  "x":0,
  "y":0,
  "height": 1000,
  "useContentSize": true,
  "width": 1500,
  "icon": (__dirname + "/../renderer/assets/eliot.png"),
  "resizable": true,
  "menu": null,
})

var adminWindow = windowManager.createNew("adminWindow", "ELIOT", adminURL, "admin", {
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
    }
},false)
var surveyWindow = windowManager.createNew("surveyWindow", "Survey", surveyURL, "survey", {
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
    }
},false)

function createWindow () {
  adminWindow.open()
  adminWindow.object.maximize()

  globalShortcut.register("CmdOrCtrl+P", function(){
    if(surveyWindow.object != null){
      if(paused==true){
        surveyWindow.object.webContents.send("surveyOps", "unpause")
        adminWindow.object.webContents.send("surveyOps", "unpause")
        paused = false
      }else if(paused == false){
        surveyWindow.object.webContents.send("surveyOps", "pause")
        adminWindow.object.webContents.send("surveyOps", "pause")
        paused = true
      }
    }
  })
  globalShortcut.register("CmdOrCtrl+B", function(){
    if(surveyWindow.object != null){
      adminWindow.object.webContents.send("surveyOps", "confirmManualStep")
    }
  })

  adminWindow.object.on('closed', () => {
    adminWindow = null
    app.quit()
  })
}

app.on('ready', () =>{
  //Gets all Screens and gets the first non main screen as the external display
  electronScreen = electron.screen
  displays = electronScreen.getAllDisplays()
  externalDisplay = null;
  for (var i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      externalDisplay = displays[i]
      break
    }
  }
  if(externalDisplay == null){
    externalDisplay = displays[0]
  }
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
