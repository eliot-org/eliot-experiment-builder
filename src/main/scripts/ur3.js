/*------------------- Do not change -------------------*/
let parentfunc
let devices = []
/*
	Example Device: 
	{
		"name": "UR3",
		"parameters": {"ip":"192.168.1.12", "port":"29999"},
		"device": object,		
		 * Describes if there is an object or not
		 * 0: No Object presented
		 * 1: Object present/Waiting for removal
		 * 2: Currently removing Object
		 * 3: No Object presented but waiting for bringing another one
		 * 4: Currently bringing Object
		"objectTransportStage": 0,
		//Describes the currently present object. null if none present
		"currentObjectData": null,
		"waitingForLoad": false,
		"waitingForPlay": false,
		"currentCommand": "",
		"playingTimeout": null,
		"loadTimeout": null,

	}
*/
let currentPage

/*------------------- Do not change the above -------------------*/
const net = require("net")

const definitions = {
	"scriptName": "UR3",//The Name of this script as shown in the config page
	"deviceParameters":[//Every Device, by default, already has the name property. Here you add every other property you need. See Example Device above
		{"name": "ip", "type": "string"},
		{"name": "port", "type": "number"}
//Maybe at a later date add another property called "needed", boolean. If true than that property has to be set/present when creating a device, otherwise not.
	],
	"events":["console", "config", "finished"], //What events a device can send to the program. Device Console; Information for config Page; finished the called program/command
	"commands": [//What Commands can the program give a device and what do they do
		{
			"description": "Gets the next object. Automatically removes the previous, currently used, object.",
			"name": "get",
			"properties":[]
		},
		{
			"description": "Removes the current object.",
			"name": "remove",
			"properties":[]
		}
	]
}

/**
 * Called when loaded. Saves the "address" of the main Process so that we can call its functions for output, events...
 * @param {*} func The Connector Function defined by the main Process
 */
 function constr(func){
    parentfunc = func
}

/**
 * Gets all registered devices and returns them to the main program
 */
function getDevices() {
    output("config", {"type": "allDevices", "devices": devices, "sender": definitions.scriptName})
}

/**
 * Removes a Device
 * @param {string} name 
 */
function removeDevice(name) {
	try {
		if(typeof name == "number"){
			name = name.toString()
		}
		if(typeof name != "string"){
			throw "Devicename has to be a string"
		}
		for(let i = 0; i < devices.length; i++) {
			if(devices[i].name == name){
				devices[i].device.write("quit\n")
				devices.splice(i, 1)
                output("console", {"text": "Removed Device successfully", "sender": definitions.scriptName})
				output("config", {"type": "removeDevice", "name": name, "sender": definitions.scriptName})
				return //Ends the function because were finished. Its only possible to remove one device at a time
			}
		}
		throw "Device not found"
	} catch (error) {
        output("console", {"text": error, "sender": definitions.scriptName})
	}
}

/**
 * Adds a new Device/Establishes connection to it
 * @param {string} name 
 * @param {*} parameters //In our case it has to conform to the definition.deviceParameters
 */
function addDevice(name, parameters) {
	try {		
		if(typeof name == "number"){
			name = name.toString()
		}
		if(typeof name != "string"){
			throw "Devicename is not a string"
		}
		if(!Object.prototype.hasOwnProperty.call(parameters, "port")){
			throw "Device parameters not followed. This Device needs a port!"
		}
		if(typeof parameters.port == "string"){
			parameters.port = parseInt(parameters.port)
		}
		if(typeof parameters.port != "number"){
			throw "Deviceparamter port is not a number"
		}
		if(!Object.prototype.hasOwnProperty.call(parameters, "ip")){
			throw "Device parameters not followed. This Device needs an IP Adress!"
		}
		if(typeof parameters.ip != "string"){
			throw "Deviceparamter ip is not a string"
		}

		let devicePosition = devices.push({
			"name": name,
			"parameters": parameters,
			"device": new net.Socket(),
			"objectTransportStage": 0,
			"currentObjectData": null,
			"waitingForLoad": false,
			"waitingForPlay": false,
			"currentCommand": "",
			"playingTimeout": null,
			"loadTimeout": null
		})

        devices[devicePosition-1].device.connect(parameters.port, parameters.ip, () => {
			output("console", "Connection to "+ name +" at "+ parameters + " was established")
			output("config", {"type": "addDevice", "name": name, "sender": definitions.scriptName}) 
        })

        devices[devicePosition-1].device.on("data", (data) => {
            robotConsole(devices[devicePosition-1] ,data.toString())
            output("console", data.toString())
        })

		devices[devicePosition-1].device.on('error', function (err) {
			throw err
		})
	} catch (error) {
        output("console", {"text": error, "sender": definitions.scriptName})
	}
}

/**
 * To save where we are in the survey
 * @param {*} arg 
 */
function surveyData(arg){
    currentPage = arg
}

/**
 * Sends data, error messages or events/commands to the main process
 * @param {"console"|"event"|"config"} type 
 * @param {*} arg 
 */
function output(type, arg) {
	parentfunc.connector(type, arg) //Parent Files Function 
}


/**
 * Executes a command on a device
 * @param {string} deviceName The device thats 
 * @param {*} command The exact definition is specified in the defintions variable
 */
function commands(deviceName, command){
	try {
		if(typeof deviceName == "number"){
			deviceName = deviceName.toString()
		}
		if(typeof deviceName != "string"){
			throw "Devicename has to be a string"
		}
		for(let i = 0; i < devices.length; i++) {
			if(devices[i].name == deviceName){
				if(devices[i].currentCommand == ""){
					if(command.name == "get"){
						devices[i].currentCommand = "get"
						getObject(devices[i])//js passes by reference, so this works
						return
					}else if(command.name == "remove"){
						devices[i].currentCommand = "remove"
						removeObject(devices[i])
						return
					}else{
						throw "Command not found"
					}
				}else{
					throw "Script busy"
				}
			}
		}
		throw "Device not found"
	} catch (error) {
        output("console", {"text": error, "sender": definitions.scriptName})
	}
}

//------ Above: Standard Functions, Necessary by Program Definition. Below: Custom Functions needed for Script funcionality

/**
 * Reads the Output of a Robot. Calls the next Transport Stage after the right output
 * @param {*} device Which device is outputting
 * @param {*} data The data output
 */
function robotConsole(device, data){
	if(device.waitingForLoad && data.includes("Loading program: /programs/")){
		device.waitingForLoad = false
		clearTimeout(device.loadTimeout)
		robotPlayCommand(device)
	}else if(data.includes("STOPPED") && device.waitingForPlay){
		device.waitingForPlay = false
		clearTimeout(device.playingTimeout)
		if(device.objectTransportStage == 2){ //Object has now been removed
			if(device.currentCommand == "get"){
				device.objectTransportStage = 3
				getObject(device)
			}else if(device.currentCommand == "remove"){
				device.objectTransportStage = 0
				device.currentCommand = ""
				device.currentObjectData = ""
				output("event", {"device": device.name, "event":"finished"})
			}
		}else if(device.objectTransportStage == 4){//Object has now been brought
			device.objectTransportStage = 1
			device.currentCommand = ""
			device.currentObjectData = currentPage.nextMaterial
			output("event", {"device": device.name, "event":"finished"})
		}
	}
}

/**
 * Recursively instructs a robot to send its status. Necessery because a robot doesnt say anything when finished playing a program, we have to check.
 * @param {*} device The Robot to check
 */
function robotProgramStateCommandRecursion(device){
	device.device.write("programState\n")
	if(device.waitingForPlay){
		setTimeout(robotProgramStateCommandRecursion(device), 500)
	}
}

/**
 * Instructs a robot to play a loaded program. Also starts the recursion.
 * @param {*} device The robot to instruct
 */
function robotPlayCommand(device){
	clearTimeout(device.playingTimeout)
	device.waitingForPlay = true
	device.device.write("play\n")
	setTimeout(robotProgramStateCommandRecursion(device), 1000)
	device.playingTimeout = setTimeout(function(){
		if(device.waitingForPlay == true){
			device.waitingForPlay = false
            output("console", {"text": "Some Robot Communication failed. Please check the Robot.", "sender": definitions.scriptName})
		}
	},35000)
}

/**
 * All the main logic for getting an object, and maybe removing a previous one
 * @param {*} device The robot to instruct
 */
function getObject(device){
	try {
        if(!Object.prototype.hasOwnProperty.call(currentPage, "nextObject")){
			throw "No Objectdata present!"
		}
		//Check if we have to first remove an object before bringing a new one
		if(device.objectTransportStage == 1){
			device.objectTransportStage = 2
			device.device.write("load /programs/" + device.currentObjectData.roboPos + "_back.urp\n")
		}else if(device.objectTransportStage == 0 || device.objectTransportStage == 3){
			device.objectTransportStage = 4
			device.device.write("load /programs/" + currentPage.nextObject.roboPos + "present.urp\n")
		}else{
			device.objectTransportStage = 0
			throw "Internal Logic Error. This should never happen! Indicates a bug in your Hardware Script."
		}
		device.waitingForLoad = true
		device.load = setTimeout(function(){
			if(device.waitingForLoad == true){
				device.waitingForLoad = false
				throw "Some Robot Communication failed. Please check the Robot."
			}
		},35000)
	} catch (error) {
        output("console", {"text": error, "sender": definitions.scriptName})
		device.currentCommand = ""
		output("event",  {"device": device.name,"event":"finished"})
	}	
}

/**
 * All the logic for removing an Object
 * @param {*} device The robot to instruct
 */
function removeObject(device){
	try {
		if(device.objectTransportStage == 1){
			device.objectTransportStage = 2
			device.device.write("load /programs/" + device.currentObjectData.roboPos + "_back.urp\n")
			device.waitingForLoad = true
			device.load = setTimeout(function(){
				if(device.waitingForLoad == true){
					device.waitingForLoad = false
					throw "Some Robot Communication failed. Please check the Robot."
				}
			},35000)
		}else{
			throw "No Object present"
		}
	} catch (error) {
        output("console", {"text": error, "sender": definitions.scriptName})
		device.currentCommand = ""
		output("event",  {"device": device.name,"event":"finished"})
	}
}

module.exports = {
    constr,
	addDevice,
	removeDevice,
	getDevices,
	surveyData,
	commands,
	definitions
}