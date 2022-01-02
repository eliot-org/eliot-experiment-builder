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
            <router-view :material="(i>=survey.length) ? '': survey[i].material" :key="$route.fullPath + Math.random()" :content="(i>=survey.length) ? '': survey[i].content" :answers="answers" v-on:eegTrigger="triggerEEG()" v-on:toggleLight="toggleLight()" v-on:startSurvey="startSurvey($event)" v-on:updateAnswers="updateAnswers($event)" v-on:nextPage="nextPage()" v-on:hardwareEvent="hardwareCommand($event)"></router-view>
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
                this.hardwareCommand("onPageEnd")
                this.i++
                this.sendSurveyDataToHW()
                this.progress = parseInt((this.i/(this.survey.length-1))*100)
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
                    //if(this.survey[this.i].part == "Demographie" && this.receivedCode != ""){
                        //this.nextPage()
                    //}
                    if (this.$router.currentRoute.name != this.getNextPage()) {
                        this.$router.push({ name: this.getNextPage(), params: { index: this.i}}) //Ruft die nächste Seite auf und übergibt die aktuellen Arrayindex als parameter
                    }
                    window.scrollTo(0,0);
                    this.hardwareCommand("onPageLoad")
                }
            }
        },
        /**
         * 
         */    
        sendSurveyDataToHW: function(){
            this.$electron.ipcRenderer.send("hardware", {"type": "sendSurveyData", "arg": this.survey[this.i]})           
        },
        /**
         * 
         */    
        hardwareCommand: function(type){
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware, type)){
                for(let i = 0; i < this.survey[i].hardware[type].length; i++){
                    if(type == "afterXSeconds"){
                        setTimeout(this.$electron.ipcRenderer.send("hardware", {"type": "command", "device": this.survey[this.i].hardware[type][i].device, "command": this.survey[this.i].hardware[type][i].command}) , this.survey[this.i].hardware[type][i].seconds)  
                    }else{
                        this.$electron.ipcRenderer.send("hardware", {"type": "command", "device": this.survey[this.i].hardware[type][i].device, "command": this.survey[this.i].hardware[type][i].command})       
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
         * 
         */
        this.$electron.ipcRenderer.on("hardware", (event,arg) => {
            if(arg.type == "event"){
                if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware, "input")){
                    for(let i = 0; i < this.survey[this.i].hardware.input.length; i++){
                        if(this.survey[this.i].hardware.input[i].device == arg.arg.device && this.survey[this.i].hardware.input[i].on == arg.arg.event){
                            this.$electron.ipcRenderer.send("hardware", {"type": "command", "device": this.survey[this.i].hardware.input[i].do.device, "command": this.survey[this.i].hardware.input[i].do.command})       
                        }
                    }
                }   
            }
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