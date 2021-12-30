/*------------------- Do not change -------------------*/
module.exports = {
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
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline

const definitions = {
	"scriptName": "Custom Arduino Scale Controller",//The Name of this script as shown in the config page
	"deviceParameters":[//Every Device, by default, already has the name property. Here you add every other property you need. See Example Device above
		{"name": "port", "type": "string"}
//Maybe at a later date add another property called "needed", boolean. If true than that property has to be set/present when creating a device, otherwise not.
	],
	"events":["console", "config", "trigger"], //What events a device can send to the program. Device Console; Information for config Page; the device has been triggered
	"commands": []//What Commands can the program give a device and what do they do
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
			"device": new SerialPort(parameters.port, {
				baudRate: 9600,
			  }),
			"parser": new Readline(),
			"lastWeights": []
		})

        devices[devicePosition].device.pipe(devices[devicePosition].parser)
  
        devices[devicePosition].device.on("open", function () {
			output("console", "Connection to "+ name +" at "+ parameters + " was established")
			output("config", {}) //TBD
        });    
        
        devices[devicePosition].parser.on('data', function (data) {
			weightFunction(devices[devicePosition], data)
        });
  
        devices[devicePosition].device.on('error', function(err) {
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
	output("console", "This device has no commands")
}

//------ Above: Standard Functions, Necessary by Program Definition. Below: Custom Functions needed for Script funcionality

/**
 * 
 * @param {object} device The Array(devices) Object of the device, passed by reference
 * @param {*} data What the Arduino has written onto its Serial output
 */
function weightFunction(device, data){
	try {
		if(typeof data == "string"){
			data = parseInt(data)
		}
		if(typeof data != "number"){
			throw "data is not a number"
		}
		if(device.lastWeights.length <= 0){ 
			device.lastWeights.push(data)
		}else{
			let sum = 0
			for(let i = 0; i < device.lastWeights.length; i++){
				sum = parseInt(sum) + parseInt(device.lastWeights[i])
			}
			let avg = parseInt(sum) / device.lastWeights.length;
			if(data <= avg+5 && data >= avg-5){
				device.lastWeights.push(data)
				if(device.lastWeights.length > 3000){
					device.lastWeights = device.lastWeights.slice(1)
				} 
			}else if((data >= avg+5) || (data <= avg-5)){
				device.lastWeights = [data]
				output("event", {"device": device.name, "event":"trigger"})
			}
		}
	} catch (error) {
		output("console", error)
	}
}