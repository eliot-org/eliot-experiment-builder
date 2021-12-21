<template>
    <div>
        <title>ELIOT Survey</title>
        <div v-if="paused" class="blocker">
            <h1 class="blocker-text">
                Umfrage pausiert
            </h1>
        </div>
        <div class="progress-slider" :style="{ width: progress + '%' }">
            <div class="progress-text">
                {{progress}}%
            </div>
        </div>
        
        <transition name="fade" mode="out-in" v-if="gotSurvey">
            <router-view :material="(i>=survey.length) ? '': survey[i].material" :key="$route.fullPath + Math.random()" :content="(i>=survey.length) ? '': survey[i].content" :answers="answers" v-on:eegTrigger="triggerEEG()" v-on:toggleLight="toggleLight()" v-on:startSurvey="startSurvey($event)" v-on:updateAnswers="updateAnswers($event)" v-on:nextPage="nextPage()"></router-view>
        </transition>

        <div class="countup">
            <div id="countuphour">00</div>:<div id="countupminute">00</div>:<div id="countupsecond">00</div>
        </div>
    </div>
</template>

<script>
const countrynames = require("countrynames")
export default {
    data: function(){
        return{
            //Placeholder Variable at first. Later loaded with the survey to run
            survey: [{"material": "placeholder", "module": "placeholder", "part": "T1_placeholder", "type": "question", "condition": "", "content": {"type": "yes-no", "text": "placeholder", "options":[""]}}],
            //The current Page index
            i: 0, 
            //The answers the user already gave
            answers: {"answers": [], "proband": "", "date": (new Date().toJSON().slice(0,10).replace(/-/g,'/'))},
            //If the Page is paused
            paused: false,
            //The status of the external lights
            lightStatus: 0,
            //The Code that was generated for the test subject
            receivedCode: "",
            //If the surveydata has already arrived
            gotSurvey: false,
            //If the Subjects Data has been sent to the server for saving
            sentProbandData: false,
            //Fill with Subjects Data
            probandData: {age: "", gender: "", education: "", profession: "", profession2: "", income: "", origin: "", residence: "", environment1: "", environment2: "", handedness: "", head: ""},
            //How far we are into the survey, in %
            progress: 0,  
            //the time already in the survey
            timer: "",
            //If the robot is Connected
            robotConnected: false,
            //What the robot has sent to us
            robotConsole: "",
            //Are we waiting for the robot to finish playing the program
            waitingForPlay: false,
            //Are we waiting on the robot to load the program
            waitingForLoad: false,
            //Translation for the objects script and the real robot program
            robotPosTranslation: {RA1: "E_re_A1", RA2: "E_re_A2", RA3: "E_re_A3", RB1: "E_re_B1", RB2: "E_re_B2", RB3: "E_re_B3", RC1: "E_re_C1", RC2: "E_re_C2", 
                                RC3: "E_re_C3" , RD1: "E_re_D1", RD2: "E_re_D2", RD3:"E_re_D3", LA1: "E_li_A1", LA2: "E_li_A2", LA3: "E_li_A3", LB1: "E_li_B1", 
                                LB2: "E_li_B2", LB3: "E_li_B3", LC1: "E_li_C1", LC2: "E_li_C2", LC3: "E_li_C3" , LD1: "E_li_D1", LD2: "E_li_D2", LD3:"E_li_D3"},
            //What stage the object is in, so is there even one, are we waiting for it to be brought...
            materialTransportStage: 0, //0: kein material am liegen , 1: warte auf entfernung/material liegt, 2: entferne gerade, 3: warte auf hinbringen, 4: bringe gerade
            //Are we ready to continue to the next page
            readyForNextPage: false,
            //Will be filled by timeout, when we are waiting on the robot to play
            playingTimeout: null,
            //Will be filled by robot timeout
            backTimeout: null,
            //Will be filled by robot timeout
            presentTimeout: null,
            //Last inputs by waage
            lastWeights: [],//Letzte gemessene Gewichte Array
        }
    },
    watch:{
        /**
         * Watch the robot console. On change checks if we were waiting for the program to load and then plays the program. Or if we were waiting for it to finish playing
         * then it continues to the next stage. Either bring the next material(if we removed the previous) or continue to next page(if new one was brought)
         */
        robotConsole: function(newVal){
            console.log("-----------")
            console.log("HHHHH")
            console.log("materialTransportStage:" + this.materialTransportStage)
            if(this.waitingForLoad && newVal.includes("Loading program: /programs/")){
                this.waitingForLoad = false
                    console.log("DDDD")
                this.robotPlayCommand()
                //DDDDD war hier
            }
            console.log("waitingforplay:" + this.waitingForPlay)
            if(newVal.includes("STOPPED") && this.waitingForPlay){
                    console.log("CCCCC")
                this.waitingForPlay = false
                if(this.materialTransportStage == 2){
                    console.log("BBBBB")
                    clearTimeout(this.backTimeout)
                    this.materialTransportStage = 3
                    setTimeout(this.robotComm, 1000)
                }else if(this.materialTransportStage == 4){
                    console.log("AAAAA")
                    this.materialTransportStage = 1
                    this.readyForNextPage = true
                }
            }
        },
        /**
         * If we are ready for the next page then clear all timeouts and call the nextPage funtion in one second
         */
        readyForNextPage: function(newVal){
                    console.log("EEEEE")
            if(newVal == true){
                this.readyForNextPage = false
                clearTimeout(this.presentTimeout)
                setTimeout(this.nextPage, 1000)
                    console.log("FFFFF")
            }
        }
    },
    methods:{
        /**
         * On survey start start the timer, set the light, call the robot. like next page. If next page is in demographie and we already have a subject code then skip that
         */
        startSurvey: function(event){
            this.timer = setInterval(() => {//Ungenauer Timer für Anzeige
                let countuphour = document.getElementById('countuphour').innerHTML
                let countupminute = document.getElementById('countupminute').innerHTML
                let countupsecond = document.getElementById('countupsecond').innerHTML
                if(parseInt(countupsecond) < 59){//sekunden
                    countupsecond = parseInt(countupsecond) +1
                    if(countupsecond < 10){
                        countupsecond = "0"+(countupsecond.toString())
                    }else{
                        countupsecond = countupsecond.toString()
                    }
                }else{
                    countupsecond = "00"
                    if(parseInt(countupminute) < 59){//minuten
                        countupminute = parseInt(countupminute) +1
                        if(countupminute < 10){
                            countupminute = "0"+(countupminute.toString())
                        }else{
                            countupminute = countupminute.toString()
                        }
                    }else{
                        countupminute = "00"
                        countuphour = parseInt(countuphour) +1
                        if(countuphour < 10){
                            countuphour = "0"+(countuphour.toString())
                        }else{
                            countuphour = countuphour.toString()
                        }
                    }
                }
                document.getElementById('countuphour').innerHTML = countuphour
                document.getElementById('countupminute').innerHTML = countupminute
                document.getElementById('countupsecond').innerHTML = countupsecond
            }, 1000)

            this.receivedCode = event
            
            this.setLight()

            this.robotComm()
            

            if(!this.paused){ //Kann nur passieren wenn nicht pausiert
                
                    if(this.survey[this.i].part == "Demographie" && this.receivedCode != ""){
                        this.nextPage()
                    }

                if (this.$route.path != this.getNextPage()) {
                    this.$router.push({ name: this.getNextPage(), params: { index: this.i}}) //Ruft die nächste Seite auf und übergibt die aktuellen Arrayindex als parameter
                }
                console.log(this.survey)
            }
        },
        /**
         * All the continue to next page logic. Does:
         * Increase index and progress
         * Call the light for the next page
         * Call the eeg trigger for the next page
         * Call the robot for the next page
         * If the next page is demographie and we already have a subject code skip that
         * On finish clear timer, maybe send subject data. send answers
         */
        nextPage: function() {
            if(!this.paused){ //Kann nur passieren wenn nicht pausiert
                this.i++
                this.progress = parseInt((this.i/(this.survey.length-1))*100)
                this.setLight()
                this.setTrigger()
                this.robotComm()
                console.log(this.survey[this.i])
                console.log(this.i)
                console.log(this.survey.length)
                console.log(this.i==this.survey.length-1)
                if(this.i==(this.survey.length-1)){ //Fürs beenden
                    clearInterval (this.timer)

                    if (this.$router.currentRoute.name != this.getNextPage()) {
                        this.$router.push({ name: "SurveyEnd", params: { index: this.i}})
                    }
                    console.log(this.probandData)
                    //Erstelle neuen Probanden nur wenn die Fragen auch wirklich gestellt wurden, die Daten also gesetzt wurden 
                    if(this.probandData.age != "" && this.probandData.gender != "" && this.probandData.education!= ""&& this.probandData.profession!= ""
                    && this.probandData.income!= ""&& this.probandData.origin!= ""&& this.probandData.residence!=""&& this.probandData.environment1!==""
                    && this.probandData.environment2!== ""&&this.probandData.handedness!=""&& this.probandData.head!= ""){
                        this.sendProbandData()
                    }else if(this.receivedCode == ""){//Wenn kein neuer Proband erstellt wurde und auch keiner Angegeben wurde mache Generic
                        this.receivedCode = "Generic"
                        this.sendAnswers()
                    }                    
                }else{
                    if(this.survey[this.i].part == "Demographie" && this.receivedCode != ""){
                        this.nextPage()
                    }
                    if (this.$router.currentRoute.name != this.getNextPage()) {
                        this.$router.push({ name: this.getNextPage(), params: { index: this.i}}) //Ruft die nächste Seite auf und übergibt die aktuellen Arrayindex als parameter
                    }
                    window.scrollTo(0,0);
                }
            }
        },
        /**
         * As long as the robot is still playing the program, calls itself to check that status. If the robot is finished then different funtions notice that in the robotconsole.
         * This is just to update the console as the robot doesnt do that after finishing playing
         */
        robotProgramStateCommandRecursion: function(){//Solange auf play status = fertig gewartet wird überprüfe status alle 250ms
            this.$electron.ipcRenderer.send("robotCommands", {command:"programState", data:""})
            console.log("RECURSIOOOON")
            if(this.waitingForPlay){
               setTimeout(this.robotProgramStateCommandRecursion, 500)
            }
        },
        /**
         * Orders the robot to play and sets a timeout of 35 seconds while starting the recursion to check the robot console
         */
        robotPlayCommand: function(){
            console.log("PLAY IT")
            clearTimeout(this.playingTimeout)
            this.waitingForPlay = true
            this.$electron.ipcRenderer.send("robotCommands", {command:"play", data:""})
            setTimeout(this.robotProgramStateCommandRecursion, 1000)
            this.playingTimeout = setTimeout(function(){
                if(this.waitingForPlay == true){
                    console.log("Some Robot Communication failed")
                    this.waitingForPlay = false
                }
            }.bind(this),35000)
        },
        /**
         * Responsible for bringing and/or removing materials. Checks all prerequesites and then starts the process. First for removal then for bringing
         * Has different workflows for different stages
         */
        robotComm:  function(){
            console.log(this.survey[this.i].module)
            console.log(this.survey[this.i].part)
            console.log(this.robotConnected)
            if(this.survey[this.i].module == "Roboterfahrt" && this.survey[this.i].part == "Fahrt" && this.robotConnected){
                //zweimal, einmal vorheriges wegnehmen, einmal neues dazulegen, außer bei letztem und erstem material
                console.log(this.i)
                if(this.i > 0){ //Nicht beim Survey start nach altem material suchen da es nicht existieren kann
                    console.log(this.survey[this.i-1].material)
                    console.log(Object.prototype.hasOwnProperty.call(this.survey[this.i-1].material,"roboPos"))
                    console.log(this.materialTransportStage)
                    console.log(this.survey[this.i-1].material.roboPos)
                    if(this.survey[this.i-1].material != "" && Object.prototype.hasOwnProperty.call(this.survey[this.i-1].material,"roboPos") && this.materialTransportStage == 1
                    && this.survey[this.i-1].material.roboPos != ""){//Hier altes wegfahren
                        this.materialTransportStage = 2
                        this.waitingForLoad = true  
                        this.$electron.ipcRenderer.send("robotCommands", {command:"load", data:"/programs/"+ this.robotPosTranslation[this.survey[this.i-1].material.roboPos] +"_back.urp"})
                        this.backTimeout = setTimeout(function(){
                            if(this.waitingForLoad == true/* && this.materialTransportStage == 2*/){
                                console.log("Some Robot Communication failed")
                                this.waitingForLoad = false
                            }
                        }.bind(this),35000)
                    }else if(this.materialTransportStage != 3 && this.materialTransportStage != 4){//wenn noch im transport dann nicht
                        this.materialTransportStage = 0
                    }
                }

                if(this.i < (this.survey.length-1)){//Nicht beim Survey ende nach neuem material suchen da es nicht existieren kann
                    if(this.survey[this.i+1].material != "" && Object.prototype.hasOwnProperty.call(this.survey[this.i+1].material,"roboPos") && 
                    (this.materialTransportStage == 0 || this.materialTransportStage == 3) && this.survey[this.i+1].material.roboPos != ""){//Hier neues holen außer wenn nächstes modul kein material hat
                        this.materialTransportStage = 4
                    console.log("GGGGG")
                        this.waitingForLoad = true  
                        console.log(this.robotPosTranslation)
                        console.log(this.survey[this.i+1])
                        console.log("i: "+this.i)
                        this.$electron.ipcRenderer.send("robotCommands", {command:"load", data:"/programs/"+ this.robotPosTranslation[this.survey[this.i+1].material.roboPos] +"_present.urp"})
                        this.presentTimeout = setTimeout(function(){
                            if(this.waitingForLoad == true /*&& this.materialTransportStage == 4*/){
                                console.log("Some Robot Communication failed")
                                this.waitingForLoad = false
                            }
                        }.bind(this),35000)
                    }else if(this.materialTransportStage != 1 && this.materialTransportStage != 2){//wenn nicht im transport
                        this.materialTransportStage = 0
                        this.readyForNextPage = true
                    }
                }
            }
        },
        /**
         * Toggles the external lights if the prerequesites are right
         */
        toggleLight(){
            console.log(Object.prototype.hasOwnProperty.call(this.survey[this.i].content,"light"))
            console.log(this.survey[this.i].content.light == "on")
            console.log(this.lightStatus)
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].content,"light")){//Wenn Frage Licht hat
                if(this.survey[this.i].content.light == "on"){//Wenn es angemacht wurde
                    if(this.lightStatus == 0){ //Wenn Lampe noch aus ist dann anmachen(Kurzes Drücken des Tasters)
                        try{
                            this.lightStatus = 1
                            this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})     
                            setTimeout(function(){this.$electron.ipcRenderer.send("setPin", {pin:3,state:0})}.bind(this), 1000);
                            //board.digitalWrite(3, 1)
                            //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000);
                        }catch(e){
                            console.log(e)
                        }
                    }else if(this.lightStatus == 1){
                        try{
                            this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})     
                            setTimeout(function(){this.$electron.ipcRenderer.send("setPin", {pin:3,state:0})}.bind(this), 1000);
                            //board.digitalWrite(3, 1)
                            //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000); 
                            this.lightStatus = 0
                        }catch(e){
                            console.log(e)
                        }
                    }
                }
            }
        },
        /**
         * Set the trigger on pages that want it, except on timers
         */
        setTrigger: function(){ //Für automatisch wenn seite geöffnet. Außer bei Timern, da wird es vom timer selber aufgerufen
            console.log(Object.prototype.hasOwnProperty.call(this.survey[this.i].content,"eeg"))
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].content,"eeg") && this.survey[this.i].type != "timer"){
                if(this.survey[this.i].content.eeg == "trigger"){
                    //this.$electron.ipcRenderer.send("setPin", {pin:8,state:1})   
                    //setTimeout(function() {this.$electron.ipcRenderer.send("setPin", {pin:8,state:0})}.bind(this), 500)
                    let arg
                    if(this.survey[this.i].part == "HAPTIK T1 IME Präsentation"){
                        arg = 2
                    }else if(this.survey[this.i].part == "OPTIK T1 IME Präsentation"){
                        arg = 1
                    }
                    this.$electron.ipcRenderer.send("trigger",arg)
                }
            }
        },
        /**
         * just trigger eeg, only called by timers
         */
        triggerEEG: function(){
            //console.log(this.survey[this.i].content.hasOwnProperty("eeg"))
            //if(this.survey[this.i].content.hasOwnProperty("eeg")){
                //if(this.survey[this.i].content.eeg == "trigger"){
                    console.log("EEG now")
                    //this.$electron.ipcRenderer.send("setPin", {pin:8,state:1})   Alte Implementation über Arduino
                    //setTimeout(function() {this.$electron.ipcRenderer.send("setPin", {pin:8,state:0})}.bind(this), 500)
                    let arg
                    if(this.survey[this.i].part == "HAPTIK T1 IME Präsentation"){
                        arg = 2
                    }else if(this.survey[this.i].part == "OPTIK T1 IME Präsentation"){
                        arg = 1
                    }else{
                        arg = 4
                    }
                    this.$electron.ipcRenderer.send("trigger",arg)
                //}
            //}
        },
        /**
         * Set the light 
         */
        setLight: function(){
            console.log("SETLIGHT:------------------------")
            console.log(Object.prototype.hasOwnProperty.call(this.survey[this.i].content,"light"))
            console.log(this.lightStatus)
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].content,"light") /*&& this.survey[this.i].type != "timer"*/){
                if(this.survey[this.i].content.light == "on"){
                    if(this.lightStatus == 0){ //Wenn Lampe noch aus ist dann anmachen(Kurzes Drücken des Tasters)
                        try{
                            this.lightStatus = 1
                            this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})   
                            setTimeout(function() {this.$electron.ipcRenderer.send("setPin", {pin:3,state:0})}.bind(this), 1000);
                            //board.digitalWrite(3, 1)
                            //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000);
                        }catch(e){
                            console.log(e)
                        }
                    }
                }else{//Ansonsten ausmachen wenn noch an
                    if(this.lightStatus == 1){
                        try{
                            this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})  
                            setTimeout(function() {this.$electron.ipcRenderer.send("setPin", {pin:3,state:0})}.bind(this), 1000)

                            //board.digitalWrite(3, 1)
                            //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000); 
                            this.lightStatus = 0
                        }catch(e){
                            console.log(e)
                        }
                    }
                }
            }else{
                if(this.lightStatus == 1){
                    try{
                        this.$electron.ipcRenderer.send("setPin", {pin:3,state:1})  
                        setTimeout(function(){this.$electron.ipcRenderer.send("setPin", {pin:3,state:0})}.bind(this), 1000)
                        //board.digitalWrite(3, 1)
                        //setTimeout(function(){ board.digitalWrite(3, 0) }, 1000);
                        this.lightStatus = 0
                    }catch(e){
                        console.log(e)
                    }
                }
            }
        },
        /**
         * Gets the type of the next page
         */
        getNextPage: function(){
            if(this.i < this.survey.length){
                if(this.survey[this.i].type == "question"){
                    return this.survey[this.i].content.type
                }else{
                    return this.survey[this.i].type
                }
            }
        },
        /**
         * Updates the answers and encodes some values given by the surveyfile into something more useful later on
         */
        updateAnswers: function(event){
            console.log(event)
            console.log(this.answers)
            //Aufteilung von mehreren Slidern in einer Frage in mehrere Antworten
            if(this.survey[this.i].content.type == "slider" || this.survey[this.i].content.type == "polygonGraph"){
                for(var i= 0; i< event.length; i++){
                    this.answers.answers.push({
                    'questionText': this.survey[this.i].content.text,
                    'questionType': this.survey[this.i].content.type,
                    'answer': event[i].value,
                    'module': this.survey[this.i].module,
                    'part': this.survey[this.i].part,
                    "material": this.survey[this.i].material,
                    "name": event[i].name})
                }
            }else{
                this.answers.answers.push({
                'questionText': this.survey[this.i].content.text,
                'questionType': this.survey[this.i].content.type,
                'answer': event,
                'module': this.survey[this.i].module,
                'part': this.survey[this.i].part,
                "material": this.survey[this.i].material,
                "name": this.survey[this.i].content.name})
            }
            if(this.survey[this.i].part == "Demographie" && this.survey[this.i].module == "POI" && this.survey[this.i].type == "question" && this.survey[this.i].part != "Einverständniserklärung"){
                if(this.survey[this.i].part !=
                 "Trainingsrunde"){
                    console.log(this.survey[this.i].content.name)
                    console.log(event)
                    switch(this.survey[this.i].content.name || event[0].name){
                        case "POI_Demographie_age":
                            this.probandData.age = event[0]
                            break;
                        case "POI_Demographie_gender":
                            if(event == "Weiblich"){
                                this.probandData.gender = "0"
                            }else if(event == "Anders"){
                                this.probandData.gender = "1"
                            }else if(event == "Männlich"){
                                this.probandData.gender = "2"
                            }
                            break;
                        case "POI_Demographie_education":
                            if(event=="Kein Schulabschluss"){
                                this.probandData.education = "0"
                            }else if(event=="Grund-/Hauptschulabschluss"){
                                this.probandData.education =  "1"
                            }else if(event=="Mittlere Reife (Realschulabschluss)"){
                                this.probandData.education =  "2"
                            }else if(event=="Fachhochschulabschluss"){
                                this.probandData.education =  "3"
                            }else if(event=="Allgemeine Hochschulreife (Abitur)"){
                                this.probandData.education =  "4"
                            }else if(event=="Abgeschlossene Ausbildung"){
                                this.probandData.education =  "5"
                            }else if(event=="Bachelor"){
                                this.probandData.education =  "6"
                            }else if(event=="Master"){
                                this.probandData.education =  "7"
                            }else if(event=="Promotion"){
                                this.probandData.education =  "8"
                            }else if(event=="Sonstiges"){
                                this.probandData.education =  "9"
                            }else if(event=="Staatsexamen"){
                                this.probandData.education =  "10"
                            }else if(event=="Approbation"){
                                this.probandData.education =  "11"
                            }else if(event=="Diplom"){
                                this.probandData.education =  "12"
                            }else if(event=="Meister"){
                                this.probandData.education =  "13"
                            }
                            break;
                        case "POI_Demographie_profession":
                            if(event=="Schüler*in"){
                                this.probandData.profession = "0"
                            }else if(event=="Student*in"){
                                this.probandData.profession =  "1"
                            }else if(event=="Akademischer Beruf"){
                                this.probandData.profession =  "2"
                            }else if(event=="Techniker*in und gleichrangiger nichttechnischer Beruf"){
                                this.probandData.profession =  "3"
                            }else if(event=="Führungskraft"){
                                this.probandData.profession =  "4"
                            }else if(event=="Medizinischer und Pflegeberuf"){
                                this.probandData.profession =  "5"
                            }else if(event=="Projektarbeits und Entwicklungskraft"){
                                this.probandData.profession =  "6"
                            }else if(event=="Lehrkraft"){
                                this.probandData.profession =  "7"
                            }else if(event=="Bürokraft und verwandter Beruf"){
                                this.probandData.profession =  "8"
                            }else if(event=="Dienstleistungsberuf und Verkäufer*in"){
                                this.probandData.profession =  "9"
                            }else if(event=="Fachkräfte in der Landwirtschaft und Fischerei"){
                                this.probandData.profession =  "10"
                            }else if(event=="Handwerks- und verwandter Beruf"){
                                this.probandData.profession =  "11"
                            }else if(event=="Anlagen- und Maschinenbediener*in und Montageberuf"){
                                this.probandData.profession =  "12"
                            }else if(event=="Hilfsarbeitskraft"){
                                this.probandData.profession =  "13"
                            }else if(event=="Militärischer Beruf"){
                                this.probandData.profession =  "14"
                            }else if(event=="Arbeitssuchend"){
                                this.probandData.profession =  "15"
                            }else if(event=="Selbständigkeit & Freiberuflichkeit"){
                                this.probandData.profession =  "16"
                            }else if(event=="Sonstiges"){
                                this.probandData.profession =  "17"
                            }
                            break;
                        case "POI_Demographie_profession2":
                            if(event=="keine Ausbildung / kein Studium"){
                                this.probandData.profession2 = "0"
                            }else if(event=="Agrar- und Forst­wissenschaften"){
                                this.probandData.profession2 = "1"
                            }else if(event=="Gesellschafts- und Sozial­wissenschaften"){
                                this.probandData.profession2 =  "2"
                            }else if(event=="Ingenieur­wissenschaften"){
                                this.probandData.profession2 =  "3"
                            }else if(event=="Kunst"){
                                this.probandData.profession2 =  "4"
                            }else if(event=="Musik"){
                                this.probandData.profession2 =  "5"
                            }else if(event=="Design"){
                                this.probandData.profession2 =  "6"
                            }else if(event=="Mathematik"){
                                this.probandData.profession2 =  "7"
                            }else if(event=="Naturwissenschaften"){
                                this.probandData.profession2 =  "8"
                            }else if(event=="Medizin"){
                                this.probandData.profession2 =  "9"
                            }else if(event=="Gesund­heitswissen­schaften und -wirtschaft"){
                                this.probandData.profession2 =  "10"
                            }else if(event=="Sprach- und Kulturwissen­schaften"){
                                this.probandData.profession2 =  "11"
                            }else if(event=="Wirtschafts- und Rechts­wissenschaften"){
                                this.probandData.profession2 =  "12"
                            }else if(event=="Lehramt"){
                                this.probandData.profession2 =  "13"
                            }else if(event=="Öffentliche Verwaltung"){
                                this.probandData.profession2 =  "14"
                            }else if(event=="Sonstiges"){
                                this.probandData.profession2 =  "15"
                            }
                            break;
                        case "POI_Demographie_income":
                            if(event=="Unter 400"){
                                this.probandData.income = "0"
                            }else if(event=="400 - 1000"){
                                this.probandData.income =  "1"
                            }else if(event=="1000 - 1500"){
                                this.probandData.income =  "2"
                            }else if(event=="1500 - 2500"){
                                this.probandData.income =  "3"
                            }else if(event=="2500 - 4000"){
                                this.probandData.income =  "4"
                            }else if(event=="4000 - 6000"){
                                this.probandData.income =  "5"
                            }else if(event=="Über 6000"){
                                this.probandData.income =  "6"
                            }else if(event=="Keine Angabe"){
                                this.probandData.income =  "7"
                            }
                            break;
                        case "POI_Demographie_origin":
                            console.log(event)
                            this.probandData.origin = countrynames.getCode(event[0])
                            break;
                        case "POI_Demographie_residence":
                            this.probandData.residence = countrynames.getCode(event[0])
                            break;
                        case "POI_Demographie_ländlich_städtisch1":
                            this.probandData.environment1 = event[0].value
                            break;
                        case "POI_Demographie_ländlich_städtisch2":
                            this.probandData.environment2 = event[0].value
                            break;
                        case "POI_Demographie_handedness":
                            if(event == "Links"){
                                this.probandData.handedness = "0"
                            }else if(event == "Rechts"){
                                this.probandData.handedness = "1"
                            }
                            break;
                        case "POI_Demographie_head":
                            this.probandData.head = event[0]
                            break;
                    }
                    console.log(this.probandData)
                }
            }
        },
        /**
         * Send the answers to the adminpage
         */
        sendAnswers: function(){
            this.answers.proband = this.receivedCode
            
            let countuphour = document.getElementById('countuphour').innerHTML
            let countupminute = document.getElementById('countuphour').innerHTML 
            let countupsecond = document.getElementById('countupsecond').innerHTML

            this.answers.länge = countuphour+":"+countupminute+":"+countupsecond
            this.$electron.ipcRenderer.send("surveyOps", {"arg": "sendAnswers", "answers": this.answers}) 
        },
        /**
         * Uploads the subjects data and expects a code from the server 
         */
        sendProbandData: function(){
            if(this.sentProbandData == false){
                this.sentProbandData = true
                ///Removed Axios
            }
        },
    },
    created(){ 
        /**
         * On data from the waage. Adds the data to the last weights array (maybe removes old ones). If wheigt change is +-5 from average over lastWeights then trigger eeg
         */
        this.$electron.ipcRenderer.on("waageConsole", (event,arg) => {
            if(this.materialTransportStage == 1 && this.survey[this.i].type == "timer"){ //Wenn Material bereits liegt und wir im timer sind
                //console.log(arg)
                if(this.lastWeights.length <= 0){ //Wenn noch keine Gewichtsdaten vorhanden sind einfach erstmal pushen
                    this.lastWeights.push(arg)
                }else{
                    let sum = 0
                    for(let i = 0; i < this.lastWeights.length; i++){
                        sum = parseInt(sum) + parseInt(this.lastWeights[i])
                    }
                    let avg = parseInt(sum) / this.lastWeights.length;
                    if(arg <= avg+5 && arg >= avg-5){//Ist das neue Gewicht im bisherigen Bereich?
                        this.lastWeights.push(arg)//Dann füge es zum Bereich hinzu
                        if(this.lastWeights.length > 3000){
                            this.lastWeights = this.lastWeights.slice(1)//Nehme erstes Element raus. So bleiben wir bei 10 Elementen
                        } 
                    }else if((arg >= avg+5) || (arg <= avg-5)){//Wenn nicht, dann nehme an dass Hand abgelegt wurde. Solange in bestimmtem Bereich(+-30 bis +-200)
                        this.lastWeights = [arg]//Setze lastWeights zurück
                        console.log("EEE")
                        this.$electron.ipcRenderer.send("trigger",3)
                        console.log("EEG TRIGGER durch Waage!")
                    }
                }
            }
        })

        /**
         * Update robot connected status
         */
        this.$electron.ipcRenderer.on("robotConnected", (event,arg) => {
            this.robotConnected = arg
            console.log(arg)
        }) 

        /**
         * Update the robot console
         */
        this.$electron.ipcRenderer.on("robotConsole", (event,arg) => {
            this.robotConsole = arg
            console.log(arg)
        }) 
        //Get the robots status
        this.$electron.ipcRenderer.send("robotCommands", {command:"status", data:""})
        /**
         * Log output of arduino(external light)
         */
        this.$electron.ipcRenderer.on("arduinoConsole", (event,arg) => {
            console.log(arg)
        })
        
        /**
         * get survey Data from adminpage
         */
        this.$electron.ipcRenderer.send("surveyOps", "getSurveyData")       
        console.log("Getting SurveyData now")

        /**
         * On Commands from adminpage like pause or end. do the fitting thing
         */
        this.$electron.ipcRenderer.on("surveyOps", (event,arg) => {
            if(arg == "pause"){
                console.log("Survey pausiert")
                this.paused = true
            }else if(arg == "unpause"){
                console.log("Survey resumed")
                this.paused = false
            }else if(arg.arg == "sendSurveyData"){
                console.log("Got SurveyData")
                console.log(arg.survey)
                this.survey = arg.survey
                this.port = arg.port
                //this.initializeArduino()
                this.$electron.ipcRenderer.send("connectArduino", this.port)  
                this.gotSurvey = true
            }else if(arg == "Beenden"){
                console.log("Will end soon. Sending Answers now")
                this.answers.proband = this.receivedCode
                
                let countuphour = document.getElementById('countuphour').innerHTML
                let countupminute = document.getElementById('countuphour').innerHTML 
                let countupsecond = document.getElementById('countupsecond').innerHTML

                this.answers.länge = countuphour+":"+countupminute+":"+countupsecond
                this.$electron.ipcRenderer.send("surveyOps", {"arg": "sendAnswers", "answers": this.answers}) 
                console.log("Goodbye")
                this.$electron.ipcRenderer.send("surveyOps", "ended")
            }
        })
        //To not show an empty Page, but the first question page
        /*if(this.i==0){
            this.i=0
            this.$router.push({ name: this.getNextPage(), params: { question: this.i}}).catch(err => {})
        }*/
    },
    mounted(){ 
        //get robot status
        this.$electron.ipcRenderer.send("robotCommands", {command: "status", data: ""})  
        
    },
    beforeDestroy () {
        /**
         * Clears the timer
         */
        clearInterval(this.timer)
    }
}
</script>

<style src="./SurveyPage/SurveyPage.css"></style>