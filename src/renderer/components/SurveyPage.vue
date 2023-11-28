<template>
    <div>
        <title>ELIOT Survey</title>
        <div v-if="paused" class="blocker">
            <h1 class="blocker-text">
                Umfrage pausiert
            </h1>
        </div>
        <div class="progress-slider" :style="{ width: progress + '%' }" v-if="showElapsedSurvey">
            <div class="progress-text">
                {{progress}}%
            </div>
        </div>
        
        <router-view 
            v-if="gotSurvey"
            ref="mainChildComponent" 
            :key="$route.fullPath + Math.random()" 
            :content="(i>=survey.length) ? '': survey[i].content" 
            :answers="answers.answers"  
            v-on:subjectCode="setSubjectCode($event)" 
            v-on:updateAnswers="updateAnswers($event)"
            v-on:nextPage="nextPage()" 
            v-on:hardwareEvent="hardwareCommand($event)"
            :style="{top: showElapsedSurvey ? '20px' : '0px'}"
        >
        </router-view>

        <div class="countup" v-if="showElapsedTime">
            <div id="countuphour">00</div>:<div id="countupminute">00</div>:<div id="countupsecond">00</div>
        </div>
    </div>
</template>

<script>
import Mousetrap from "mousetrap"
export default {
    data: function(){
        return{
            //Placeholder Variable at first. Later loaded with the survey to run
            survey: [{"object": "placeholder", "module": "placeholder", "part": "T1_placeholder", "type": "question", "condition": "", "content": {"type": "yes-no", "text": "placeholder", "options":[""]}}],
            //The current Page index
            i: 0, 
            //The answers the user already gave
            answers: {"answers": [], "date": (new Date().toJSON().slice(0,10).replace(/-/g,'/'))},
            //If the Page is paused
            paused: false,
            //The Code that was generated for the test subject
            receivedCode: "",
            //If the surveydata has already arrived
            gotSurvey: false,
            //If the Subjects Data has been sent to the server for saving
            sentsubjectData: false,
            //Fill with Subjects Data
            subjectData: {},
            //How far we are into the survey, in %
            progress: 0,  
            //the time already in the survey
            timer: "",
            //Records how much time has passed since a question has been opened
            questionTimerStart: null,
            showElapsedSurvey: false,
            showElapsedTime: false,
            autoAnswer: null,
            autoNext: null,
        }
    },
    methods:{
        /**
         * On survey start start the timer, set the light, call the robot. like next page. If next page is in demographie and we already have a subject code then skip that
         */
        startSurvey: function(){
            if(this.showElapsedTime){
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
            }
            
            if(!this.paused){ //Kann nur passieren wenn nicht pausiert
                if (this.$route.path != this.getNextPage()) {
                    this.$router.push({ name: this.getNextPage(), params: { index: this.i}}) //Ruft die nächste Seite auf und übergibt die aktuellen Arrayindex als parameter
                }
            }
        },
        /**
         * 
         */
        nextPage: function() {
            if(!this.paused && this.i < this.survey.length-1){ //Kann nur passieren wenn nicht pausiert
                this.hardwareCommand("onPageEnd")
                this.i++
                this.sendSurveyDataToHW()
                this.sendSurveyDataToAdmin()
                Mousetrap.reset()
                if(this.autoNext !== null)clearTimeout(this.autoNext)
                if(this.autoAnswer !== null)clearTimeout(this.autoAnswer)
                this.progress = parseInt((this.i/(this.survey.length-1))*100)
                if(this.i==(this.survey.length-1)){ //On end of survey
                    if (this.$router.currentRoute.name != this.getNextPage()) {
                        setTimeout(() => {this.$router.push({ name: this.getNextPage(), params: { index: this.i}})},10)
                    }
                    this.$electron.ipcRenderer.send("surveyOps","readyToEnd")
                    clearInterval(this.timer)

                    if(this.receivedCode != ""){
                        this.sendAnswers()
                    }else{
                        this.sendSubjectAndAnswersData()
                    }            
                }else{
                    //Replace all {{subj.propertyname}} instances in content
                    this.addSubjectDataToContent()
                    //Load next Page
                    if (this.$router.currentRoute.name != this.getNextPage()) {
                        setTimeout(() => {this.$router.push({ name: this.getNextPage(), params: { index: this.i}})},10)
                    }
                    window.scrollTo(0,0);
                    //Hardware Command on Page Load
                    this.hardwareCommand("onPageLoad")
                    //Start Timer for Delayed Hardware Command
                    this.hardwareCommand('delayed')

                    //Bind keys
                    this.bindKeys()
                    //Start autonext
                    this.startAutoNext()

                    this.questionTimerStart = process.hrtime.bigint()
                }
            }
        }, 
        bindKeys: function(){
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i], "keys")){
                for(let key in this.survey[this.i].keys){
                    Mousetrap.bind(key, () => {
                        if(this.survey[this.i].keys[key].find((el) => el.includes("setAnswer"))){
                            if(this.survey[this.i].type == "question"){
                                this.sendChildrenAnswers(this.survey[this.i].keys[key].find((el) => el.includes("setAnswer")).split("'")[1])
                            }else{
                                this.updateAnswers(this.survey[this.i].keys[key].find((el) => el.includes("setAnswer")).split("'")[1])
                            }
                        }
                        if(this.survey[this.i].keys[key].includes("continue")){
                            setTimeout(() => {this.nextPage()}, 10)
                        }
                    })
                }
            }
        },
        startAutoNext: function(){
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i], "autoNext")){
                this.autoNext = setTimeout(() => {this.nextPage()}, this.survey[this.i].autoNext.delay)
                if(Object.prototype.hasOwnProperty.call(this.survey[this.i].autoNext, "answer")){   
                    this.autoAnswer = setTimeout(() => {this.updateAnswers()}, this.survey[this.i].autoNext.delay-50)//safety margin of 50ms
                }
            }
        },
        sendChildrenAnswers: function(answer){
            this.$refs.mainChildComponent.addAnswer(answer)
        },
        setSubjectCode: async function(code){
            this.receivedCode = code
            //Set SubjectData to the properties of this subject
            let allSubjects = await this.$electron.ipcRenderer.invoke("getStoreValue", "subjects") 
            //store returns null if subjects dont exist
            if(allSubjects !== null || allSubjects !== undefined){
                for(let i = 0; i < allSubjects.length; i++){
                    if(allSubjects[i].code == this.receivedCode){
                        for(let key in allSubjects[i]){
                            this.subjectData[key] = allSubjects[key]
                        }
                    }
                }
            } 
        },
        /**
         * 
         */
        addSubjectDataToContent: function(){
            if(this.subjectData != null && this.subjectData != {}){
                for(let contentProperty in this.survey[this.i].content){
                    if(typeof this.survey[this.i].content[contentProperty] === "string" || this.survey[this.i].content[contentProperty] instanceof String){
                        for(let subjectProperty in this.subjectData){
                            if(subjectProperty != "_id"){
                                if(this.survey[this.i].content[contentProperty].includes("{{subj."+subjectProperty+"}}")){
                                    this.survey[this.i].content[contentProperty] = this.survey[this.i].content[contentProperty].replace("{{subj."+subjectProperty+"}}", this.subjectData[subjectProperty])
                                }
                            }
                        }
                    }else if(this.survey[this.i].content[contentProperty] == "options" && (this.survey[this.i].content[contentProperty] instanceof Object || typeof this.survey[this.i].content[contentProperty] === "string")){
                        for(let optionProperty in contentProperty){
                            if(typeof this.survey[this.i].content[contentProperty][optionProperty] === "string" || this.survey[this.i].content[contentProperty][optionProperty] instanceof String){
                                for(let subjectProperty in this.subjectData){
                                    if(subjectProperty != "_id"){
                                        if(this.survey[this.i].content[contentProperty][optionProperty].includes("{{subj."+subjectProperty+"}}")){
                                            this.survey[this.i].content[contentProperty][optionProperty] = this.survey[this.i].content[contentProperty][optionProperty].replace("{{subj."+subjectProperty+"}}", this.subjectData[subjectProperty])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        /**
         * 
         */    
        sendSurveyDataToHW: function(){
            this.$electron.ipcRenderer.send("hardware", {"type": "hardwareSendSurveyData", "arg": this.survey[this.i]})           
        },
        /**
         * 
         */
        sendSurveyDataToAdmin: function(){     
            this.$electron.ipcRenderer.send("currentSurveyData", this.survey[this.i])
        },
        /**
         * 
         */    
        hardwareCommand: function(type){
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i], "hardware") && this.survey[this.i].hardware != undefined && this.survey[this.i].hardware != ""){
                if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware, type)){
                    for(let i = 0; i < this.survey[i].hardware[type].length; i++){
                        if(type == "delayed"){
                            setTimeout(() => this.$electron.ipcRenderer.send("hardware", {"type": "command", "device": this.survey[this.i].hardware[type][i].device, "command": this.survey[this.i].hardware[type][i].command}) , this.survey[this.i].hardware[type][i].delayed.seconds * 1000)  
                        }else{
                            this.$electron.ipcRenderer.send("hardware", {"type": "command", "device": this.survey[this.i].hardware[type][i].device, "command": this.survey[this.i].hardware[type][i].command})       
                        }
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
            let curTime = process.hrtime.bigint()

            //If question was a slider or polygraph then split up the answer into seperate ones for each slider
            if(this.survey[this.i].content.type == "slider" || this.survey[this.i].content.type == "polygonGraph"){
                for(let i= 0; i< event.length; i++){
                    this.answers.answers.push({
                        'questionText': this.survey[this.i].content.text,
                        'questionType': this.survey[this.i].content.type,
                        'answer': event[i].value,
                        'module': this.survey[this.i].module,
                        'part': this.survey[this.i].part,
                        "object": this.survey[this.i].object,
                        "name": event[i].name,
                        "timeOnPage": (parseInt(curTime - this.questionTimerStart)/(1_000_000000)),
                    })
                }
            }else{//Just add the answer 
                this.answers.answers.push({
                    'questionText': this.survey[this.i].content.text,
                    'questionType': this.survey[this.i].content.type,
                    'answer': event,
                    'module': this.survey[this.i].module,
                    'part': this.survey[this.i].part,
                    "object": this.survey[this.i].object,
                    "name": this.survey[this.i].content.name,
                    "timeOnPage": (parseInt(curTime - this.questionTimerStart)/(1_000_000000)),
                })
            }
            
            this.$electron.ipcRenderer.send("lastAnswer", this.answers.answers[this.answers.answers.length -1])

            //If the answer defines the subject then add its answer to the subjectdata
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].content, "definesSubject")){
                if(this.survey[this.i].content.definesSubject.length > 0){
                    for(let i = 0; i < this.survey[this.i].content.definesSubject.length; i++){
                        if(this.survey[this.i].content.type == "slider" || this.survey[this.i].content.type == "polygonGraph"){
                            this.subjectData[this.survey[this.i].content.definesSubject[i]] = []
                            for(let o= 0; o< event.length; o++){
                                this.subjectData[this.survey[this.i].content.definesSubject[i]].push(event[o].value)
                            }
                        }else{
                            this.subjectData[this.survey[this.i].content.definesSubject[i]] = event
                        }
                    }
                }
            }
            //Sliders and Polygraphs can have seperate definitions in their sliders, check those here
            if(this.survey[this.i].content.type == "slider"){
                for(let i = 0; i < this.survey[this.i].content.options.length; i++){
                    if(Object.prototype.hasOwnProperty.call(this.survey[this.i].content.options[i], "definesSubject")){
                        if(this.survey[this.i].content.options[i].definesSubject.length > 0){
                            for(let o = 0; o < this.survey[this.i].content.options[i].definesSubject.length; o++){
                                this.subjectData[this.survey[this.i].content.options[i].definesSubject[o]] = event[i]
                            }
                        }
                    }
                }
            }else if(this.survey[this.i].content.type == "polygonGraph"){
                for(let i = 0; i < this.survey[this.i].content.options.sliders.length; i++){
                    if(Object.prototype.hasOwnProperty.call(this.survey[this.i].content.options[i].sliders, "definesSubject")){
                        if(this.survey[this.i].content.options[i].sliders.definesSubject.length > 0){
                            for(let o = 0; o < this.survey[this.i].content.options[i].sliders.definesSubject.length; o++){
                                this.subjectData[this.survey[this.i].content.options[i].sliders.definesSubject[o]] = event[i]
                            }
                        }
                    }
                }
            }
            //answerDelayToNextPage if set
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i], "answerDelayToNextPage")){
                setTimeout(() => this.nextPage(), this.survey[this.i].answerDelayToNextPage)
            }
        },
        /**
         * Send the answers to the adminpage
         */
        sendAnswers: function(){
            this.answers.subject = this.receivedCode
            
            if(this.showElapsedTime){
                let countuphour = document.getElementById('countuphour').innerHTML
                let countupminute = document.getElementById('countupminute').innerHTML 
                let countupsecond = document.getElementById('countupsecond').innerHTML

                this.answers.elapsedSurveyTime = countuphour+":"+countupminute+":"+countupsecond
            }
            this.$electron.ipcRenderer.send("surveyOps", {"arg": "sendAnswers", "answers": this.answers})
        },
        //Generates Subject Code
        generateCode: function(length) {
            let result           = '';
            let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for ( let i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },
        /**
         * Uploads the subjects data and expects a code from the server 
         */
        sendSubjectAndAnswersData: function(){
            if(this.sentsubjectData == false){
                this.sentsubjectData = true
                if(this.receivedCode == ""){
                    this.subjectData._id = crypto.randomUUID()
                    this.subjectData.code = this.generateCode(6)
                    this.receivedCode = this.subjectData.code
                    this.sendAnswers()
                    this.$electron.ipcRenderer.invoke("pushToStoredArray", "subjects", this.subjectData) 
                }
            }
        },
    },
    created(){ 
        /**
         * Called when a Device emits an event. Then its compared to the given reactions in the surveyfile, which will then be executed (if there are any)
         */
        this.$electron.ipcRenderer.on("hardwareEvent", (event,arg) => {
            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware, "input")){
                for(let i = 0; i < this.survey[this.i].hardware.input.length; i++){
                    if((this.survey[this.i].hardware.input[i].device == arg.arg.device || this.survey[this.i].hardware.input[i].device == "*") && this.survey[this.i].hardware.input[i].on == arg.arg.event){
                        //Executes actions on shown pages
                        if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware.input[i], "page")){
                            if(this.survey[this.i].hardware.input[i].page == "nextPage"){
                                this.nextPage()
                            }else if(this.survey[this.i].hardware.input[i].page == "showContinueButton" && this.survey[this.i].type == 'explanationPic'){
                                this.$refs.mainChildComponent.showContinueButton()
                            }
                        //Sends commands back to Hardware
                        }else if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware.input[i], "do")){
                            if(Object.prototype.hasOwnProperty.call(this.survey[this.i].hardware.input[i], "delay")){
                                setTimeout(() => this.$electron.ipcRenderer.invoke("hardwareCommand", {"device": this.survey[this.i].hardware.input[i].do.device, "command": this.survey[this.i].hardware.input[i].do.command}), this.survey[this.i].hardware.input[i].delayed.seconds * 1000)
                            }else{
                                this.$electron.ipcRenderer.invoke("hardwareCommand", {"device": this.survey[this.i].hardware.input[i].do.device, "command": this.survey[this.i].hardware.input[i].do.command})       
                            }
                        }
                    }
                }
            }   
        })

        /**
         * get survey Data from adminpage
         */
        this.$electron.ipcRenderer.send("surveyOps", "getSurveyData")       
        //console.log("Getting SurveyData now")

        /**
         * On Commands from adminpage like pause or end. do the fitting thing
         */
        this.$electron.ipcRenderer.on("surveyOps", (event,arg) => {
            if(arg == "pause"){
                //console.log("Survey pausiert")
                this.paused = true
            }else if(arg == "unpause"){
                //console.log("Survey resumed")
                this.paused = false
            }else if(arg.arg == "sendSurveyData"){
                //console.log("Got SurveyData")
                //console.log(arg.survey)
                this.survey = arg.survey
                this.showElapsedSurvey = arg.showElapsedSurvey
                this.showElapsedTime = arg.showElapsedTime
                this.gotSurvey = true
                this.startSurvey()
                console.log(this.survey)
            }else if(arg == "Beenden"){
                //console.log("Will end soon. Sending Answers now")
                this.answers.subject = this.receivedCode
                
                
                if(this.showElapsedTime){
                    let countuphour = document.getElementById('countuphour').innerHTML
                    let countupminute = document.getElementById('countupminute').innerHTML 
                    let countupsecond = document.getElementById('countupsecond').innerHTML

                    this.answers.elapsedSurveyTime = countuphour+":"+countupminute+":"+countupsecond
                }
                this.$electron.ipcRenderer.send("surveyOps", {"arg": "sendAnswers", "answers": this.answers}) 
                //console.log("Goodbye")
                this.$electron.ipcRenderer.send("surveyOps", "ended")
            }
        })
        //Bind keys
        this.bindKeys()
        //Start autonext
        this.startAutoNext()

        this.questionTimerStart = process.hrtime.bigint()
    },
    destroyed(){    
        this.$electron.ipcRenderer.removeAllListeners()
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