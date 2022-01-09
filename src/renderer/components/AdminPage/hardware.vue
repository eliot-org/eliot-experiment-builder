<template>
    <div class="admin-hardware-wrapper">
        <div class="hardware-overview-wrapper">
            <div class="hardware-box">
                <div class="hardware-header" >
                    <div class="hardware-header-text">  
                        Console
                        <button class="deleteButton" @click="reloadDevices()">Reload Devices</button>
                    </div>
                </div>
                <div class="hardware-collapse">
                    <div style="max-height: 150px; min-height:25px; overflow: scroll; display:flex; flex-direction: column-reverse" v-html="console"></div>
                </div>
            </div>

            <div class="hardware-box" v-for="(script, a) in scripts" v-bind:key="a">
                <div class="hardware-header" >
                    <div class="hardware-header-text">  
                        {{script.scriptName}}
                    </div>
                </div>
                <div class="hardware-collapse">
                    <div><h4>Description</h4></div>
                    <div style="margin-left:20px">
                        {{script.description}}
                    </div>

                    <hr>
                    
                    <div><h4>Commands</h4></div>
                    <ul class="material-table">
                        <li class="table-element" v-for="(command, b) in script.commands" v-bind:key="b">
                            {{command}}
                        </li>
                    </ul>

                    <hr>

                    <div><h4>Events</h4></div>
                    <ul class="material-table">
                        <li class="table-element" v-for="(event, c) in script.events" v-bind:key="c">
                            {{event}}
                        </li>
                    </ul>

                    <hr>

                    <div>
                        <div><h4>Devices</h4></div>
                        <div style="margin-left:20px" v-for="(device, f) in devices" v-bind:key="f">
                            <div v-if="device.script == script.scriptName">
                                {{device.name}}
                                <button class="button" @click="removeDevice(device.script, device.name)">Remove</button>
                            </div>
                        </div>
                    </div>

                    <hr>

                    <div>
                        <div><h4>New Device</h4></div>
                        <div style="margin-left:20px" v-for="(parameter, e) in script.deviceParameters" v-bind:key="e">
                            {{parameter.name.toUpperCase()}}: <input :type="parameter.type" v-model="parameter.input">
                        </div>
                        <button class="button" @click="createDevice(script)">Create</button>
                    </div> 
                    
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function(){
        return{
            scripts: [],
            console: "",
            devices: [],
            gotScripts: false,
        }
    },
    methods:{
        createDevice: function(script){
            let parameters = {}
            let deviceName

            for(let i = 0; i < script.deviceParameters.length; i++){
                parameters[script.deviceParameters[i].name] = script.deviceParameters[i].input
            }
            deviceName = parameters["name"]
            delete parameters["name"]

            this.$electron.ipcRenderer.invoke("hardwareCreateDevice", {"scriptName": script.scriptName, "deviceName": deviceName, "parameters": parameters}) 
        },
        removeDevice: function(script, deviceName){
            this.$electron.ipcRenderer.invoke("hardwareRemoveDevice", {"scriptName": script, "deviceName": deviceName}) 
        },
        reloadDevices: function(){ 
            this.$electron.ipcRenderer.invoke("hardwareGetDevices") 
        }
    },
    mounted(){
        this.gotScripts = false
        this.$electron.ipcRenderer.invoke("hardwareGetScripts") 
        this.reloadDevices()

        this.$electron.ipcRenderer.on("hardwareReturnScripts", (event,arg) => {
            if(this.gotScripts == false){
                this.gotScripts = true
                this.scripts = arg
                for(let i = 0; i < this.scripts.length; i++){
                    this.scripts[i].deviceParameters.unshift({"name": "name", "type": "string"}) //Add deviceName as parameter
                }
            }
        })
        
        this.$electron.ipcRenderer.on("hardwareReturnDevices", (event,arg) => {
            this.devices = arg
        })

        this.$electron.ipcRenderer.on("hardwareConsole", (event,arg) => {
            this.console = this.console + "" + arg.sender + ": " + arg.text + "<br>"
        })
    },
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
        margin-top:25px;
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

    .table-element{
        margin-left:40px;
    }

     .deleteButton{
        float:right;
        margin-right:10px;
        padding: 0.2rem 1rem;
        line-height: 1.5;
        background-color: white ;
        border-radius:0.5rem;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
		text-transform: none;
		transition: 0.3s;
        outline:none !important;
        cursor: pointer;
        border: none;
    }
</style>