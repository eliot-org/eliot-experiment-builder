<template>
    <div class="admin-survey-wrapper">
        <div class="nav-blocker" v-if="surveyRunning"></div>
        <transition name="fade" mode="out-in">
            <div class="steps-wrapper" v-if="!surveyRunning && !showingAnswers">
                <div class="step-box">
                    <div class="step-header">
                        <div class="step-header-text">Choose Survey</div>
                    </div>
                    <div class="step-content">
                        <v-select label="name" :options="surveyOptions" v-model="surveyChoice" @input="updateSurveyChoice"></v-select>
                    </div>
                </div>
                <transition name="fade" mode="out-in">
                    <div v-if="surveyChoice!=null">
                        <div class="step-box">
                            <div class="step-header">
                                <div class="step-header-text">
                                    Survey Settings
                                </div>
                            </div>
                            <div class="step-content">

                                <div>
                                    <div class="mindChannels-head" style="display: flex">
                                        <span style="margin-top:16px;margin-right:5px">Modules:</span>
                                        <treeselect v-model="modulesToAdd" :multiple="true" :options="modules" style="max-width: 60%; margin-top: 10px"/>
                                        <button class="btn-black" style="max-width: 150px;" id="addModules" @click="addModules()">Add</button>
                                        <button class="btn-black" id="chooseAllModules" @click="chooseAllModules()">Choose All</button>
                                        <!--
                                        <button class="btn-black" id="show-modal" @click="showPrePresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showPrePresetModal" @close="showPrePresetModal = false" @chooseModules="chooseModules('pre', $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, 'pre')" ></presetModal>
                                        -->
                                    </div>  
                                    <div class="mindChannels-checkbox">
                                        <div >
                                            </div>
                                        <draggable v-model="moduleList">
                                            <v-card
                                                style="margin-bottom:5px;"
                                                :hover=true
                                                outlined
                                                v-for="(element, idx) in moduleList" 
                                                :key="idx"
                                            >
                                                <v-card-title>
                                                    {{element.name}}
                                                </v-card-title>
                                                <v-card-text>
                                                    <div style="display: flex; margin-bottom:10px">
                                                        Repeats: 
                                                        <input style="border-style:solid;" type="number" min="1" v-model="element.count">    
                                                    </div>
                                                    
                                                    <div style="margin-bottom:10px; max-width: 100%; display: flex;">
                                                        <div style="float:left; margin-top:10px; margin-right:5px">Objects:</div> 
                                                        <treeselect
                                                            style="float:left; max-width: 90%;"
                                                            :options="objects"
                                                            v-model="element.objects"
                                                            :multiple="true"
                                                            placeholder="Objects..."
                                                            :normalizer="normalizeObjects"
                                                        /> 
                                                    </div>
                                                    <div style="display: flex;">
                                                        <label class="checkbox-label" style="float:left" v-if="element.objects.length > 0">
                                                            <input id="randomizeObj" type="checkbox" v-on:click="element.randomizeObj = !element.randomizeObj">
                                                            <span class="checkbox-custom rectangular"></span>
                                                        </label>
                                                        <div class="checkbox-text" style="float:left; margin-right:25px" v-if="element.objects.length > 0">Randomize Object Order</div>
                                                        
                                                        <label class="checkbox-label" style="float:left">
                                                            <input id="randomizeParts" type="checkbox" v-on:click="element.randomizeParts = !element.randomizeParts">
                                                            <span class="checkbox-custom rectangular"></span>
                                                        </label>
                                                        <div class="checkbox-text" style="float:left">Randomize Part Order</div>
                                                    </div>
                                                    
                                                    <button class="btn-black" style="max-width: 150px" id="addModules" @click="moduleList.splice(idx, 1)">Remove</button>
                                                </v-card-text>
                                            </v-card>
                                        </draggable>
                                    </div>
                                </div>

                                <!--<br><hr><br>

                                <div>
                                    <div>Objects:</div>
                                    <ul class="material-table">
                                        <li class="material-table-element" v-for="(obj, i) in objectsChosen" v-bind:key="i">
                                            {{obj.name}}
                                        </li>
                                    </ul>

                                    <button class="btn-black btn-black-noMarginLeft" id="show-modal" @click="showObjectModal = true">Add Objects</button>
                                    <modal :objects="objects" v-if="showObjectModal" @close="showObjectModal = false" @updateChecked="updateChecked($event)"></modal>
                                    <button class="btn-black" @click="objectsChosen = shuffle(objectsChosen)">Randomize</button>
                                </div>
                                
                                <br><hr><br>

                                <div>
                                    <div class="mindChannels-head">
                                        Phase 1: Premodules
                                        <button class="btn-black" id="chooseAllModules" @click="chooseAllModules('pre')">Choose All</button>
                                        <button class="btn-black" id="show-modal" @click="showPrePresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showPrePresetModal" @close="showPrePresetModal = false" @chooseModules="chooseModules('pre', $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, 'pre')" ></presetModal>
                                    </div>  
                                    
                                    <div class="mindChannels-checkbox">
                                        <treeselect v-model="preModules" :multiple="true" :options="modules" />
                                    </div>
                                </div>
                                <br><hr>
                                <div>
                                    <div class="mindChannels-head">
                                        Phase 2: Looping modules per object
                                        <button class="btn-black" id="chooseAllModules" @click="chooseAllModules('main')">Choose All</button>
                                        <button class="btn-black" id="show-modal" @click="showMainPresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showMainPresetModal" @close="showMainPresetModal = false" @chooseModules="chooseModules('main', $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, 'main')" ></presetModal>
                                    </div>  
                                    
                                    <div class="mindChannels-checkbox">
                                        <treeselect v-model="mainModules" :multiple="true" :options="modules" />
                                    </div>
                                </div>
                                <br><hr>
                                <div>
                                    <div class="mindChannels-head">
                                        Phase 3: Postmodules
                                        <button class="btn-black" id="chooseAllModules" @click="chooseAllModules('post')">Choose All</button>
                                        <button class="btn-black" id="show-modal" @click="showPostPresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showPostPresetModal" @close="showPostPresetModal = false" @chooseModules="chooseModules('post', $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, 'post')" ></presetModal>
                                    </div>  
                                    
                                    <div class="mindChannels-checkbox">
                                        <treeselect v-model="postModules" :multiple="true" :options="modules" />
                                    </div>
                                </div>
                            -->
                            </div>
                        </div>
                    </div>
                </transition>
                <transition name="fade" mode="out-in">
                    <div v-if="surveyChoice!=null">
                        <div class="step-box">
                            <div class="step-header">
                                <div class="step-header-text">Specific Settings</div>
                            </div>
                            <div class="step-content">
                                <div>
                                    <div class="surveySettings-name">Experimenter:</div>
                                    <input style="border-style:solid;" class="surveySettings-input" v-bind:disabled="surveyChoice==null" type="text" name="experimenter" v-model="experimenter">
                                </div>
                                <div>
                                    <div class="surveySettings-name">Assistant:</div>
                                    <input style="border-style:solid;" class="surveySettings-input" v-bind:disabled="surveyChoice==null" type="text" name="assistant" v-model="assistant">
                                </div>
                                <div>
                                    <div class="surveySettings-name">Studyname:</div>
                                    <input style="border-style:solid;" class="surveySettings-input" v-bind:disabled="surveyChoice==null" type="text" name="studyname" v-model="studyname">
                                </div>
                            </div>
                        </div>

                        <div class="step-box">
                            <div class="step-header">
                                <div class="step-header-text">Miscellaneous Settings</div>
                            </div>
                            <div class="step-content" style="display: grid">
                                <div style="height: 25px">
                                    <label class="checkbox-label" style="float:left">
                                        <input id="randomizeParts" type="checkbox" v-on:click="showElapsedTime = !showElapsedTime">
                                        <span class="checkbox-custom rectangular"></span>
                                    </label>
                                    <div class="checkbox-text" style="float:left">Show elapsed time</div>
                                </div>
                                <div style="height: 25px">
                                    <label class="checkbox-label" style="float:left">
                                        <input id="randomizeParts" type="checkbox" v-on:click="showElapsedSurvey = !showElapsedSurvey">
                                        <span class="checkbox-custom rectangular"></span>
                                    </label>
                                    <div class="checkbox-text" style="float:left">Show elapsed survey</div>
                                </div>
                                <div style="height: 40px">
                                    <div class="surveySettings-name">Choose Display:</div>
                                    <v-select label="name" :options="displays" v-model="externalDisplay" class="selector" @input="updateExternalDisplay" style="margin-left:25%"></v-select>
                                </div>
                            </div>
                        </div>
                        <button @click="startSurvey()" v-if="!surveyRunning" class="btn-black btn-black-noMarginLeft">Start Survey</button>{{computeError}}
                    </div>
                </transition>
            </div>
        </transition>
        <div class="surveyControl" v-if="surveyRunning">
            <button class="btn-black" @click="abortSurvey()">Abort Survey</button>
            <button class="btn-black" @click="pauseSurvey()">{{surveyPaused ? "Continue" : "Pause"}} Survey</button>
            <button class="btn-black" v-if="manualChannel != null" @click="confirmManualStep()">Confirm Manual Step {{manualChannel}}</button>
            <div>
                   </div>
            <p>Press Ctrl+P to pause</p>
            <p>Press Ctrl+B to confirm a manual step</p>
            <div>
                <div v-if="currentSurveyData !== {} && !showingAnswers">
                    <b>Current Surveypage Data:</b><br>
                    <vue-json-pretty :path="'survey'" :data="currentSurveyData"></vue-json-pretty>
                </div>
                
                <div v-if="lastAnswer !== {} && !showingAnswers">
                    <b>Last Answer:</b><br>
                    <vue-json-pretty :path="'answer'" :data="lastAnswer"></vue-json-pretty>
                </div>
            </div>
            <div v-if="showingAnswers" class="answers-div">
                <br><hr style="width:100%"><br>
                <b>Answers:</b><br>
                <vue-json-pretty :path="'res'" :data="answers"> </vue-json-pretty>
                <br><button class="btn-black" @click="saveAnswers()">Save Answers again</button><br>
                Answers Saved
            </div>
        </div>
    </div>
</template>

<script>
    import materialModal from './AdminSurvey/objectModal'
    import presetModal from './AdminSurvey/presetModal'
    import draggable from "vuedraggable";
    export default {
        components: { 
            "modal": materialModal,
            "presetModal": presetModal,
            "draggable": draggable,
        },
        data: function( ){
            return{
                answersSent: false,
                autosave: false,

                answers: {},
                showingAnswers: false,

                surveyRunning: false,
                surveyPaused: false,

                manualChannel: null,

                //preModules: [],
                //mainModules:[],
                //postModules:[],
                modules: [],

                //objectsChosen: [],
                //objects: [],
                //showObjectModal: false,

                surveyOptions: [],
                surveyChoice: null,

                experimenter: "",
                assistant: "",
                studyname: "",

                displays: [],
                unprocessedDisplays: [],
                externalDisplay: {},

                //surveyPresets: [],

                computedSurvey: [],
                computeError: "",
                
                //presets: [],
                //showPrePresetModal: false,
                //showMainPresetModal: false,
                //showPostPresetModal: false,

                currentSurveyData: {},
                lastAnswer: {},

                moduleList: [],
                modulesToAdd: [],

                showElapsedSurvey: false,
                showElapsedTime: false,
            }
        },
        methods:{
            normalizeObjects(node) {
                return {
                    id: node._id,
                    label: node.name
                }
            }, 
            chooseAllModules: function(){
                this.moduleList = []
                for(let i = 0; i < this.modules.length; i++){
                    this.moduleList.push(
                        {
                            name: this.modules[i].id,
                            count: 1,
                            objects: [],
                            randomizeObj: false,
                            randomizeParts: false,
                        }        
                    )
                }
            },
            addModules: function(){
                for(let i in this.modulesToAdd){
                    this.moduleList.push(
                        {
                            name: this.modulesToAdd[i],
                            count: 1,
                            objects: [],
                            randomizeObj: false,
                            randomizeParts: false,
                        }        
                    )
                }
                this.modulesToAdd = []
            },
            /*chooseModules: function(area, preset){
                for(let y = 0; y < preset.modules.length; y++){
                    for(let i = 0; i< this.modules.length;i++){
                        if(this.modules[i].id == preset.modules[y]){
                            if(area == "pre"){
                                this.preModules.push(this.modules[i].id)
                            }else if(area == "main"){
                                this.mainModules.push(this.modules[i].id)
                            }else if(area == "post"){
                                this.postModules.push(this.modules[i].id)
                            }
                        }else if(Object.prototype.hasOwnProperty.call(this.modules[i],"children")){
                            for(let x = 0; x< this.modules[i].children.length;x++){
                                if(this.modules[i].children[x].id == preset.modules[y]){
                                    if(area == "pre"){
                                        this.preModules.push(this.modules[i].children[x].id)
                                    }else if(area == "main"){
                                        this.mainModules.push(this.modules[i].children[x].id)
                                    }else if(area == "post"){
                                        this.postModules.push(this.modules[i].children[x].id)
                                    }
                                }
                            }
                        }
                    }
                }
            },*/
            updateSurveyChoice: function(value){
                //Setze Surveychoice
                if(value == null){
                    this.surveyChoice = null
                    this.modules = []
                    //this.modulesChosen = []
                    this.moduleList = []
                    this.modulesToAdd = []
                }else{
                    this.surveyChoice = this.getSurveyPreset(value._id)
                    this.modules = this.surveyChoice.modules
                    this.moduleList = []
                    this.modulesToAdd = []
                    //this.modulesChosen = []
                }
            },
            getSurveyPreset: function(id){
                for(var i=0; i<this.surveyPresets.length; i++){
                    if(this.surveyPresets[i]._id == id){
                        return this.surveyPresets[i]
                    }
                }
                return null
            },
            startSurvey: function(){
                var returnVal = this.computeSurvey()
                if(returnVal == "success"){
                    //console.log(this.computedSurvey)
                    this.$electron.ipcRenderer.send("surveyOps", "start")
                }else{
                    this.computeError = returnVal
                }
            },
            addObjectDataToContent: function(content, object){
                for(let contentProperty in content){
                    //Check for every property of the object if it is mentioned in the content of the question, If yes then insert the right value
                    if(typeof content[contentProperty] === "string" || content[contentProperty] instanceof String){
                        for(let objectProperty in object){
                            if(objectProperty != "_id"){
                                if(content[contentProperty].includes("{{obj."+objectProperty+"}}")){
                                    content[contentProperty] = content[contentProperty].replace("{{obj."+objectProperty+"}}", object[objectProperty])
                                }
                            }
                        }
                    //Look one step deeper. Only needed if type is question and has options
                    }else if(contentProperty == "options" && (content[contentProperty] instanceof Object || typeof content[contentProperty] === "string")){
                        for(let optionProperty in content[contentProperty]){
                            if(typeof content[contentProperty][optionProperty] === "string" || content[contentProperty][optionProperty] instanceof String){
                                for(let objectProperty in object){
                                    if(objectProperty != "_id"){
                                        if(content[contentProperty][optionProperty].includes("{{obj."+objectProperty+"}}")){
                                            content[contentProperty][optionProperty] = content[contentProperty][optionProperty].replace("{{obj."+objectProperty+"}}", object[objectProperty])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return content
            },
            computeSurvey: function(){
                if((this.moduleList == [] || this.moduleList.length <= 0)){
                    return "Not enough questions selected"
                }
                /*if(this.objectsChosen.length <= 0 || this.objectsChosen == null){
                    return "Atleast one object has to be selected"
                }*/
                this.computedSurvey = []
                for(let i = 0; i < this.moduleList.length; i++){
                    for(let r = 0; r < parseInt(this.moduleList[i].count); r++){
                        let tmp = []
                        if(this.moduleList[i].objects.length > 0){
                            let tmpByObj = []
                            for(let o = 0; o < this.moduleList[i].objects.length; o++){
                                let fromSurvey = this.surveyChoice.survey.filter((el) => (el.module === this.moduleList[i].name || el.part === this.moduleList[i].name))
                                let tmpThisObj = []
                                for(let s = 0; s < fromSurvey.length; s++){
                                    let tmpQuestion = {
                                        "object": JSON.parse(JSON.stringify(this.objects.find((el) => el._id === this.moduleList[i].objects[o]))), 
                                        "nextObject": (o < this.moduleList[i].objects.length-1) ? JSON.parse(JSON.stringify(this.moduleList[i].objects[o+1])) : "",  
                                        "hardware": Object.prototype.hasOwnProperty.call(fromSurvey[s], "hardware") ? JSON.parse(JSON.stringify(fromSurvey[s].hardware)) : {},
                                        "module": fromSurvey[s].module, 
                                        "part": fromSurvey[s].part,
                                        "type": fromSurvey[s].type, 
                                        "content": this.addObjectDataToContent(JSON.parse(JSON.stringify(fromSurvey[s].content)), this.objects.find((el) => el._id === this.moduleList[i].objects[o]))
                                    }
                                    if(Object.prototype.hasOwnProperty.call(fromSurvey[s], "keys")){
                                        tmpQuestion.keys = fromSurvey[s].keys
                                    }
                                    if(Object.prototype.hasOwnProperty.call(fromSurvey[s], "autoNext")){
                                        tmpQuestion.autoNext = fromSurvey[s].autoNext
                                    }
                                    if(Object.prototype.hasOwnProperty.call(fromSurvey[s], "answerDelayToNextPage")){
                                        tmpQuestion.answerDelayToNextPage = fromSurvey[s].answerDelayToNextPage
                                    }
                                    
                                    tmpThisObj.push(tmpQuestion)
                                }
                                if(this.moduleList[i].randomizeParts){
                                    //Get all unique parts in current module
                                    let parts = tmpThisObj.map((el) => el.part).filter((value, index, array) => array.indexOf(value) === index)
                                    this.shuffle(parts)
                                    tmpThisObj = parts.map((el) => tmpThisObj.filter((tmpEl) => tmpEl.part === el)).flat()//Order tmp by parts
                                }
                                tmpByObj.push(tmpThisObj)
                            }
                            if(this.moduleList[i].randomizeObj){
                                tmpByObj = this.shuffle(tmpByObj)
                            }
                            tmp = tmpByObj.flat()
                        }else{
                            let fromSurvey = this.surveyChoice.survey.filter((el) => (el.module === this.moduleList[i].name || el.part === this.moduleList[i].name))
                            for(let s = 0; s < fromSurvey.length; s++){
                                let tmpQuestion = {
                                    "object": "", 
                                    "nextObject": "",  
                                    "hardware": Object.prototype.hasOwnProperty.call(fromSurvey[s], "hardware") ? JSON.parse(JSON.stringify(fromSurvey[s].hardware)) : {},
                                    "module": fromSurvey[s].module, 
                                    "part": fromSurvey[s].part,
                                    "type": fromSurvey[s].type, 
                                    "content": fromSurvey[s].content
                                }
                                if(Object.prototype.hasOwnProperty.call(fromSurvey[s], "keys")){
                                    tmpQuestion.keys = fromSurvey[s].keys
                                }
                                if(Object.prototype.hasOwnProperty.call(fromSurvey[s], "autoNext")){
                                    tmpQuestion.autoNext = fromSurvey[s].autoNext
                                }
                                if(Object.prototype.hasOwnProperty.call(fromSurvey[s], "answerDelayToNextPage")){
                                    tmpQuestion.answerDelayToNextPage = fromSurvey[s].answerDelayToNextPage
                                }
                                tmp.push(tmpQuestion)
                            }
                        }
                        if(this.moduleList[i].randomizeParts){
                            //Get all unique parts in current module
                            let parts = tmp.map((el) => el.part).filter((value, index, array) => array.indexOf(value) === index)
                            this.shuffle(parts)
                            tmp = parts.map((el) => tmp.filter((tmpEl) => tmpEl.part === el)).flat()//Order tmp by parts
                        }
                        this.computedSurvey.push(...tmp)
                    }
                }

                //Adds Pre Modules
                /*for(let y = 0; y < this.surveyChoice.survey.length; y++){
                    if(this.preModules.includes(this.surveyChoice.survey[y].module) || this.preModules.includes(this.surveyChoice.survey[y].part)){
                        this.computedSurvey.push({
                            "object": "", 
                            "nextObject": "", 
                            "hardware": Object.prototype.hasOwnProperty.call(this.surveyChoice.survey[y], "hardware") ? JSON.parse(JSON.stringify(this.surveyChoice.survey[y].hardware)) : {}, 
                            "module": this.surveyChoice.survey[y].module, 
                            "part": this.surveyChoice.survey[y].part,
                            "type": this.surveyChoice.survey[y].type,
                            "content": JSON.parse(JSON.stringify(this.surveyChoice.survey[y].content))
                        })//Subject Data at runtime!
                    }
                }
                //Loop through selected Objects
                for(let x = 0; x < this.objectsChosen.length; x++){
                    //Loop through selected Survey
                    for(let z = 0; z < this.mainModules.length; z++){
                        //Check if Module or part were selected
                        for(let y = 0; y < this.surveyChoice.survey.length; y++){
                            if((this.mainModules[z] == this.surveyChoice.survey[y].module) || this.mainModules[z] == this.surveyChoice.survey[y].part){
                                this.computedSurvey.push({
                                    "object": JSON.parse(JSON.stringify(this.objectsChosen[x])), 
                                    "nextObject": (x < this.objectsChosen.length-1) ? JSON.parse(JSON.stringify(this.objectsChosen[x+1])) : "",  
                                    "hardware": Object.prototype.hasOwnProperty.call(this.surveyChoice.survey[y], "hardware") ? JSON.parse(JSON.stringify(this.surveyChoice.survey[y].hardware)) : {},
                                    "module": this.surveyChoice.survey[y].module, 
                                    "part": this.surveyChoice.survey[y].part,
                                    "type": this.surveyChoice.survey[y].type, 
                                    "content": this.addObjectDataToContent(JSON.parse(JSON.stringify(this.surveyChoice.survey[y].content)), this.objectsChosen[x])
                                })
                            }
                        }
                    }
                }
                //Adds Post Modules
                for(let y = 0; y < this.surveyChoice.survey.length; y++){
                    if((this.postModules.includes(this.surveyChoice.survey[y].module) == true) || this.postModules.includes(this.surveyChoice.survey[y].part) == true){
                        this.computedSurvey.push({
                            "object": "",
                            "nextObject": "",
                            "hardware": this.surveyChoice.survey[y].hardware,
                            "module": this.surveyChoice.survey[y].module,
                            "part": this.surveyChoice.survey[y].part,
                            "type": this.surveyChoice.survey[y].type,
                            "content": this.surveyChoice.survey[y].content
                        })
                    }
                }*/
                //console.log(this.computedSurvey)
                for(let i = 0; i < this.moduleList.length; i++){
                    this.moduleList[i].randomizeObj = false
                    this.moduleList[i].randomizeParts = false
                }
                return "success"
            }, 
            /*updateChecked: function(obj){
                if(this.findInArray(obj, this.objectsChosen) != null){
                    this.objectsChosen = this.objectsChosen.filter(el => el != obj)
                }else{
                    this.objectsChosen.push(obj)
                }
            },*/
            findInArray: function(obj, arr){
                for(var i=0; i<arr.length; i++){
                    if(arr[i] == obj){
                        return i
                    }
                }
                return null
            },
            abortSurvey: function(){
                if(this.surveyRunning){
                    this.$electron.ipcRenderer.send("surveyOps", "abort")
                }
            },
            pauseSurvey: function(){
                if(this.surveyRunning){
                    if(!this.surveyPaused){
                        this.$electron.ipcRenderer.send("surveyOps", "pause")
                    }else{
                        this.$electron.ipcRenderer.send("surveyOps", "unpause")
                    }
                }
            },
            confirmManualStep: function(){
                if(this.manualChannel == "Beenden"){
                    this.$electron.ipcRenderer.send("surveyOps", this.manualChannel)
                }else{
                    this.$electron.ipcRenderer.send("surveyChannel", this.manualChannel)
                }
                this.manualChannel = null
            },
            loadSurveys: async function(){
                this.surveyPresets = await this.$electron.ipcRenderer.invoke('getStoreValue', 'surveys')
                if(this.surveyPresets === null || this.surveyPresets === undefined){
                    this.surveyPresets = []
                }

                for(let i=0; i<this.surveyPresets.length; i++){
                    this.surveyOptions.push({"_id": this.surveyPresets[i]._id, "name": this.surveyPresets[i].name})
                } 
            },
            loadObjects: async function(){
                this.objects = await this.$electron.ipcRenderer.invoke("getStoreValue", "objects") 
                if(this.objects === null || this.objects === undefined){
                    this.objects = []
                }
            },
            /*loadPresets: async function(){
                this.presets = await this.$electron.ipcRenderer.invoke("getStoreValue", "presets") 
                if(this.presets === null || this.presets === undefined){
                    this.presets = []
                }
                console.log(this.presets)
            },
            addPreset: function(name, area){
                if(name != ""){
                    if(area == "pre" && this.preModules.length > 0){
                        this.presets.push({"name": name, "modules": this.preModules, "id": crypto.randomUUID()})
                    }else if(area == "main" && this.mainModules.length > 0){
                        this.presets.push({"name": name, "modules": this.mainModules, "id": crypto.randomUUID()})
                    }else if(area == "post" && this.postModules.length > 0){
                        this.presets.push({"name": name, "modules": this.postModules, "id": crypto.randomUUID()})
                    }
                    this.$electron.ipcRenderer.invoke("setStoreValue", "presets", this.presets) 
                }
            },
            deletePreset: function(toDelete){
                for(let i = 0; i < this.presets.length; i++){
                    if(this.presets[i].id === toDelete.id){
                        this.presets.splice(i,1)
                        this.$electron.ipcRenderer.invoke("setStoreValue", "presets", this.presets) 
                    }
                }
            },*/
            saveAnswers: function(){
                if(this.answersSent == false){
                    this.answersSent = true
                    setTimeout(this.answersSent = false, 1000)
                    if(this.experimenter != ""){
                        this.answers.experimenter = this.experimenter
                    }
                    if(this.assistant != ""){
                        this.answers.assistant = this.assistant
                    }
                    if(this.studyname != ""){
                        this.answers.studyname = this.studyname
                    }
                    this.answers._id = crypto.randomUUID()
                    this.answers.showElapsedSurvey = this.showElapsedSurvey
                    this.answers.showElapsedTime = this.showElapsedTime
                    
                    this.$electron.ipcRenderer.invoke("pushToStoredArray", "measurements", this.answers) 
                }
            },
            shuffle(array){//Fisher-Yates Shuffle
                var currentIndex = array.length, temporaryValue, randomIndex;
                while (0 !== currentIndex) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    //array[currentIndex] = array[randomIndex];
                    this.$set(array, currentIndex, array[randomIndex])
                    //array[randomIndex] = temporaryValue;
                    this.$set(array, randomIndex, temporaryValue)
                }
                return array;
            },
            updateExternalDisplay(){
                this.$electron.ipcRenderer.send("displays", {"arg": "setExternalDisplay","externalDisplay":this.unprocessedDisplays[this.externalDisplay.id]})
            }
        },
        destroyed(){    
            this.$electron.ipcRenderer.removeAllListeners()
        },
        mounted: function(){
            this.$electron.ipcRenderer.on("surveyOps", (event,arg) => {//Wenn eine Meldung vom Host kommt was mit der Survey passiert
                if(arg == "opened"){//wenn die Umfrage geöffnet wurde
                    //console.log("Survey geöffnet")
                    this.surveyRunning = true
                }else if(arg == "pause"){//Wenn pausiert wurde
                    //console.log("Survey pausiert")
                    this.surveyPaused = true
                }else if(arg == "unpause"){//Wenn unpaused wurde
                    //console.log("Survey resumed")
                    this.surveyPaused = false
                }else if(arg == "aborted"){//Wenn abgebrochen oder beendet wurde dann alles zurücksetzen
                    //console.log("Survey arborted")
                    this.surveyPaused = false
                    this.surveyRunning = false
                    this.answers = {}
                    this.showingAnswers = false
                    this.manualChannel = null
                    this.autosave = false
                    this.answersSent = false
                }else if(arg == "getSurveyData"){//Wenn die Umfrage angefragt wird. Dann wirds an Umfragefenster geschickt
                    //console.log("Sending SurveyData now")
                    this.$electron.ipcRenderer.send("surveyOps", {
                        "arg": "sendSurveyData", 
                        "survey": this.computedSurvey, 
                        "showElapsedSurvey": this.showElapsedSurvey,
                        "showElapsedTime": this.showElapsedTime,
                    })
                }else if(arg == "readyToEnd"){//User hat Umfrageende erreicht. Umfrage kann jetzt beendet werden. Zeige Button dafür
                    //console.log("Ready to End")
                    this.manualChannel = "Beenden"
                }else if(arg.arg == "sendAnswers"){//Antworten werden erhalten und lokal gespeichert. Dann Übersicht anzeigen
                    //console.log("Got Answers")
                    this.answers = arg.answers
                    this.showingAnswers = true
                    if(this.autosave == false){
                        this.autosave = true
                        this.saveAnswers()
                    }
                }else if(arg == "ended"){
                    //console.log("Survey ended gracefully")
                    this.surveyPaused = false
                    this.surveyRunning = false
                    this.autosave = false
                }else if(arg == "confirmManualStep"){
                    this.confirmManualStep()
                }
            })

            this.$electron.ipcRenderer.on("surveyChannel", (event,arg) => {
                //console.log("Channel Message received. Will show button now")
                this.manualChannel = arg
            })

            this.$electron.ipcRenderer.on("displays", (event,arg) => {
                if(Object.prototype.hasOwnProperty.call(arg,"displays")){
                    this.displays = [] 
                    for(var i = 0; i < arg.displays.length; i++){
                        this.displays.push({"name": "x: "+JSON.parse(JSON.stringify(arg.displays[i].bounds.x))+", y: "+JSON.parse(JSON.stringify(arg.displays[i].bounds.y))+", width: "+JSON.parse(JSON.stringify(arg.displays[i].bounds.width))+", height: "+JSON.parse(JSON.stringify(arg.displays[i].bounds.height)), "id":i})
                    }
                    this.unprocessedDisplays = JSON.parse(JSON.stringify(arg.displays))
                }else if(Object.prototype.hasOwnProperty.call(arg,"externalDisplay")){
                    //this.externalDisplay = arg.externalDisplay
                    //console.log(arg.externalDisplay)
                }
            })

            
            this.$electron.ipcRenderer.on("currentSurveyData", (event,arg) => {
                //console.log("Channel Message received. Will update currentSurveyData")
                this.currentSurveyData = arg
            })
            this.$electron.ipcRenderer.on("lastAnswer", (event,arg) => {
                //console.log("Channel Message received. Will update lastAnswer")
                this.lastAnswer = arg
            })

            this.$electron.ipcRenderer.send("displays", {"arg": "getDisplays"})
            this.loadSurveys()
            this.loadObjects()
            //this.loadPresets()
        }
    }
</script>

<style scoped>
    .answers-div{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .nav-blocker{
        width:100%;
        height:63px;
        position:absolute;
        top:0px;
        background:black;
        opacity: 0.5;
    }
    .admin-survey-wrapper{
        width:100%;
    }

    .steps-wrapper{
        width:85%;
        margin:0 auto;
    }

    .fade-enter-active, .fade-leave-active {
		transition: opacity .5s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
    }
    
    .step-box{
        margin-top: 25px;
        border: 1px solid #000000;

    }

    .step-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .step-header-text{
        padding-top:3px;
        padding-left:15px;
    }

    .step-content{
        padding:15px;
    }

    .surveySettings-name{
        width: 25%;
        float: left;
    }

    .surveySettings-input{
        width:75%;
    } 
    
    .mindChannels-head{
        margin-bottom:15px;
    }

    .mindChannels-checkbox{
        margin-left:15px;
    }

    .checkbox-wrapper{
        display:flex;
        margin-bottom: 15px;
        position: relative;
        width: min-content;
    }

    .checkbox-text{
        margin-left: 15px;
    }


    .checkbox-label {
        display: block;
        position: relative;
        cursor: pointer;
        font-size: 22px;
        line-height: 20px;
        height: 20px;
        width: 20px;
        clear: both;
    }

    .checkbox-label input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    .checkbox-label .checkbox-custom {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 20px;
        width: 20px;
        background-color: transparent;
        border-radius: 5px;
        transition: all 0.3s ease-out;
        border: 2px solid #212529;
    }


    .checkbox-label input:checked ~ .checkbox-custom {
        background-color: #212529;
        border-radius: 5px;
        transform: rotate(0deg) scale(1);
        opacity:1;
        border: 2px solid #212529;
    }


    .checkbox-label .checkbox-custom::after {
        position: absolute;
        content: "";
        left: 12px;
        top: 12px;
        height: 0px;
        width: 0px;
        border-radius: 5px;
        border: solid #f9f9f9;
        border-width: 0 3px 3px 0;
        transform: rotate(0deg) scale(0);
        opacity:1;
        }


    .checkbox-label input:checked ~ .checkbox-custom::after {
        transform: rotate(45deg) scale(1);
        opacity:1;
        left: 4px;
        top: 0px;
        width: 6px;
        height: 11px;
        border: solid #f9f9f9;
        border-width: 0 2px 2px 0;
        background-color: transparent;
        border-radius: 0;
    }

    .btn-black{
        padding: 0rem 0rem;
        font-size:0.8rem;
        width:150px;
        height:35px;
        color:#ffffff;
        margin:10px;
    }
    
    .btn-black-noMarginLeft{
        margin-left: 0px;
    }

    .surveyControl{
        margin: 0 auto;
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .material-table-element{
        margin-left:20px;
    }

    .DraggableButton {
        margin-top: 35px;
    }
    .DraggableHandle {
        float: left;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    .DraggableClose {
    float: right;
    padding-top: 8px;
    padding-bottom: 8px;
    }

    .DraggableText {
        margin: 20px;
    }

    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {  
        opacity: 1;
    }
</style>