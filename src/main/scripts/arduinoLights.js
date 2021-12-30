/*------------------- Do not change -------------------*/
export default {//Why not module.exports????? Doenst work here for some reason but everywhere else...
	addDevice,
	removeDevice,
	getDevices,
	surveyData,
    commands,
	definitions
}

const parent = require.main.exports.parentGlue //For adressing the parent Scripts Functions

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

let currentPage

/*------------------- Do not change the above -------------------*/
import SerialPort from 'serialport';
import { Board } from "johnny-five";

const lightPin = 3 //In our setup pin 3 is for turning the light on or off

const definitions = {
	"scriptName": "Custom Arduino Light Controller",//The Name of this script as shown in the config page
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
 * Gets all registered devices and returns them to the main program
 */
function getDevices() {
	output("config", devices)
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
				devices.splice(i)
				output("console", "Removed Device successfully")
				getDevices()
				return //Ends the function because were finished. Its only possible to remove one device at a time
			}
		}
		throw "Device not found"
	} catch (error) {
		output("console", error)
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
			"device": new Board({ port: parameters.port }),
			"lightStatus": 0
		})

		devices[devicePosition-1].on("ready", function () {
			output("console", "Connection to "+ name +" at "+ parameters + " was established")
			output("config", {}) //TBD
            devices[devicePosition-1].device.pinMode(2, devices[devicePosition-1].device.MODES.OUTPUT);
            devices[devicePosition-1].device.pinMode(3, devices[devicePosition-1].device.MODES.OUTPUT);
            setTimeout(function(){ devices[devicePosition-1].device.digitalWrite(2, 1) }, 1000); 
            setTimeout(function(){ devices[devicePosition-1].device.digitalWrite(2, 0) }, 2000); 
            setTimeout(function(){ devices[devicePosition-1].device.digitalWrite(3, 1) }, 1000); 
            setTimeout(function(){ devices[devicePosition-1].device.digitalWrite(3, 0) }, 2000); 
		})

		devices[devicePosition-1].device.on('error', function (err) {
			throw err
		})
        devices[devicePosition-1].device.on('close', function (err) {
			throw err
		})
        devices[devicePosition-1].device.on('exit', function (err) {
			throw err
		})
	} catch (error) {
		output("console", error)
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
	parent.connector(type, arg)
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
		output("console", error)
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
		output("console", error)
	}
}