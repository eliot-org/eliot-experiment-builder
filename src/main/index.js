import { app, ipcMain, globalShortcut} from 'electron'
const electron = require("electron")
const windowManager = require("electron-window-manager")
//const serialPort = require('serialport');
//global.SerialPort = serialPort;
var electronScreen
var displays
var externalDisplay 
var paused = false
var five = require("johnny-five")
var board
var connected = false
var waage
var waageConnected = false
var trigger
var triggerConnected = false
//var serialport = require('serialport');
//var SerialPort = serialport.SerialPort;
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

var net = require("net")
var client
var robotConnected = false
//-------------------------------------------------------------

//Logic for robot
ipcMain.on("robotCommands", (event,arg) => {
  try{
    if(Object.prototype.hasOwnProperty.call(arg,"command") && Object.prototype.hasOwnProperty.call(arg,"data")){
      if(arg.command == "connect"){
        if(Object.prototype.hasOwnProperty.call(arg.data,"port") && Object.prototype.hasOwnProperty.call(arg.data,"ip")){
          client = new net.Socket()
          client.connect(arg.data.port, arg.data.ip, () => {
            console.log("Connected Robot")
            robotConnected = true
            if(surveyWindow.object != null){
              surveyWindow.object.webContents.send("robotConnected", robotConnected)
            }
            adminWindow.object.webContents.send("robotConnected", robotConnected)
          })

          client.on("data", (data) => {//Sende die Nachrichten des Roboters an alle Fenster die registriert sind
            if(surveyWindow.object != null){
              surveyWindow.object.webContents.send("robotConsole", data.toString())
            }
            adminWindow.object.webContents.send("robotConsole", data.toString())
            console.log(data.toString())
          })

          client.on("end", () => {
            client.write("quit"  + "\n")
            robotConnected = false
            console.log("Disconnected Robot")
            if(surveyWindow.object != null){
              surveyWindow.object.webContents.send("robotConnected", robotConnected)
            }
            adminWindow.object.webContents.send("robotConnected", robotConnected)
          })
        }
      }else if(arg.command == "load"){
        if(robotConnected){
          client.write("load "+ arg.data + "\n")
        }
      }else if(arg.command == "running" || arg.command == "play" || arg.command == "stop" || arg.command == "pause"|| arg.command == "programState"){
        if(robotConnected){
          client.write(arg.command + "\n")
        }
      }else if(arg.command == "quit"){
        if(robotConnected){
          client.write(arg.command + "\n")
          client.end()
        }
      }else if(arg.command == "status"){//Geht nur an den fragenden zurück da Survey und Adminsurvey hier asynchron sein können
        if(surveyWindow.object != null){
          surveyWindow.object.webContents.send("robotConnected", robotConnected)
        }
        adminWindow.object.webContents.send("robotConnected", robotConnected)
      }else if(arg.command == "adress"){//Gibt adresse und Port zurück
        if(surveyWindow.object != null){
          surveyWindow.object.webContents.send("robotAddress", client.address())
        }
        adminWindow.object.webContents.send("robotAddress", client.address())
      }
    }
  }catch(e){
    if(surveyWindow.object != null){
      surveyWindow.object.webContents.send("robotConsole", e.toString())
    }
    adminWindow.object.webContents.send("robotConsole", e.toString())
    console.log(e)
  }
})

//logic for trigger
ipcMain.on("connectTrigger", (event,arg) => {
  console.log(triggerConnected)
  if(triggerConnected == false){
    try{
      trigger = new SerialPort(arg, {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      trigger.on("open", function () {
        triggerConnected = true
        console.log('open trigger');
        adminWindow.object.webContents.send("triggerConsole", "Connected")
        //Initialer Status
        let buffer = Buffer.from([0]);
        console.log(buffer)
        trigger.write(buffer, e => console.log(e))
      });    

      trigger.on('error', function(err) {
        triggerConnected = false
        console.log('Error: ', err.message)
        adminWindow.object.webContents.send("triggerConsole", "Error")
      })
    }catch(e){
      triggerConnected = false
      console.log(e)
    }
  }
})

//trigger the trigger, arg has to be number
ipcMain.on("trigger", (event, arg) => {
  console.log("received message trigger")
  if(triggerConnected == true){      
    try{
      let buffer = Buffer.from([arg])
      console.log(buffer)

      event.sender.send("triggerConsole", "Triggering")
      console.log("Triggering")

      trigger.write(buffer, e => console.log(e))

      buffer = Buffer.from([0])
      setTimeout(function(){trigger.write(buffer, e => console.log(e))}.bind(this), 10); 
    }catch(e){
      console.log(e)
    }
  }else{
    adminWindow.object.webContents.send("triggerConsole", "Not Connected")
  }
})

//logic for waage
ipcMain.on("connectWaage", (event,arg) => {
  console.log(waageConnected)
  if(waageConnected == false){
    try{
      const parser = new Readline();
      waage = new SerialPort(arg, {
        baudRate: 9600,
      });
      waage.pipe(parser)

      waage.on("open", function () {
        waageConnected = true
        adminWindow.object.webContents.send("waageConsole", "Connected")
        console.log('open Waage');
      });    
      
      parser.on('data', function (data) {
        adminWindow.object.webContents.send("waageConsole", data)
        if(surveyWindow.object != null){
          surveyWindow.object.webContents.send("waageConsole", data)
        }
      });

      waage.on('error', function(err) {
        waageConnected = false
        console.log('Error: ', err.message)
        adminWindow.object.webContents.send("waageConsole", "Error")
      })
    }catch(e){
      waageConnected = false
      console.log(e)
    }
  }
})

//logic for arduino/lights
ipcMain.on("connectArduino", (event,arg) => {
  if(connected == false){
    try{
      /*var Readable = require("stream").Readable;  
      var util = require("util");  
      util.inherits(MyStream, Readable);  
      function MyStream(opt) {  
        Readable.call(this, opt);
      }
      MyStream.prototype._read = function() {};  
      // hook in our stream
      process.__defineGetter__("stdin", function() {  
        if (process.__stdin) return process.__stdin;
        process.__stdin = new MyStream();
        return process.__stdin;
      });*/
      board = new five.Board({ port: arg, repl:false })
  
      board.on("ready", () => {
        connected = true
        console.log("Board ready")
        try{
          event.sender.send("arduinoConsole", "Board ready")
        }catch(e){
          console.log(e)
        }
        try{
          board.pinMode(2, board.MODES.OUTPUT);
          board.pinMode(3, board.MODES.OUTPUT);
        }catch(e){
          console.log(e)
        }
        try{
          setTimeout(function(){ board.digitalWrite(2, 1) }, 1000); 
          setTimeout(function(){ board.digitalWrite(2, 0) }, 2000); 
          setTimeout(function(){ board.digitalWrite(3, 1) }, 1000); 
          setTimeout(function(){ board.digitalWrite(3, 0) }, 2000); 
        }catch(e){
          console.log(e)
        }
      });
      
      board.on("error", function(err) {
        connected = false         
        console.log(err)            
        try{
          event.sender.send("arduinoConsole", err)
        }catch(e){
          console.log(e)
        }
      });
      
      board.on("close", function(err) {
        connected = false         
        console.log(err)            
        try{
          event.sender.send("arduinoConsole", err)
        }catch(e){
          console.log(e)
        }
      });
      
      board.on("exit", function(err) {
        connected = false         
        console.log(err)            
        try{
          event.sender.send("arduinoConsole", err)
        }catch(e){
          console.log(e)
        }
      });
    }catch(e){
        console.log(e)
    }
  }
})

//set a pin on arduino
ipcMain.on("setPin", (event,arg) => {
  console.log("received message")
  if(connected == true){      
    try{
      event.sender.send("arduinoConsole", "Writing Pin")
      console.log("Writing Pin")
      board.digitalWrite(arg.pin, arg.state)
    }catch(e){
      console.log(e)
    }
  }else{
    adminWindow.object.webContents.send("arduinoConsole", "Not Connected")
  }
})


//logic for which page a window should load
ipcMain.on("loader", (event,arg) => {
  console.log("received message")
  if(arg == "ready"){
    if(event.sender.id == 1){
      event.sender.send("surveyOps", "goToLogin")
    }
    if(event.sender.id != 1){
      event.sender.send("surveyOps", "goToSurvey")
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

//
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
    if(typeof client === "Socket" && robotConnected){
      client.write("quit\n")
      client.end()
    }
    app.quit()
  })
}

app.on('ready', () =>{
  /*THIS IS INSECURE: PLEASE REMOVE WHEN WEBSITE HAS REAL SSL CERTIFICATE!!!!!!*/
  //app.commandLine.appendSwitch('ignore-certificate-errors');

  /*************************************************** */

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
    if(typeof client == "Socket" && robotConnected){
      client.write("quit\n")
      client.end()
    }
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
