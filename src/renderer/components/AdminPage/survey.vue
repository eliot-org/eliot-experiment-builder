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
                                    <div>Objects:</div>
                                    <ul class="material-table">
                                        <li class="material-table-element" v-for="(obj, i) in objectsChosen" v-bind:key="i">
                                            {{obj.name}}
                                        </li>
                                    </ul>

                                    <button class="btn-black btn-black-noMarginLeft" id="show-modal" @click="showModal = true">Add Objects</button>
                                    <modal :objects="objects" v-if="showModal" @close="showModal = false" @updateChecked="updateChecked($event)"></modal>
                                    <button class="btn-black" @click="objectsChosen = shuffle(objectsChosen)">Randomize</button>
                                </div>
                                
                                <br><hr><br>

                                <div>
                                    <div class="mindChannels-head">
                                        Choose non-repeating modules that are before the loop
                                        <button class="btn-black" id="chooseAllModules" @click="chooseModules(0, [])">Choose All</button>
                                        <button class="btn-black" id="show-modal" @click="showPresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showPresetModal" @close="showPresetModal = false" @chooseModules="chooseModules(6, $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, modulesChosen)" ></presetModal>
                                    </div>  
                                    
                                    <div class="mindChannels-checkbox">
                                        <treeselect v-model="modulesChosen" :multiple="true" :options="modules" />
                                    </div>
                                </div>
                                <br><hr>
                                <div>
                                    <div class="mindChannels-head">
                                        Choose modules that are repeated per object
                                        <button class="btn-black" id="chooseAllModules" @click="chooseModules(0, [])">Choose All</button>
                                        <button class="btn-black" id="show-modal" @click="showPresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showPresetModal" @close="showPresetModal = false" @chooseModules="chooseModules(6, $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, modulesChosen)" ></presetModal>
                                    </div>  
                                    
                                    <div class="mindChannels-checkbox">
                                        <treeselect v-model="modulesChosen" :multiple="true" :options="modules" />
                                    </div>
                                </div>
                                <br><hr>
                                <div>
                                    <div class="mindChannels-head">
                                        Choose non-repeating modules that are after the loop
                                        <button class="btn-black" id="chooseAllModules" @click="chooseModules(0, [])">Choose All</button>
                                        <button class="btn-black" id="show-modal" @click="showPresetModal = true">Presets</button>
                                        <presetModal :presets="presets" v-if="showPresetModal" @close="showPresetModal = false" @chooseModules="chooseModules(6, $event)" @deletePreset="deletePreset($event)" @addPreset="addPreset($event, modulesChosen)" ></presetModal>
                                    </div>  
                                    
                                    <div class="mindChannels-checkbox">
                                        <treeselect v-model="modulesChosen" :multiple="true" :options="modules" />
                                    </div>
                                </div>
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
                                    <input class="surveySettings-input" v-bind:disabled="surveyChoice==null" type="text" name="versuchsleiter" v-model="versuchsleiter">
                                </div>
                                <div>
                                    <div class="surveySettings-name">Assistant:</div>
                                    <input class="surveySettings-input" v-bind:disabled="surveyChoice==null" type="text" name="assistenz" v-model="assistenz">
                                </div>
                                <div>
                                    <div class="surveySettings-name">Studyname:</div>
                                    <input class="surveySettings-input" v-bind:disabled="surveyChoice==null" type="text" name="studie" v-model="studie">
                                </div>
                            </div>
                        </div>

                        <div class="step-box">
                            <div class="step-header">
                                <div class="step-header-text">Miscellaneous Settings</div>
                            </div>
                            <div class="step-content">
                                <div>
                                    <div class="surveySettings-name">Choose Display:</div>
                                    <v-select label="name" :options="displays" v-model="externalDisplay" class="selector" @input="updateExternalDisplay" style="margin-left:25%"></v-select>
                                </div>
                            </div>
                        </div>
                        <button @click="startSurvey()" v-if="!surveyRunning" class="btn-black btn-black-noMarginLeft">Start Survey</button>{{computeError}}
                    </div>
                </transition>
            </div>
            <div v-if="showingAnswers">
                {{answers}}
                <br><button class="btn-black" @click="saveAnswers()">Antworten speichern</button><br>
                Status: {{answerSaveStatus}}
                <br>("Status: Created" ist gewünscht)
            </div>
        </transition>
        <div class="surveyControl" v-if="surveyRunning">
            <button class="btn-black" @click="abortSurvey()">Umfrage abbrechen</button>
            <button class="btn-black" @click="pauseSurvey()">Umfrage {{surveyPaused ? "fortsetzen" : "pausieren"}}</button>
            <button class="btn-black" v-if="manualChannel != null" @click="confirmManualStep()">Manuellen Schritt {{manualChannel}} bestätigen</button>
            <div>
                   </div>
            <p>Zum Pausieren der Umfrage Strg+P drücken</p>
            <p>Zum Bestätigen eines manuellen Schrittes Strg+B drücken</p>
            Roboter verbunden: {{robotConnected}}<br>
            <div v-if="robotConnected">
                Roboternachrichten: {{robotConsole}}<br>
                Lade Programm: <input type="text" v-model="programm" class="input">
                <button class="button" @click="loadProgram('load')">Lade</button><br>
                <button class="button" @click="command('play')">Play</button><br>
                <button class="button" @click="command('stop')">Stop</button><br>
                <button class="button" @click="command('pause')">Pause</button><br>
                <button class="button" @click="command('status')">Status</button><br>
                <button class="button" @click="command('programState')">Programmzustand</button><br>
                <button class="button" @click="command('running')">Läuft?</button><br>
            </div>
        </div>
    </div>
</template>

<script>
    import materialModal from './AdminSurvey/objectModal'
    import presetModal from './AdminSurvey/presetModal'
    const countrynames = require("countrynames")
    const fs = require('fs')
    export default {
        components: { 
            "modal": materialModal,
            "presetModal": presetModal,
        },
        props:{

        },
        data: function( ){
            return{
                answersSent: false,
                programm: "",

                autosave: false,

                robotConnected: false,
                robotConsole: "",

                answers: {},
                answerSaveStatus: "",
                showingAnswers: false,

                surveyRunning: false,
                surveyPaused: false,

                manualChannel: null,

                showModal: false,
                modulesChosen: [],
                modules: [],

                objectsChosen: [],
                objects: [],

                surveyOptions: [],
                surveyChoice: null,

                versuchsleiter: "Leander",
                assistenz: "",
                studie: "",

                displays: [],
                unprocessedDisplays: [],
                externalDisplay: {},

                surveyPresets: [{"id": 0, "name": "Umfrage Lang",
                        "modules": [{"id": "Optik", "label":"Optik", "children": [{"id":"T1_Optik","label":"T1"}, {"id":"T2_Optik","label":"T2"},{"id":"T3_Optik","label":"T3"},{"id":"T4_Optik","label":"T4"}]},
                                {"id":"Akustik","label":"Akustik","children":[{"id":"T1_Akustik","label":"T1"}]},
                                {"id":"Olfaktorik","label":"Olfaktorik","children":[{"id":"T1_Olfaktorik","label":"T1"}]},
                                {"id":"Haptik","label":"Haptik","children":[{"id":"T1_Haptik","label":"T1"}]}], 
                        "survey":
                        [{"module": "Akustik", "part": "T1_Akustik", "type": "question", "condition": "", "content": {"type": "yes-no", "text": "Hast du eine Assoziation zu dem Material?", "options":["JA","NEIN"]}},
                        {"module": "Akustik", "part": "T1_Akustik", "type": "question", "condition": "0.true", "content": {"type": "checkbox","text": "Woher?", "options": ["Arbeit", "Nachrichten", "Internet", "Werbung"]}},
                        {"module": "Akustik", "part": "T1_Akustik", "type": "summary", "condition": "", "content": {"text": "Hier haben sie eine Übersicht über ihre zuvor gegebenen Antworten"}},
                        {"module": "Optik", "part": "T1_Optik", "type": "question", "condition": "", "content": {"type": "checkbox","text": "Welche der folgenden Automarken kennen Sie?", "options":["Tesla","VW","Audi","BMW","Ford","Fiat"]}},
                        {"module": "Optik", "part": "T2_Optik", "type": "question", "condition": "", "content": {"type": "checkbox","text": "Welche der folgenden Namen haben Sie?", "options": ["Tom","Jan","Alfons","Brand","Fred","Fisto","Fisto","Fisto","Fisto","Fisto","Fisto","Fisto"]}},
                        {"module": "Optik", "part": "T2_Optik", "type": "question", "condition": "", "content": {"type": "radio","text": "Wie alt sind sie?", "options":["17 Jahre oder Jünger", "18-20", "21-29", "30-39", "40-49", "50-59", "60+"]}},
                        {"module": "Optik", "part": "T2_Optik", "type": "question", "condition": "", "content": {"type": "slider","text": "Wie würdest du deinen ersten visuellen Eindruck anhand der folgenden praktischen Eigenschaften beschreiben?", "options":["Haltbarkeit", "Attraktivität"]}},
                        {"module": "Optik", "part": "T3_Optik", "type": "question", "condition": "", "content": {"type": "matrix", "text": "Beschreibe die erste Assoziation in Richtung der anziehenden Wirkung & Intensität", "options":["Attraktivität", "Intensität"]}},
                        {"module": "Optik", "part": "T3_Optik", "type": "explanation", "condition": "", "content": {"text": "Hier wird mal ne Erklärung stehen. Dann auf ok klicken"}},
                        {"module": "Optik", "part": "T4_Optik", "type": "timer", "condition": "", "content": {"text": "Bitte warten. Ein 5 Sekunden Timer läuft", "timer": 5}},
                        {"module": "Optik", "part": "T4_Optik", "type": "manual", "condition": "", "content": {"text": "Hier wird mal was auf den Kopf gesetzt werden. Admin bitte auf weiter klicken", "channel": "eegOn"}},
                        {"module": "Optik", "part": "T4_Optik", "type": "summary", "condition": "", "content": {"text": "Hier haben sie eine Übersicht über ihre zuvor gegebenen Antworten"}}
                        ]
                    },
                    {"id": 1, "name": "Umfrage Kurz",
                    "modules": [{"id":"Telepathie","label":"Telepathie","children":[{"id":"T1_Telepathie","label":"T1"}]}],
                    "survey":
                        [   {"module": "Telepathie", "part": "T1", "type": "question", "condition": "", "content": {"type": "slider","text": "Wie würdest du deinen ersten visuellen Eindruck anhand der folgenden praktischen Eigenschaften beschreiben?", "options":["Haltbarkeit","Haltbarkeit","Haltbarkeit", "Attraktivität"]}},
                            {"module": "Telepathie", "part": "T1", "type": "question", "condition": "", "content": {"type": "polygonGraph", "text": "OKTAGON GOES 8", "options":["A","B","C","D","E","F","G","H","I","J","K","L","M","N"]}},
                            {"module": "Telepathie", "part": "T1", "type": "question", "condition": "", "content": {"type": "yes-no", "text": "Hast du eine Assoziation zu dem Material?", "options":["JA","NEIN"]}},
                            {"module": "Telepathie", "part": "T1", "type": "question", "condition": "0.true", "content": {"type": "checkbox","text": "Woher?", "options": ["Arbeit", "Nachrichten", "Internet", "Werbung"]}},
                        ]
                    }
                ],

                computedSurvey: [],
                computeError: "",
                
                presets: [],
                showPresetModal: false,
            }
        },
        methods:{
            loadProgram(){
                this.$electron.ipcRenderer.send("robotCommands", {command:"load", data: "/programs/"+ this.programm +".urp"})  
            },
            command: function(command){
                this.$electron.ipcRenderer.send("robotCommands", {command: command, data: ""})  
            },
            chooseModules: function(index, preset){
                console.log(this.modules)
                console.log(this.modulesChosen)
                this.modulesChosen = []
                switch(index){
                    case 0:
                        for(let i = 0; i< this.modules.length;i++){
                            this.modulesChosen.push(this.modules[i].id)
                        }
                        break;
                    case 6:
                        for(let y = 0; y < preset.modules.length; y++){
                            for(let i = 0; i< this.modules.length;i++){
                                if(this.modules[i].id == preset.modules[y]){
                                    this.modulesChosen.push(this.modules[i].id)
                                }else if(Object.prototype.hasOwnProperty.call(this.modules[i],"children")){
                                    for(let x = 0; x< this.modules[i].children.length;x++){
                                        if(this.modules[i].children[x].id == preset.modules[y]){
                                            this.modulesChosen.push(this.modules[i].children[x].id)
                                        }
                                    }
                                }
                            }
                        }
                        break;
                }
            },
            updateSurveyChoice: function(value){
                //Setze Surveychoice
                if(value == null){
                    this.surveyChoice = null
                    this.modules = []
                    this.modulesChosen = []
                }else{
                    this.surveyChoice = this.getSurveyPreset(value.id)
                    this.modules = this.surveyChoice.modules
                    this.modulesChosen = []
                }
            },
            getSurveyPreset: function(id){
                for(var i=0; i<this.surveyPresets.length; i++){
                    if(this.surveyPresets[i].id == id){
                        return this.surveyPresets[i]
                    }
                }
                return null
            },
            startSurvey: function(){
                var returnVal = this.computeSurvey()
                if(returnVal == "success"){
                    console.log(this.computedSurvey)
                    this.$electron.ipcRenderer.send("surveyOps", "start")
                }else{
                    this.computeError = returnVal
                }
            },
            computeSurvey: function(){
                /*
                    BRauchen auch aktuelles und nächstes material in jedem arrobject für roboter


                */
                console.log(this.materialsChosen)
                //Für die Roboterfahrten um zu wissen wie lang die Survey sein wird und wie viele Fragen nicht einzigartig sind (wie z.b. Poi, Outro,usw)
                //let surveyChoiceLengthWithChosenModules = 0
                let surveyChoiceLengthWithChosenModulesWithoutUnique = 0
                let modulesWithoutUnique = []
                let uniqueModules = ["POI", "Intro", "Einleitung", "Training", "Prä_Stimmungsabfrage", "Post_Stimmungsabfrage", "Outro",
                "POI Intro","POI Einleitung","POI Forschungsgegenstand", "POI Einverständniserklärung", "Start", "Demographie", "Milieu Identifikation", "Normative Grundorientierung",
                "Allgemeines Konsumverhalten", "Markenvertrauen", "Markenvertrauen_VW", "Markenvertrauen_Audi", "Markenvertrauen_Fiat", "Markenvertrauen_H&M",
                "Markenvertrauen_Patagonia" ,"Markenvertrauen_Vaude", "NPIS: Need for product information seeking", "SFOC: Slow fashion orientation construct",
                "NEP: New Ecological Paradigm Scale", "BFI-10: 10 Item Big Five Inventory", " (Tavassoli et al., 2014)", "POI Outro", "Information Messsequenz",
                "Datenanonymisierung", "Einverständniserklärung", "Information Sicherheit", "Information Trainingsrunde", "Trainingsrunde", "Prä Stimmung",
                "Post_Stimmung", "Labor Verabschiedung"]
                for(let y = 0; y < this.surveyChoice.survey.length; y++){
                    if((this.modulesChosen.includes(this.surveyChoice.survey[y].module) == true) || this.modulesChosen.includes(this.surveyChoice.survey[y].part) == true){
                        //surveyChoiceLengthWithChosenModules++
                        if(uniqueModules.includes(this.surveyChoice.survey[y].module) == false){
                            surveyChoiceLengthWithChosenModulesWithoutUnique++
                            
                        }
                    }
                }
                console.log(surveyChoiceLengthWithChosenModulesWithoutUnique)

                if((this.modulesChosen == null) || (this.modulesChosen.length <= 0)){
                    return "Nicht genug Fragebogenteile gewählt"
                }
                if(((this.materialsChosen.length<= 0) || (this.materialsChosen == null)) && (surveyChoiceLengthWithChosenModulesWithoutUnique != 0)){
                    return "Es muss mindestens ein Material gewählt werden "
                }
                if(this.versuchsleiter == ""){
                    return "Versuchsleiter fehlt"
                }
                if(this.materialPauseNumber < 0){
                    return "Zu wenige Materialien zwischen Pausen"
                }

                if((this.handedness.id == 0 || this.handedness == 0) && this.robotConnected){
                    for(let i = 0; i < this.materialsChosen.length; i++){
                        if(this.materialsChosen[i].roboPos != ""){
                            return "Es wurden Roboterfahrten angefordert aber keine Händigkeit festgelegt"
                        }
                    }
                }

                modulesWithoutUnique = this.modulesChosen.filter(module => uniqueModules.includes(module) == false)//Filter Alle Unique wie POI raus

                this.computedSurvey = []
                console.log(this.surveyChoice)
                console.log(this.modulesChosen)
                console.log(modulesWithoutUnique)


                //Geht einmal durch die Survey durch in fügt anfangsmodule wie POI die einmalig gefragt werden hinzu
                for(let y = 0; y < this.surveyChoice.survey.length; y++){
                    //console.log(this.surveyChoice.survey[y])
                    if((this.modulesChosen.includes(this.surveyChoice.survey[y].module) == true) || this.modulesChosen.includes(this.surveyChoice.survey[y].part) == true){
                        //Wenn Teil  POI, Intro POI, Outro POI, Intro Labor, Labor sicherheit ist
                        if(this.surveyChoice.survey[y].module == "POI" || this.surveyChoice.survey[y].module == "Intro" || this.surveyChoice.survey[y].module == "Einleitung" 
                        || this.surveyChoice.survey[y].module == "Training" || this.surveyChoice.survey[y].module == "Prä_Stimmungsabfrage"){
                            //Für Ländercodes
                            if(this.surveyChoice.survey[y].module == "POI" && this.surveyChoice.survey[y].part == "Demographie" && this.surveyChoice.survey[y].content.options == "LOAD" && (this.surveyChoice.survey[y].content.name == "POI_Demographie_origin"|| this.surveyChoice.survey[y].content.name == "POI_Demographie_residence")){
                                this.computedSurvey.push({"material": "", "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                    "content": {"name": this.surveyChoice.survey[y].content.name, "type": this.surveyChoice.survey[y].content.type, "text": this.surveyChoice.survey[y].content.text, "options": countrynames.getAllNames()}
                                })
                            }else{
                                this.computedSurvey.push({"material": "", "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                    "content": this.surveyChoice.survey[y].content
                                })
                                console.log(this.computedSurvey)
                            }
                        }
                    }
                }
                if(surveyChoiceLengthWithChosenModulesWithoutUnique>0){
                    this.computedSurvey.push({"module":"Roboterfahrt", "part":"Fahrt", "type":"manual", "content":{"text":"Bitte warten Sie bis das Material zum Testen bereit ist.", "img":"ur3.gif", "channel":"Roboterfahrt"}})
                }
                //geht durch alle mehrfach gefragten module durch
                //Loop through selected Materials
                for(let x = 0; x < this.materialsChosen.length; x++){
                    //Loop through selected Survey
                    for(let z = 0; z < modulesWithoutUnique.length; z++){
                        //Check if Module or part were selected
                        for(let y = 0; y < this.surveyChoice.survey.length; y++){
                            if((modulesWithoutUnique[z] == this.surveyChoice.survey[y].module) || modulesWithoutUnique[z] == this.surveyChoice.survey[y].part){
                                //Wenn Teil nicht POI, Intro POI, Outro POI, Intro Labor, Outro Labor, Labor sicherheit ist
                                if(uniqueModules.includes(this.surveyChoice.survey[y].module) == false){
                                    //Für Materialinformationen
                                    console.log(this.materialsChosenExtraInformation)
                                    console.log(this.surveyChoice.survey[y].module == "T0 MN")
                                    if(this.surveyChoice.survey[y].module == "T0 MN"){
                                        console.log(this.materialsChosenExtraInformation)
                                        if(this.materialsChosenExtraInformation.includes(this.materialsChosen[x]) == false && this.materialsChosen[x].information !== null){//Wenn die Informationen nicht erst später gezeigt werden sollen//Nur wenn Material auch Informationen besitzt
                                            if(/*this.surveyChoice.survey[y].part == "Material Narrativ" &&*/ this.surveyChoice.survey[y].content.text == "LOAD"){
                                                let tmpImg = (this.materialsChosen[x].image != "" ? this.materialsChosen[x].image : "leer.png")
                                                this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": "explanationPic",
                                                    "content": {"text": this.materialsChosen[x].information, "img": tmpImg}
                                                })
                                            }else{
                                                this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                                    "content": this.surveyChoice.survey[y].content
                                                })
                                            }
                                        }
                                    //Zeigt Materialspezifisches Bild/Video bei Wahrnehmungstimer. Wenn nicht das zweite Häckchen gesetzt wurde, dann werden die Infos erst später gezeigt
                                    }else if((this.surveyChoice.survey[y].module == "OPTIK T1 IME" /*|| this.surveyChoice.survey[y].module == "HAPTIK T1 IME"*/)
                                    && (this.surveyChoice.survey[y].part == "OPTIK T1 IME Präsentation" /*|| this.surveyChoice.survey[y].part == "HAPTIK T1 IME Präsentation"*/) && this.surveyChoice.survey[y].type == "timer" && this.materialsChosen[x].showExtraImg == true){
                                        let tmpImg = (this.materialsChosen[x].extraImg != "" ? this.materialsChosen[x].extraImg : "leer.png")
                                        let tmpContent = JSON.parse(JSON.stringify(this.surveyChoice.survey[y].content))
                                        tmpContent.imgBefore = tmpImg //Zeigt nur bei der Präsentation das Materialspezifische Bild. Das eigentliche wird überschrieben
                                        this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": "timer",
                                            "content": tmpContent
                                        })
                                    }else{
                                        if(((this.surveyChoice.survey[y].module == "OPTIK T1 IME") && (this.surveyChoice.survey[y].part == "OPTIK T1 IME Präsentation") && (this.surveyChoice.survey[y].type == "timer"))
                                        /*|| ((this.surveyChoice.survey[y].module == "HAPTIK T1 IME") && (this.surveyChoice.survey[y].part == "HAPTIK T1 IME Präsentation") && (this.surveyChoice.survey[y].type == "timer"))*/){//Für automatischen EEG Trigger
                                            this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "eeg":"trigger", "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                                "content": this.surveyChoice.survey[y].content
                                            })
                                        }else{
                                            this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                                "content": this.surveyChoice.survey[y].content
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //Wenn das zweite Häckchen bei der Materialauswahl gesetzt wurde dann füge alles erneut hinzu. Dieses mal mit den Zusatzinformationen bei der Präsentation, falls diese existieren
                    if(this.materialsChosen[x].showExtraImg == true && this.materialsChosenExtraInformation.includes(this.materialsChosen[x]) == true){//Wenn die Informationen erst später gezeigt werden sollen. Also JETZT
                        
                        modulesWithoutUnique = modulesWithoutUnique.filter(module => module != "T0 MN")
                        console.log(modulesWithoutUnique)
                        modulesWithoutUnique.unshift("T0 MN")
                        console.log(modulesWithoutUnique)
                        for(let z = 0; z < modulesWithoutUnique.length; z++){
                            for(let y = 0; y < this.surveyChoice.survey.length; y++){
                                if((modulesWithoutUnique[z] == this.surveyChoice.survey[y].module) || modulesWithoutUnique[z] == this.surveyChoice.survey[y].part){
                                    //Check if Module or part were selected
                                    if((this.modulesChosen.includes(this.surveyChoice.survey[y].module) == true) || this.modulesChosen.includes(this.surveyChoice.survey[y].part) == true){
                                        //Wenn Teil nicht POI, Intro POI, Outro POI, Intro Labor, Outro Labor, Labor sicherheit ist
                                        if(uniqueModules.includes(this.surveyChoice.survey[y].module) == false){
                                            //Für Materialinformationen
                                            if(this.surveyChoice.survey[y].module == "T0 MN" /*&& this.surveyChoice.survey[y].part == "Material Narrativ"*/ && this.surveyChoice.survey[y].content.text == "LOAD"){
                                                if(this.materialsChosen[x].information !== null){ //Nur wenn Material auch Informationen besitzt
                                                    let tmpImg = (this.materialsChosen[x].image != "" ? this.materialsChosen[x].image : "leer.png")
                                                    this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": "explanationPic",
                                                        "content": {"text": this.materialsChosen[x].information, "img": tmpImg}
                                                    })
                                                }
                                            //Zeigt Materialspezifisches Bild/Video bei Wahrnehmungstimer. Zeigt diese jetzt wirklich
                                            }else if((this.surveyChoice.survey[y].module == "OPTIK T1 IME" /*|| this.surveyChoice.survey[y].module == "HAPTIK T1 IME"*/)
                                            && (this.surveyChoice.survey[y].part == "OPTIK T1 IME Präsentation" /*|| this.surveyChoice.survey[y].part == "HAPTIK T1 IME Präsentation"*/) && this.surveyChoice.survey[y].type == "timer" && this.materialsChosen[x].showExtraImg == true){
                                                let tmpImg = (this.materialsChosen[x].extraImg != "" ? this.materialsChosen[x].extraImg : "leer.png")
                                                let tmpContent = JSON.parse(JSON.stringify(this.surveyChoice.survey[y].content))
                                                Object.prototype.hasOwnProperty.call(tmpContent,"name") ? tmpContent.name = tmpContent.name +"_secondPresentation" : ""
                                                tmpContent.imgBefore = tmpImg //Zeigt nur bei der Präsentation das Materialspezifische Bild. Das eigentliche wird überschrieben
                                                this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": "timer",
                                                    "content": tmpContent
                                                })
                                            }else{
                                                let tmpContent = JSON.parse(JSON.stringify(this.surveyChoice.survey[y].content))
                                                Object.prototype.hasOwnProperty.call(tmpContent,"name") ? tmpContent.name = tmpContent.name +"_secondPresentation" : ""
                                                if(((this.surveyChoice.survey[y].module == "OPTIK T1 IME") && (this.surveyChoice.survey[y].part == "T1 IME Präsentation") && (this.surveyChoice.survey[y].type == "timer"))
                                                /*|| ((this.surveyChoice.survey[y].module == "HAPTIK T1 IME") && (this.surveyChoice.survey[y].part == "HAPTIK T1 IME Präsentation") && (this.surveyChoice.survey[y].type == "timer"))*/){//Für automatischen EEG Trigger
                                                    this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "eeg":"trigger", "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                                        "content": tmpContent
                                                    })
                                                }else{
                                                    this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "hardware": this.surveyChoice.survey[y].hardware, "module": this.surveyChoice.survey[y].module, "part": this.surveyChoice.survey[y].part,"type": this.surveyChoice.survey[y].type,
                                                        "content": tmpContent
                                                    })
                                                }
                                            }
                                        }
                                    }
                                }
                            }         
                        }
                    }

                    if((((x+1)%this.materialPauseNumber) == 0) && x>0 && x<(this.materialsChosen.length-1)){//Bei jedem dritten(custom einstellbar) Material
                        this.computedSurvey.push({"material": JSON.parse(JSON.stringify(this.materialsChosen[x])), "module": this.surveyChoice.survey[this.surveyChoice.survey.length-1].module, "part": this.surveyChoice.survey[this.surveyChoice.survey.length-1].part,"type": "manual",
                            "content": {"text": "", "img": "mug.mp4", "channel": "Pause", "imagePosition":"behind"}
                        })
                        console.log(this.computedSurvey.length)
                    }

                    //Roboterfahrt
                    if(surveyChoiceLengthWithChosenModulesWithoutUnique>0 && x<(this.materialsChosen.length-1)){
                        this.computedSurvey.push({"module":"Roboterfahrt", "part":"Fahrt", "type":"manual", "content":{"text":"Bitte warten Sie bis das Material zum Testen bereit ist.", "img":"ur3.gif", "channel":"Roboterfahrt"}})
                    }
                }
                this.computedSurvey.push({"module":"Roboterfahrt", "part":"Fahrt", "type":"manual", "content":{"text":"Bitte warten Sie bis das Material zum Testen bereit ist.", "img":"ur3.gif", "channel":"Roboterfahrt"}})
                
                //Geht einmal durch die Survey durch in fügt Endmodule wie POI die einmalig gefragt werden hinzu
                for(let y = 0; y < this.surveyChoice.survey.length; y++){
                    if((this.modulesChosen.includes(this.surveyChoice.survey[y].module) == true) || this.modulesChosen.includes(this.surveyChoice.survey[y].part) == true){
                        //Wenn Teil  Outro Labor ist
                        if(this.surveyChoice.survey[y].module == "Outro" || this.surveyChoice.survey[y].module == "Post_Stimmungsabfrage"){
                            //Push into computed Array
                            this.computedSurvey.push({
                                "material": ""/*this.materialsChosen[this.materialsChosen.length-1]*/,
                                "hardware": this.surveyChoice.survey[y].hardware,
                                "module": this.surveyChoice.survey[y].module,
                                "part": this.surveyChoice.survey[y].part,
                                "type": this.surveyChoice.survey[y].type,
                                "content": this.surveyChoice.survey[y].content
                            })
                        }
                    }
                }
                    
                this.computedSurvey.push({
                    "material": "",
                    "module": "SurveyEnd",
                    "part": "End",
                    "type": "SurveyEnd",
                    "content": ""
                })

                for(let i = 0; i < this.computedSurvey.length; i++){
                    if(this.computedSurvey[i].material != "" && this.computedSurvey[i].material != null){
                        if(Object.prototype.hasOwnProperty.call(this.computedSurvey[i].material,"roboPos")){
                            if(this.computedSurvey[i].material.roboPos != ""){
                                if(this.handedness.id == 1){
                                    this.computedSurvey[i].material.roboPos = "L"+JSON.parse(JSON.stringify(this.computedSurvey[i].material.roboPos))
                                }else if(this.handedness.id == 2){
                                    this.computedSurvey[i].material.roboPos = "R"+JSON.parse(JSON.stringify(this.computedSurvey[i].material.roboPos))
                                }
                            }
                        }
                    }
                }
                //console.log(this.materialsChosen)

                return "success"
            }, 
            updateChecked: function(obj){
                if(this.findInArray(obj, this.objectsChosen) != null){
                    this.objectsChosen = this.objectsChosen.filter(el => el != obj)
                }else{
                    this.objectsChosen.push(obj)
                }
            },
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
            loadSurveys: function(){
                try{
                    let rawData = fs.readFileSync("src/renderer/assets/survey.json")
                    let jsonData = JSON.parse(rawData)
                    this.surveyPresets.push({"id":this.surveyPresets.length, "name": "Lokale Datei", "modules": jsonData.modules, "survey": jsonData.survey})
                }catch(e){
                    console.log(e)
                }

                //this.surveyPresets = tmp

                for(let i=0; i<this.surveyPresets.length; i++){
                    this.surveyOptions.push({"id": this.surveyPresets[i].id, "name": this.surveyPresets[i].name})
                } 
            },
            loadObjects: async function(){
               this.objects = await this.$electron.ipcRenderer.invoke("getStoreValue", "objects") 
            },
            loadPresets: function(){
                
            },
            addPreset: function(name, modules){
                
            },
            deletePreset: function(toDelete){
                
            },
            saveAnswers: function(){
                if(this.answersSent == false){
                    this.answersSent = true
                    setTimeout(this.answersSent = false, 1000)
                    this.answers.versuchsleiter = this.versuchsleiter
                    this.answers.assistenz = (this.assistenz == "" ? "null" : this.assistenz)
                    this.answers.studie = (this.studie == "" ? "null" : this.studie)
                    if(this.answers.proband == ""){
                        this.answers.proband = "Generic"
                    }
                    this.answers.online = false
                   
                   //removed axios
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
                console.log(array)
                return array;
            },
            updateExternalDisplay(){
                console.log(this.externalDisplay)
                this.$electron.ipcRenderer.send("displays", {"arg": "setExternalDisplay","externalDisplay":this.unprocessedDisplays[this.externalDisplay.id]})
            }
        },
        destroyed(){    
            this.$electron.ipcRenderer.removeAllListeners()
        },
        mounted: function(){
            this.$electron.ipcRenderer.on("surveyOps", (event,arg) => {//Wenn eine Meldung vom Host kommt was mit der Survey passiert
                if(arg == "opened"){//wenn die Umfrage geöffnet wurde
                    console.log("Survey geöffnet")
                    this.surveyRunning = true
                }else if(arg == "pause"){//Wenn pausiert wurde
                    console.log("Survey pausiert")
                    this.surveyPaused = true
                }else if(arg == "unpause"){//Wenn unpaused wurde
                    console.log("Survey resumed")
                    this.surveyPaused = false
                }else if(arg == "aborted"){//Wenn abgebrochen oder beendet wurde dann alles zurücksetzen
                    console.log("Survey arborted")
                    this.surveyPaused = false
                    this.surveyRunning = false
                    this.answers = {}
                    this.showingAnswers = false
                    this.manualChannel = null
                    this.autosave = false
                    this.answersSent = false
                }else if(arg == "getSurveyData"){//Wenn die Umfrage angefragt wird. Dann wirds an Umfragefenster geschickt
                    console.log("Sending SurveyData now")
                    this.$electron.ipcRenderer.send("surveyOps", {"arg": "sendSurveyData", "survey": this.computedSurvey, "port": this.port})
                }else if(arg == "readyToEnd"){//User hat Umfrageende erreicht. Umfrage kann jetzt beendet werden. Zeige Button dafür
                    console.log("Ready to End")
                    this.manualChannel = "Beenden"
                }else if(arg.arg == "sendAnswers"){//Antworten werden erhalten und lokal gespeichert. Dann Übersicht anzeigen
                    console.log("Got Answers")
                    this.answers = arg.answers
                    this.showingAnswers = true
                    if(this.autosave == false){
                        this.autosave = true
                        this.saveAnswers()
                    }
                }else if(arg == "ended"){
                    console.log("Survey ended gracefully")
                    this.surveyPaused = false
                    this.surveyRunning = false
                    this.autosave = false
                }else if(arg == "confirmManualStep"){
                    this.confirmManualStep()
                }
            })

            this.$electron.ipcRenderer.on("surveyChannel", (event,arg) => {
                console.log("Channel Message received. Will show button now")
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
                    console.log(arg.externalDisplay)
                }
            })
            
            /*this.$electron.ipcRenderer.on("robotConnected", (event,arg) => {
                this.robotConnected = arg
                console.log(arg)
            }) 
            this.$electron.ipcRenderer.on("robotConsole", (event,arg) => {
                this.robotConsole = arg
                console.log(arg)
            }) 
            this.$electron.ipcRenderer.send("robotCommands", {command:"status", data:""})  */

            this.$electron.ipcRenderer.send("displays", {"arg": "getDisplays"})

            this.loadSurveys()

            this.loadObjects()

            this.loadPresets()
        }
    }
</script>

<style scoped>
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
        width: 345px;
    }
    
    .material-table-element{
        margin-left:20px;
    }
</style>