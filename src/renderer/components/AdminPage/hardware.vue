<template>
    <div class="admin-hardware-wrapper">
        <div class="hardware-overview-wrapper">

            <div class="hardware-box">
                <div class="hardware-header" >
                    <div class="hardware-header-text">  
                        LED & Arduino       
                    </div>
                </div>
                <div class="hardware-collapse" >
                    Status: {{(boardStatus.message == null) ? boardStatus: boardStatus.message}}<br>
                    <!--Fehler: {{(boardError != null) ? boardError.message : ""}}<br>-->
                    Port: <input type="text"  v-model="port" class="input"><br>
                    <button class="button" @click="connectToArduino()">Verbinden</button>
                    <!--<button class="button" @click="pressButton1()">Drücke Knopf 1</button>-->
                    <button class="button" @click="pressButton2()">Drücke Knopf 2</button>
                     <!--<button class="button" @click="toggleLight()">Lichtschalter</button>-->
                     <!--<button class="button" @click="changeBrightness()">Ändere Helligkeit</button>-->
                    <!--<button class="button" @click="changeLightTemperature()">Ändere Lichtemperatur</button>-->
                     <!--<button class="button" @click="disconnect()">Verbindung trennen</button>-->
                </div>
            </div>
            
            <div class="hardware-box">
                <div class="hardware-header" >
                    <div class="hardware-header-text">  
                        Waage       
                    </div>
                </div>
                <div class="hardware-collapse" >
                    Status: {{(waageStatus.message == null) ? waageStatus: waageStatus.message}}<br>
                    Port: <input type="text"  v-model="waagePort" class="input"><br>
                    <button class="button" @click="connectWaage()">Verbinden</button>
                </div>
            </div>

            <div class="hardware-box">
                <div class="hardware-header" >
                    <div class="hardware-header-text">  
                        Triggerbox       
                    </div>
                </div>
                <div class="hardware-collapse" >
                    Status: {{(triggerStatus.message == null) ? triggerStatus: triggerStatus.message}}<br>
                    Port: <input type="text"  v-model="triggerPort" class="input"><br>
                    <button class="button" @click="connectTrigger()">Verbinden</button>
                    <button class="button" @click="trigger()">Trigger</button>
                </div>
            </div>

            <div class="hardware-box">
                <div class="hardware-header" >
                    <div class="hardware-header-text">  
                        Roboter       
                    </div>
                </div>
                <div class="hardware-collapse" >
                    Nachricht vom Roboter: {{robotConsole}}<br>
                    IP: <input type="text"  v-model="roboIp" class="input"><br>
                    Port: <input type="text"  v-model="roboPort" class="input"><br>
                    <button class="button" @click="connectToRobot()">Verbinden</button>
                    <button class="button" @click="disconnectRobot()">Verbindung trennen</button>
                    <button class="button" @click="addIp()">Adresse speichern</button><br>
                    Verbindungsstatus: {{robotConnected}}
                    <hr>
                    Lade Programm: <input type="text" v-model="programm" class="input">
                    <button class="button" @click="loadProgram('load')">Lade</button><br>
                    <button class="button" @click="command('play')">Play</button><br>
                    <button class="button" @click="command('stop')">Stop</button><br>
                    <button class="button" @click="command('pause')">Pause</button><br>
                    <button class="button" @click="command('status')">Verbindungsstatus</button><br>
                    <button class="button" @click="command('programState')">Programmzustand</button><br>
                    <button class="button" @click="command('running')">Läuft?</button><br>
                    
                </div>
            </div>

    
        </div>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    data: function(){
        return{
            //Status of the arduino
            boardStatus: "",
            //Has there been an error with the arduino
            boardError: null,
            //arduino port
            port: "COM3",
            //ip adress of robot
            roboIp: "",
            //port of robot
            roboPort: "",
            //which program to load
            programm: "",
            //is the robot connected?
            robotConnected: false,
            //robot output
            robotConsole: "",
            //Saved settings, loaded from server
            loadedSettings: [],
            //Status of waage
            waageStatus: "",
            //port of waage
            waagePort: "COM4",
            //status of trigger
            triggerStatus:"",
            //port of trigger
            triggerPort:"COM5"
        }
    },
    methods:{
        connectToRobot(){ 
            this.$electron.ipcRenderer.send("robotCommands", {command:"connect", data:{ip:this.roboIp, port: this.roboPort}}) 
        },
        disconnectRobot(){
            this.$electron.ipcRenderer.send("robotCommands", {command:"quit", data:""})  
        },
        loadProgram(){
            this.$electron.ipcRenderer.send("robotCommands", {command:"load", data: "/programs/"+ this.programm +".urp"})  
        },
        command: function(command){
            this.$electron.ipcRenderer.send("robotCommands", {command: command, data: ""})  
        },
        //Get ip of robot
        getOwnIps: function(){
            this.$http.get('https://'+axios.defaults.baseURL+'/api/setting/getAll')
                .then(response => {
                    var tmp=[]
                    for(var i=0; i<response.data.settings.length; i++){
                        if(Object.prototype.hasOwnProperty.call(response.data.settings[i],"roboIp")){
                            tmp.push({"id": response.data.settings[i]._id,"username":response.data.settings[i].username, "roboIp": response.data.settings[i].roboIp,
                            "roboPort":response.data.settings[i].roboPort})
                        }
                    }
                    this.loadedSettings = tmp
                    console.log(this.loadedSettings)
                    
                    if(Object.prototype.hasOwnProperty.call(tmp[0],"roboIp")){
                        this.roboIp = tmp[0].roboIp
                        this.roboPort = tmp[0].roboPort        
                    }            
                })
                .catch(error => console.log(error))
        },
        addIp: function(){
            this.$http({url: 'https://'+axios.defaults.baseURL+'/api/setting/store', data: {roboIp: this.roboIp , roboPort: this.roboPort}, method: 'POST' }).then(response => {
                console.log(response)
            }).catch(error => console.log(error))
        },
        connectWaage(){
            this.$electron.ipcRenderer.send("connectWaage", this.waagePort)  
        },
        connectTrigger(){
            this.$electron.ipcRenderer.send("connectTrigger", this.triggerPort)  
        },
        trigger(){
            this.$electron.ipcRenderer.send("trigger", 4)  
        },
        connectToArduino(){
            this.$electron.ipcRenderer.send("connectArduino", this.port)  
        },
        pressButton1(){
            try{
                this.$electron.ipcRenderer.send("setPin", {pin:2,state:1})     
                setTimeout(this.$electron.ipcRenderer.send("setPin", {pin:2,state:0}), 1000);
                //board.digitalWrite(2, 1)
                //setTimeout(function(){ board.digitalWrite(2, 0) }, 1000);
            }catch(e){
                console.log(e)
                this.boardError = e
            }
        },
        pressButton2(){
            try{
                this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})     
                setTimeout(this.$electron.ipcRenderer.send("setPin", {pin:3,state:0}), 1000);
                //board.digitalWrite(3, 1)
                //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000);
            }catch(e){
                console.log(e)
                this.boardError = e
            }
        },
        toggleLight(){
            try{
                this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})     
                setTimeout(this.$electron.ipcRenderer.send("setPin", {pin:3,state:0}), 1000);
                //board.digitalWrite(3, 1)
                //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000);
            }catch(e){
                console.log(e)
                this.boardError = e
            }
        },
        changeBrightness(){
            try{
                this.$electron.ipcRenderer.send("setPin", {pin:2,state:1})     
                setTimeout(this.$electron.ipcRenderer.send("setPin", {pin:2,state:0}), 5000);
            }catch(e){
                console.log(e)
                this.boardError = e
            }
        },
        changeLightTemperature(){
            try{
                this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})     
                setTimeout(this.$electron.ipcRenderer.send("setPin", {pin:3,state:0}), 5000);
            }catch(e){
                console.log(e)
                this.boardError = e
            }
        }
    },
    mounted(){
        //Init all hardware interfaces
        this.getOwnIps()
        this.$electron.ipcRenderer.on("arduinoConsole", (event,arg) => {
            console.log(arg)
            this.boardStatus = arg
        })
        this.$electron.ipcRenderer.on("triggerConsole", (event,arg) => {
            console.log(arg)
            this.triggerStatus = arg
        })
        this.$electron.ipcRenderer.on("waageConsole", (event,arg) => {
            //console.log(arg)
            this.waageStatus = arg
        })
        
        this.$electron.ipcRenderer.on("robotConsole", (event,arg) => {
            console.log(event)
            this.robotConsole = arg
            console.log(arg)
        }) 
        
        this.$electron.ipcRenderer.on("robotAddress", (event,arg) => {
            this.roboIp = arg.address
            this.roboPort = arg.port
            console.log(arg)
        }) 

        this.$electron.ipcRenderer.on("robotConnected", (event,arg) => {
            this.robotConnected = arg
            console.log(arg)
            if(this.robotConnected == true){
                this.$electron.ipcRenderer.send("robotCommands", {command: "adress", data: ""})
            }
        }) 
        this.$electron.ipcRenderer.send("robotCommands", {command: "status", data: ""})  
    }
}
</script>

<style scoped>
    .button{
        margin:10px;
        padding: 0.2rem 1rem;
        line-height: 1.5;
        background-color: black ;
        border-radius:0.5rem;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
		text-transform: none;
		transition: 0.3s;
        outline:none !important;
        cursor: pointer;
        border: none;
		color: white;
    }

    .button:hover{
		color: white;
        background-color: #353535;
    }
    .admin-hardware-wrapper{
        width:100%;
    }

    .hardware-overview-wrapper{
        width:85%;
        margin:0 auto;
    }

    .hardware-box{
        margin-top: 25px;
    }

    .hardware-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .hardware-header-text{
        padding-top:3px;
        padding-left:15px;
    }

    .hardware-collapse{
        border: 1px solid black;
    }
</style>