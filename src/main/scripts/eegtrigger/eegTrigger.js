/*------------------- Do not change -------------------*/
let parentfunc
let devices = []
/*
	Example Device: 
	{
		"name": "UR3",
		"parameters": {"ip":"192.168.1.12", "port":"29999"},
		"device": object
	}
*/
// eslint-disable-next-line no-unused-vars
let currentPage

/*------------------- Do not change the above -------------------*/
const SerialPort = require('serialport')

const definitions = {
	"scriptName": "Brainproducts Triggerbox",//The Name of this script as shown in the config page
    "description": "",//Description of this script, what it does, what it can do, what it needs. Shown in Hardware Page
	"deviceParameters":[//Every Device, by default, already has the name property. Here you add every other property you need. See Example Device above
		{"name": "port", "type": "string"}
//Maybe at a later date add another property called "needed", boolean. If true than that property has to be set/present when creating a device, otherwise not.
	],
	"events":["console", "config"], //What events a device can send to the program. Device Console; Information for config Page
	"commands": [//What Commands can the program give a device and what do they do. Example: "command": {"name":"trigger", "bit": 1}
		{
			"description": "The only command for this Devicetype. Its the bit that will be written. Can be any number between 0 and 255.",
			"name": "trigger",
			"properties":[
				{
					"name": "bit",
					"type": "number"
				}
			]
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
                devices[i].device.close()
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
			"device": new SerialPort(parameters.port, {
				baudRate: 9600,
				dataBits: 8,
				stopBits: 1,
				parity: "none",
			})
		})

		devices[devicePosition-1].device.on("open", function () {
			output("console", "Connection to "+ name +" at "+ parameters + " was established")
			output("config", {"type": "addDevice", "name": name, "sender": definitions.scriptName}) 
			devices[devicePosition].device.write(Buffer.from([0]), e => console.log(e))
		})

		devices[devicePosition-1].device.on('error', function (err) {
			throw err
		})
        devices[devicePosition-1].device.on('exit', function (err) {
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
		if(!Object.prototype.hasOwnProperty.call(command, "bit")){
			throw "Command Parameter bit has to be set"
		}
		if (typeof command.bit == "string"){
			command.bit = parseInt(command.bit)
		}	
		if(typeof command.bit == "number"){
			if(command.bit <= 0 || command.bit >= 255){
				throw "Command is not in range. It's either smaller than 0 or larger than 255."
			}
		}else{
			throw "Command is not a number"
		}
		for(let i = 0; i < devices.length; i++) {
			if(devices[i].name == deviceName){
				if(command.name == "trigger"){
					trigger(devices[i], command.bit)//js passes by reference, so this works
					return
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
 * Validates if bit is really a bit (Number between 0 and 255). Then finds the Device with the deviceName and triggers it on the specified bit
 * @param {string} device
 * @param {number} bit 
 */
function trigger(device, bit) { 
	try {	
		device.device.write(Buffer.from([bit]), e => console.log(e))
		setTimeout(function () { device.device.write(Buffer.from([0]), e => console.log(e)) }.bind(this), 10)
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