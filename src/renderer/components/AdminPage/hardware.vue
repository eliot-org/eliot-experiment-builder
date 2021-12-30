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
export default {
    data: function(){
        return{
           
        }
    },
    methods:{
        
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