/*------------------- Do not change -------------------*/
let parentfunc
let devices = []
/*
	Example Device: 
	{
		"name": "UR3",
		"parameters": {"ip":"192.168.1.12", "port":"29999"},
		"device": object,
		"lightStatus": 0 //For off, 1 for on
	}
*/

// eslint-disable-next-line no-unused-vars
let currentPage

/*------------------- Do not change the above -------------------*/
// eslint-disable-next-line no-unused-vars
const SerialPort = require('serialport')
const Board = require("johnny-five").Board

const lightPin = 3 //In our setup pin 3 is for turning the light on or off

const definitions = {
	"scriptName": "Custom Arduino Light Controller",//The Name of this script as shown in the config page
    "description": "",//Description of this script, what it does, what it can do, what it needs. Shown in Hardware Page
	"deviceParameters":[//Every Device, by default, already has the name property. Here you add every other property you need. See Example Device above
		{"name": "port", "type": "string"}
//Maybe at a later date add another property called "needed", boolean. If true than that property has to be set/present when creating a device, otherwise not.
	],
	"events":["console", "config"], //What events a device can send to the program. Device Console; Information for config Page; the device has been triggered
	"commands": [//What Commands can the program give a device and what do they do
		{
			"description": "",
			"name": "on",
			"properties":[]
		},
		{
			"description": "",
			"name": "off",
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
				devices.splice(i, 1)
				output("console", {"text": "Removed Device successfully", "sender": definitions.scriptName})
				output("config", {"type": "removeDevice", "name": name, "sender": definitions.scriptName})
				return //Ends the function because were finished. Its only possible to remove one device at a time
			}
		}
		throw "Device not found"
	} catch (error) {
		output("console",  {"text": error, "sender": definitions.scriptName})
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
			throw "Deviceparameters not followed. This Device needs a port!"
		}
		if(typeof parameters.port == "number"){
			parameters.port = parameters.port.toString()
		}
		if(typeof parameters.port != "string"){
			throw "Deviceparamter port is not a string"
		}

		let devicePosition = devices.push({
			"name": name,
			"parameters": parameters,
			"device": new Board({ port: parameters.port, repl: false }),
			"lightStatus": 0
		})

		devices[devicePosition-1].device.on("ready", function () {
			output("console", {"text": "Connection to "+ devices[devicePosition-1].name +" at "+ JSON.stringify(devices[devicePosition-1].parameters) + " was established", "sender": definitions.scriptName})
			output("config", {"type": "addDevice", "name": devices[devicePosition-1].name, "sender": definitions.scriptName}) 
            devices[devicePosition-1].device.pinMode(2, devices[devicePosition-1].device.MODES.OUTPUT);
            devices[devicePosition-1].device.pinMode(3, devices[devicePosition-1].device.MODES.OUTPUT);
            setTimeout(() => devices[devicePosition-1].device.digitalWrite(2, 1), 1000); 
            setTimeout(() => devices[devicePosition-1].device.digitalWrite(2, 0), 2000); 
            setTimeout(() => devices[devicePosition-1].device.digitalWrite(3, 1), 1000); 
            setTimeout(() => devices[devicePosition-1].device.digitalWrite(3, 0), 2000); 
		})

		devices[devicePosition-1].device.on('error', function (err) {
			throw err
		})
        devices[devicePosition-1].device.on('exit', function (err) {
            removeDevice(devices[devicePosition-1].name)
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
    parentfunc.connector(type,arg) //Parent Files Function 
}

/**
 * Executes a command on a device
 * @param {string} deviceName The device thats 
 * @param {*} command The exact definition is specified in the defintions variable
 */
function commands(deviceName, command){
	try {
		for(let i = 0; i < devices.length; i++) {
			if(devices[i].name == deviceName){
				if(command.name == "on"){
					if(devices[i].lightStatus == 0){
						devices[i].lightStatus = 1
						setPin(devices[i], lightPin, 1)
						setTimeout(function(){setPin(devices[i], lightPin, 0)}, 1000)
						return
					}else{
						throw "Light already on"
					}
				}else if(command.name == "off"){
					if(devices[i].lightStatus == 1){
						devices[i].lightStatus = 0
						setPin(devices[i], lightPin, 0)
						setTimeout(function(){setPin(devices[i], lightPin, 0)}, 1000)
						return
					}else{
						throw "Light already off"
					}
				}else{
					throw "Command not found"
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
 * Calls the digitalWrite function of the Arduino and sets a pin to the desired state
 * @param {object} device The Array(devices) Object of the device, passed by reference
 * @param {number} pin Which pin on the arduino should be set
 * @param {boolean} state To which state the pin should be set
 */
function setPin(device, pin, state) { 
	try {	
		device.device.digitalWrite(pin, state)
	} catch (error) {
		output("console", {"text": error, "sender": definitions.scriptName})
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