<template>
    <div class="wrapper">
        <a id="downloadAnchorElem" style="display:none"></a>
        <div class="left-side">
            <div style="width: 100%; display:flex; justify-content: center">
                <button class="deleteButton" style="margin: 5px; color:white; background-color: black; width:120px; height: 30px" @click="filterAll()">Filtern</button>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showDataFormatFilter = !showDataFormatFilter">
                    <div class="measurement-header-text">Datenformat & Sonstiges: <span v-bind:class="showDataFormatFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showDataFormatFilter">
                    <div class="checkbox-wrapper" v-for="(g, a) in ['Generic']" v-bind:key="a">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="g" v-model="genericChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">Generic dabei</div>
                    </div>
                    <div class="checkbox-wrapper" v-for="(g, b) in ['Fehlende Probanden']" v-bind:key="b">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="g" v-model="showMissingProbands">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">Fehlende Probanden dabei</div>
                    </div>
                    <div class="checkbox-wrapper" v-for="(g, c) in ['Fehlende Probandendaten']" v-bind:key="c">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="g" v-model="showProbandsWithMissingData">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">Fehlende Probandendaten ignorieren (Z.B. fehlt Studienwahl, dann nicht danach rausfiltern)</div>
                    </div>
                    <div class="checkbox-wrapper" v-for="(g, d) in ['Online']" v-bind:key="d">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="g" v-model="showOnline">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">Online</div>
                    </div>
                    <div class="checkbox-wrapper" v-for="(g, e) in ['OnlineOnly']" v-bind:key="e">
                        <label class="checkbox-label">
                            <input type="checkbox" v-bind:value="g" v-model="showOnlineOnly">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">Nur Online</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showMaterialFilter = !showMaterialFilter">
                    <div class="measurement-header-text">Materialien: <span v-bind:class="showMaterialFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showMaterialFilter">
                    <div class="checkbox-wrapper">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-model="showMeasurementWithoutMaterials">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">Kein Material</div>
                    </div>
                    <div class="checkbox-wrapper" v-for="(mat, f) in availableMaterials" v-bind:key="f">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="mat" v-model="materialsChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{mat.name}}</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showAgeFilter = !showAgeFilter">
                    <div class="measurement-header-text">Alter: <span v-bind:class="showAgeFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showAgeFilter">
                    <div class="slider">
                        <vue-slider ref="ageSlider" id="ageSlider" v-model="ageSlider" v-bind="sliderOptions">                         
                            <template v-slot:dot="{focus}">
                                <div :class="['custom-dot', { focus }]"></div>
                            </template>
                            <template v-slot:tooltip="{ value, focus }">
                                <div :class="['custom-tooltip', { focus }]">{{value}}</div>
                            </template>

                            <template v-slot:mark="{ pos, label }">
                                <div class="custom-mark" :style="{ left: `${pos}%` }">
                                {{ label }}
                                </div>
                            </template>
                        </vue-slider>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showGenderFilter = !showGenderFilter">
                    <div class="measurement-header-text">Geschlecht: <span v-bind:class="showGenderFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showGenderFilter">
                    <div class="checkbox-wrapper" v-for="(gender, h) in ['0','1','2']" v-bind:key="h">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="gender" v-model="gendersChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{decodeProbandData("gender",gender)}}</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showEducationFilter = !showEducationFilter">
                    <div class="measurement-header-text">Bildung: <span v-bind:class="showEducationFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showEducationFilter">
                    <div class="checkbox-wrapper" v-for="(edu, n) in ['0','1','2','3','4','5','6','7','8','9','10','11','12']" v-bind:key="n">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="edu" v-model="eduChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{decodeProbandData("education",edu)}}</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showProfession2Filter = !showProfession2Filter">
                    <div class="measurement-header-text">Studienwahl: <span v-bind:class="showProfession2Filter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showProfession2Filter">
                    <div class="checkbox-wrapper" v-for="(stud, j) in ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14']" v-bind:key="j">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="stud" v-model="prof2Chosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{decodeProbandData("profession2",stud)}}</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showProfessionFilter = !showProfessionFilter">
                    <div class="measurement-header-text">Beruf: <span v-bind:class="showProfessionFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showProfessionFilter">
                    <div class="checkbox-wrapper" v-for="(job, k) in ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16']" v-bind:key="k">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="job" v-model="jobChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{decodeProbandData("profession",job)}}</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showIncomeFilter = !showIncomeFilter">
                    <div class="measurement-header-text">Einkommen: <span v-bind:class="showIncomeFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showIncomeFilter">
                    <div class="checkbox-wrapper" v-for="(inc, l) in ['0','1','2','3','4','5','6','7']" v-bind:key="l">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="inc" v-model="incChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{decodeProbandData("income",inc)}}</div>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showEnv1Filter = !showEnv1Filter">
                    <div class="measurement-header-text">Aufwachsen Zivilisationsnähe: <span v-bind:class="showEnv1Filter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showEnv1Filter">
                    <div class="slider">
                        <vue-slider  v-model="env1Slider" v-bind="envSliderOptions">                         
                            <template v-slot:dot="{ focus }">
                                <div :class="['custom-dot', { focus }]"></div>
                            </template>
                            <template v-slot:tooltip="{ value, focus }">
                                <div :class="['custom-tooltip', { focus }]">{{value}}</div>
                            </template>

                            <template v-slot:mark="{ pos, label }">
                                <div class="custom-mark" :style="{ left: `${pos}%` }">
                                {{ label }}
                                </div>
                            </template>
                        </vue-slider>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showEnv2Filter = !showEnv2Filter">
                    <div class="measurement-header-text">Letzte 5 Jahre Zivilisationsnähe: <span v-bind:class="showEnv2Filter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showEnv2Filter">
                    <div class="slider">
                        <vue-slider  v-model="env2Slider" v-bind="envSliderOptions">                         
                            <template v-slot:dot="{focus }">
                                <div :class="['custom-dot', { focus }]"></div>
                            </template>
                            <template v-slot:tooltip="{ value, focus }">
                                <div :class="['custom-tooltip', { focus }]">{{value}}</div>
                            </template>

                            <template v-slot:mark="{ pos, label }">
                                <div class="custom-mark" :style="{ left: `${pos}%` }">
                                {{ label }}
                                </div>
                            </template>
                        </vue-slider>
                    </div>
                </div>
            </div>
            <div class="filter">
                <div class="measurement-header" @click="showHandednessFilter = !showHandednessFilter">
                    <div class="measurement-header-text">Dominante Hand: <span v-bind:class="showHandednessFilter ? 'arrow-down': 'arrow-right'"></span></div>
                </div>
                <div class="measurement-collapse" v-show="showHandednessFilter">
                    <div class="checkbox-wrapper" v-for="(hand, m) in ['0','1']" v-bind:key="m">
                        <label class="checkbox-label" >
                            <input type="checkbox" v-bind:value="hand" v-model="handsChosen">
                            <span class="checkbox-custom rectangular"></span>
                        </label>
                        <div class="checkbox-text">{{decodeProbandData("handedness",hand)}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-side">
            <div class="measurements-overview-wrapper">
                Anzahl Messungen: {{filteredMeasurements.length}} {{errMsg}}
                <button @click="spssExport(filteredMeasurements)">Download</button>
                <br>
                Code suchen: <input type="text" v-model="searchCode">
                <button @click="filterByCode()">Suchen</button>
                <br>
                Studie suchen: <input type="text" v-model="searchStudy">
                <button @click="filterByStudy()">Suchen</button>
                <br>             
                <div class="measurement-box" v-for="(measurement,i) in filteredMeasurements" v-bind:key="i">
                    <div class="measurement-header">
                        <div class="measurement-header-text">
                            <span  @click="toggleCollapse(measurement)">{{measurement.date}} - {{measurement.proband}} - {{measurement.studie}}</span>
                            <button @click="deleteMeasurement(measurement._id)" class="deleteButton">
                                Löschen
                            </button>
                            <button @click="editMeasurement(measurement)" class="deleteButton">
                                Bearbeiten
                            </button>
                            <button @click="spssExport([measurement])" class="deleteButton">
                                Download
                            </button>
                            <button @click="score(measurement)" class="deleteButton">
                                Scores
                            </button>
                        </div>
                    </div>
                    <div class="measurement-collapse" v-show="showMeasurement.includes(measurement._id)">
                        <div class="measurement-data" v-show="editField != measurement">
                            Id: {{measurement._id}} <br>
                            Proband: {{measurement.proband}}<br>
                            Datum: {{measurement.date}}<br>
                            Versuchsleiter: {{measurement.versuchsleiter}}<br>
                            Assistenz: {{measurement.assistenz}}<br>
                            Studie: {{measurement.studie}}<br>
                            Online: {{measurement.online}}<br>
                            Länge: {{measurement.länge}}<br>
                            Materialien: {{measurement.materials}}<br>
                            <hr>
                            Scores:<div v-for="(mat,o) in measurement.materials" v-bind:key="o">
                                <div v-if="mat.scores!=0">{{mat.name}}: {{mat.scores}}</div>
                            </div>
                        </div>
                        <div class="editor" v-show="editField == measurement">
                            <textarea class="textarea" type="" v-model="editingMeasurementData"></textarea>
                            <button @click="updateMeasurement(JSON.parse(editingMeasurementData))" class="btn-black" style="color:white;margin:25px;">
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import countrynames from 'countrynames'
    export default {
        data: function( ){
            return{
                editField: {},
                errMsg: "",
                editData: {},
                gendersChosen:[],
                genericChosen:true,
                eduChosen:[],
                incChosen: [],
                jobChosen:[],
                handsChosen:["0","1"],
                prof2Chosen: [],
                probanden: [],
                missingProbands: [],
                showMissingProbands: true,
                showOnline: true,
                showOnlineOnly: false,
                sliderOptions:{
                    silent:true,
                    tooltip:"always" ,
                    processStyle:{backgroundColor: 'black'},
                    marks:[-100,0,100],
                    min: -100,
                    max: 100,
                },
                envSliderOptions:{
                    silent:true,
                    tooltip:"always" ,
                    processStyle:{backgroundColor: 'black'},
                    marks:[-100,0,100],
                    min: -100,
                    max: 100,
                },
                ageSlider: [25,50],
                env1Slider: [-100,100],
                env2Slider: [-100,100],                
                showAgeFilter: false,
                showDataFormatFilter: false,
                showGenderFilter: false,
                showMaterialFilter: false,
                showEducationFilter: false,
                showProfession2Filter: false,
                showIncomeFilter: false,
                showProfessionFilter: false,
                showHandednessFilter: false,
                showEnv1Filter: false,
                showEnv2Filter: false,
                availableMaterials: [],
                materialsChosen: [],
                measurements: [],
                filteredMeasurements: [],
                showMeasurement: [],
                editType: "",
                searchCode: "",
                searchStudy: "",
                showMeasurementWithoutMaterials: true,
                showProbandsWithMissingData: true,
                editingMeasurementData: "",
            }
        },
        methods:{
            getProbandData: function(prob){
                for(let i = 0; i < this.probanden.length; i++){
                    if(this.probanden[i].code == prob){
                        return this.probanden[i]
                    }
                }
                return prob//Falls generic oder nicht gefunden
            },
            spssExport: function(toExport){
                //Finde erstmal POI zu den Usern:
                let toAdd = []
                for(let i = 0; i<toExport.length; i++){
                    if(toExport[i].proband != "Generic" && toExport[i].studie != "POI"){
                        for(let o = this.measurements.length-1; o >= 0; o--){
                            if(this.measurements[o].proband == toExport[i].proband && this.measurements[o].studie == "POI" && !toAdd.includes(this.measurements[o])){
                                toAdd.push(this.measurements[o])
                                break
                            }
                        }
                    }
                }
                axios({url: 'https://'+axios.defaults.baseURL+'/api/answer/getMeasurement', data: {measurements: toAdd}, method: 'POST' }).then(response => {
                    let POIData = response.data.answers
                    //Hole dir die POI Questionnames
                    let POINames = []
                    for(let x = 0; x<POIData.length; x++){
                        for(let y = 0; y < POIData[x].answers.length; y++){
                            if(Object.prototype.hasOwnProperty.call(POIData[x].answers[y],"name") && POIData[x].answers[y].module == "POI"){
                                if(POINames.includes(POIData[x].answers[y].name) == false){//HIER HÄNGT ALLES DAVON AB DASS POI NIEMALS MATRIX(CIRCLE)/CHECKBOX ENTHÄLT. FALLS IRGENDWANN SCHON BITTE ÄNDERN
                                    POINames.push(POIData[x].answers[y].name)
                                }
                            }
                        }
                    }
                    axios({url: 'https://'+axios.defaults.baseURL+'/api/answer/getMeasurement', data: {measurements: toExport}, method: 'POST' }).then(response => {
                        toExport = response.data.answers
                        let thisProband = []
                        for(let i = 0; i<toExport.length; i++){//Filtere die POI Daten aus den Studien raus
                            if(toExport[i].proband == "Generic"){
                                thisProband[i] = {"code": "Generic", "age":"Generic", "gender":"Generic", "education": "Generic", "profession":"Generic", "income":"Generic","origin":"Generic",
                                                    "residence":"Generic","environment1":"Generic","environment2":"Generic","handedness":"Generic","head":"Generic"}
                            }else{
                                thisProband[i] = this.getProbandData(toExport[i].proband)
                            }
                        }

                        let exportArr = []
                        let questionNames = ["_id","versuchsleiter","assistenz","date","created_at","updated_at","material_id","material_name","code","age","gender","education",
                                                "profession","income","origin","residence","environment1","environment2","handedness","head","online","studie","länge"]
                        if(POINames.length > 0){
                            questionNames = questionNames.concat(POINames)
                        }

                        let answersByMatForAllMeasurements = []
                        for(let i = 0; i<toExport.length; i++){//Geht jede Messung durch und holt sich die Materialien //POI//Mat1//Mat2//Mat3...
                            let materialIdArr = []
                            let materialNameArr = []
                            for(let a = 0; a < toExport[i].answers.length; a++){//Speichert sich die IDs der Materialien und die Namen der Fragen in der Messung
                                if(typeof toExport[i].answers[a].material !== "undefined" && toExport[i].answers[a].material != null){
                                    if(materialIdArr.includes(toExport[i].answers[a].material.id) == false){
                                        materialIdArr.push(toExport[i].answers[a].material.id)
                                        materialNameArr.push(toExport[i].answers[a].material.name)
                                    } 
                                }else{
                                    if(materialIdArr.includes("None") == false){
                                        materialIdArr.push("None")
                                        materialNameArr.push("None")
                                    }
                                }

                                if(Object.prototype.hasOwnProperty.call(toExport[i].answers[a],"name") == false){//Falls wegen Fehler kein Fragename existiert
                                    if(toExport[i].answers[a].questionType == "matrix"){
                                        if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x") == false){
                                            questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x")
                                        }
                                        if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y") == false){
                                            questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y")
                                        }
                                    }else if(toExport[i].answers[a].questionType == "matrix_circle"){
                                        if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x") == false){
                                            questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x")
                                        }
                                        if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y") == false){
                                            questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y")
                                        }
                                        if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_z") == false){
                                            questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_z")
                                        }
                                    }else if(toExport[i].answers[a].questionType == "checkbox"){
                                        for(let o = 0; o < toExport[i].answers[a].answer.length; o++){
                                            if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_"+o) == false){
                                                questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_"+o)
                                            }
                                        }
                                    }else{
                                        let n = toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a
                                        if(questionNames.includes(n) == false){
                                            questionNames.push(n)
                                        }
                                    }
                                }else{
                                    if(toExport[i].answers[a].name === "undefined" || toExport[i].answers[a].name == null){//Falls wegen Fehler kein Fragename existiert
                                        if(toExport[i].answers[a].questionType == "matrix"){
                                            if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x") == false){
                                                questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x")
                                            }
                                            if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y") == false){
                                                questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y")
                                            }
                                        }else if(toExport[i].answers[a].questionType == "matrix_circle"){
                                            if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x") == false){
                                                questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_x")
                                            }
                                            if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y") == false){
                                                questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_y")
                                            }
                                            if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_z") == false){
                                                questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_z")
                                            }
                                        }else if(toExport[i].answers[a].questionType == "checkbox"){
                                            for(let o = 0; o < toExport[i].answers[a].answer.length; o++){
                                                if(questionNames.includes(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_"+o) == false){
                                                    questionNames.push(toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a+"_"+o)
                                                }
                                            }
                                        }else{
                                            let n = toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a
                                            if(questionNames.includes(n) == false){
                                                questionNames.push(n)
                                            }
                                        }
                                    }else{
                                        //Falls Daten in Arrayform [x,y] dann aufteilen
                                        if(toExport[i].answers[a].questionType == "matrix"){
                                            if(questionNames.includes(toExport[i].answers[a].name+"_x") == false){
                                                questionNames.push(toExport[i].answers[a].name+"_x")
                                            }
                                            if(questionNames.includes(toExport[i].answers[a].name+"_y") == false){
                                                questionNames.push(toExport[i].answers[a].name+"_y")
                                            }
                                        }else if(toExport[i].answers[a].questionType == "matrix_circle"){
                                            if(questionNames.includes(toExport[i].answers[a].name+"_x") == false){
                                                questionNames.push(toExport[i].answers[a].name+"_x")
                                            }
                                            if(questionNames.includes(toExport[i].answers[a].name+"_y") == false){
                                                questionNames.push(toExport[i].answers[a].name+"_y")
                                            }
                                            if(questionNames.includes(toExport[i].answers[a].name+"_z") == false){
                                                questionNames.push(toExport[i].answers[a].name+"_z")
                                            }
                                        }else if(toExport[i].answers[a].questionType == "checkbox"){
                                            for(let o = 0; o < toExport[i].answers[a].answer.length; o++){
                                                if(questionNames.includes(toExport[i].answers[a].name+"_"+o) == false){
                                                    questionNames.push(toExport[i].answers[a].name+"_"+o)
                                                }
                                            }
                                        }else{
                                            if(questionNames.includes(toExport[i].answers[a].name) == false){
                                                questionNames.push(toExport[i].answers[a].name)
                                            }
                                        }
                                    }
                                }
                            }
                            if(materialIdArr.includes("None") && materialIdArr.length > 1){ //Wenn mehr als nur None drin ist dann None entfernen 
                                materialIdArr = materialIdArr.filter(el => el != "None")
                                materialNameArr = materialNameArr.filter(el => el != "None")
                            }
                            let answersByMat = Array(materialIdArr.length).fill("-").map(() => Array(questionNames.length).fill("-"))
                            
                            let currentPoiData = []
                            currentPoiData = POIData.filter(el => el.proband == thisProband[i].code)

                            for(let a = 0; a < answersByMat.length; a++){ //Fülle l Teil
                                answersByMat[a][0] = toExport[i]._id
                                answersByMat[a][1] = toExport[i].versuchsleiter
                                answersByMat[a][2] = toExport[i].assistenz
                                answersByMat[a][3] = toExport[i].date

                                answersByMat[a][20] = (Object.prototype.hasOwnProperty.call(toExport[i],"online") ? toExport[i].online : "")
                                answersByMat[a][21] = (Object.prototype.hasOwnProperty.call(toExport[i],"studie") ? toExport[i].studie : "")
                                answersByMat[a][22] = (Object.prototype.hasOwnProperty.call(toExport[i],"länge") ? toExport[i].länge : "")

                                answersByMat[a][4] = toExport[i].created_at
                                answersByMat[a][5] = toExport[i].updated_at
                                answersByMat[a][6] = materialIdArr[a]
                                answersByMat[a][7] = materialNameArr[a]
                                answersByMat[a][8] = thisProband[i].code
                                answersByMat[a][9] = thisProband[i].age
                                answersByMat[a][10] = thisProband[i].gender
                                answersByMat[a][11] = thisProband[i].education
                                answersByMat[a][12] = thisProband[i].profession
                                answersByMat[a][13] = thisProband[i].income
                                answersByMat[a][14] = thisProband[i].origin
                                answersByMat[a][15] = thisProband[i].residence
                                answersByMat[a][16] = thisProband[i].environment1
                                answersByMat[a][17] = thisProband[i].environment2
                                answersByMat[a][18] = thisProband[i].handedness
                                answersByMat[a][19] = thisProband[i].head

                                if(currentPoiData.length > 0){
                                    for(let x = 23; x < answersByMat[a].length; x++){ //HIER HÄNGT ALLES DAVON AB DASS POI NIEMALS MATRIX(CIRCLE)/CHECKBOX ENTHÄLT. FALLS IRGENDWANN SCHON BITTE ÄNDERN
                                        let tmp = currentPoiData[0].answers.filter(el => el.name == questionNames[x])
                                        if(tmp.length > 0){
                                            answersByMat[a][x] = tmp[0].answer
                                        }
                                    }
                                }
                                answersByMatForAllMeasurements.push(answersByMat[a])
                            }
                        }

                        //Verschiebe Prä & Post ans Ende
                        let tmpPräPost = questionNames.filter(el => (el=="POST_ST_x") || (el=="POST_ST_y") || (el=="PRÄ_ST_x") || (el == "PRÄ_ST_y"))
                        questionNames = questionNames.filter(el => (el!="POST_ST_x") && (el!="POST_ST_y") && (el!="PRÄ_ST_x") && (el != "PRÄ_ST_y"))
                        questionNames = questionNames.concat(tmpPräPost)

                        exportArr = Array((answersByMatForAllMeasurements.length+1)).fill("-").map(() => Array(questionNames.length).fill("-"))
                        exportArr[0] = questionNames

                        for(let i = 0; i < answersByMatForAllMeasurements.length; i++){//Gehe jede Messung durch
                            exportArr[i+1] = answersByMatForAllMeasurements[i]
                        }
                        
                        //toExport = toExport.concat(POIData) //Damit auch die POI Antworten hinzugefügt werden
                        for(let i = 0; i < toExport.length; i++){
                            let measurementId = toExport[i]._id
                            for(let a = 0; a < toExport[i].answers.length; a++){
                                let material_id = ""
                                if(typeof toExport[i].answers[a].material !== "undefined" && toExport[i].answers[a].material != null){
                                    material_id = toExport[i].answers[a].material.id
                                }else{
                                    material_id = "None"
                                }
                                let questionName = ""
                                if(Object.prototype.hasOwnProperty.call(toExport[i].answers[a],"name") == false){//Falls wegen Fehler kein Fragename existiert
                                        questionName = toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a
                                }else{
                                    if(toExport[i].answers[a].name === "undefined" || toExport[i].answers[a].name == null){//Falls wegen Fehler kein Fragename existiert
                                        questionName = toExport[i].answers[a].module+"_"+toExport[i].answers[a].part+"_questionNo_"+a
                                    }else{
                                        questionName = toExport[i].answers[a].name
                                    }
                                }
                                for(let x = 1; x < exportArr.length; x++){
                                    if(exportArr[x][0] == measurementId && (exportArr[x][6] == material_id || material_id == "None")){
                                        for(let y = 0; y < exportArr[0].length; y++){
                                            if(toExport[i].answers[a].questionType == "matrix"){
                                                if(exportArr[0][y] == questionName+"_x"){
                                                    exportArr[x][y] = (Math.round((toExport[i].answers[a].answer[0] + Number.EPSILON) * 100) / 100).toLocaleString()
                                                    if(exportArr[0][y+1] == questionName+"_y"){//Da die eigentlich direkt hintereinander sein müssen, zur Effizienz
                                                        exportArr[x][y+1] = (Math.round((toExport[i].answers[a].answer[1] + Number.EPSILON) * 100) / 100).toLocaleString()
                                                        y++;
                                                        if(material_id != "None"){//damit nur POI überall reinkommt
                                                            break;
                                                        }
                                                    }
                                                }
                                            }else if(toExport[i].answers[a].questionType == "matrix_circle"){
                                                if(exportArr[0][y] == questionName+"_x"){
                                                    exportArr[x][y] = (Math.round((toExport[i].answers[a].answer[0] + Number.EPSILON) * 100) / 100).toLocaleString()
                                                    if(exportArr[0][y+1] == questionName+"_y"){//Da die eigentlich direkt hintereinander sein müssen, zur Effizienz
                                                        exportArr[x][y+1] = (Math.round((toExport[i].answers[a].answer[1] + Number.EPSILON) * 100) / 100).toLocaleString()
                                                        if(exportArr[0][y+2] == questionName+"_z"){//Da die eigentlich direkt hintereinander sein müssen, zur Effizienz
                                                            exportArr[x][y+2] = (Math.round((toExport[i].answers[a].answer[2] + Number.EPSILON) * 100) / 100).toLocaleString()
                                                            y++;
                                                            if(material_id != "None"){//damit nur POI überall reinkommt
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            }else if(toExport[i].answers[a].questionType == "checkbox"){//Müsste hiernach nicht y um o erhöht werden? Nie getestet...
                                                for(let o = 0; o < toExport[i].answers[a].answer.length; o++){
                                                    if(exportArr[0][y+o] == (questionName+"_"+o)){//Wir gehen davon aus dass die direkt hintereinander sind
                                                        exportArr[x][y+o] = toExport[i].answers[a].answer[o]
                                                    }
                                                }
                                                if(material_id != "None"){//damit nur POI überall reinkommt
                                                    break;
                                                }
                                            }else{
                                                if(exportArr[0][y] == questionName){
                                                    exportArr[x][y] = toExport[i].answers[a].answer
                                                    //console.log(exportArr[x][y])
                                                    if(material_id != "None"){//damit nur POI überall reinkommt
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if(material_id != "None"){//damit nur POI überall reinkommt
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        console.log(JSON.parse(JSON.stringify(exportArr)))
                        let exportArrD1 = exportArr[0].map(function (_, c) { return exportArr.map(function (r) { return r[c]; }); });//Transponieren

                        let csvContent = "data:text/csv;charset=UTF-8," + exportArrD1.map(e => e.join(";")).join("\n");
                        let encodedUri = encodeURI(csvContent);
                        let link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "datenaufbereitung1.csv");
                        document.body.appendChild(link); // Required for FF
                        link.click();

                        //Sortiere nach Material
                        let tmp = exportArr.splice(0,1)
                        let exportArrD2 = JSON.parse(JSON.stringify(exportArr.sort(function(a, b) {
                            let nameA = a[6];//Nach MaterialID
                            let nameB = b[6];
                            if (nameA < nameB) {
                                return -1;
                            }
                            if (nameA > nameB) {
                                return 1;
                            }
                            return 0;
                        })))
                        exportArrD2.unshift(tmp[0])
                        csvContent = "data:text/csv;charset=UTF-8," + exportArrD2.map(e => e.join(";")).join("\n");
                        encodedUri = encodeURI(csvContent);
                        link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "datenaufbereitung2.csv");
                        document.body.appendChild(link); // Required for FF
                        link.click();

                        tmp = exportArr.splice(0,1)
                        let exportArrD3tmp = JSON.parse(JSON.stringify(exportArr.sort(function(a, b) {
                            let nameA = a[8];//Nach Probandencode
                            let nameB = b[8];
                            if (nameA < nameB) {
                                return -1;
                            }
                            if (nameA > nameB) {
                                return 1;
                            }
                            return 0;
                        })))
                        console.log(exportArrD3tmp)
                        let materialList = []
                        for(let i = 0; i < exportArrD3tmp.length; i++){
                            if(materialList.includes(exportArrD3tmp[i][6]) == false){
                                materialList.push
                            }
                        }
                        //exportArrD3.unshift(tmp[0])
                        csvContent = "data:text/csv;charset=UTF-8," + exportArrD3tmp.map(e => e.join(";")).join("\n");
                        encodedUri = encodeURI(csvContent);
                        link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "datenaufbereitung3.csv");
                        document.body.appendChild(link); // Required for FF
                        link.click();
                    }).catch(error => {console.log(error)})    
                }).catch(error => {console.log(error)}) 
            },
            decodeProbandData: function(type, data){
                switch(type){
                    case "gender":
                        if(data == "0"){
                            return "Weiblich"
                        }else if(data== "1"){
                            return "Anders"
                        }else if(data=="2"){
                            return "Männlich"
                        }
                        break;
                    case "education":
                        if(data=="0"){
                            return "Kein Schulabschluss"
                        }else if(data=="1"){
                            return "Grund-/Hauptschulabschluss"
                        }else if(data=="2"){
                            return "Mittlere Reife (Realschulabschluss)"
                        }else if(data=="3"){
                            return "Fachhochschulabschluss"
                        }else if(data=="4"){
                            return "Allgemeine Hochschulreife (Abitur)"
                        }else if(data=="5"){
                            return "Abgeschlossene Ausbildung"
                        }else if(data=="6"){
                            return "Bachelor"
                        }else if(data=="7"){
                            return "Master"
                        }else if(data=="8"){
                            return "Promotion"
                        }else if(data=="9"){
                            return "Sonstiges"
                        }else if(data=="10"){
                            return "Staatsexamen"
                        }else if(data=="11"){
                            return "Approbation"
                        }else if(data=="12"){
                            return "Diplom"
                        }else if(data=="13"){
                            return "Meister"
                        }
                        break;
                    case "profession":
                        if(data=="0"){
                            return "Schüler*in"
                        }else if(data=="1"){
                            return "Student*in"
                        }else if(data=="2"){
                            return "Akademischer Beruf"
                        }else if(data=="3"){
                            return "Techniker*in und gleichrangiger nichttechnischer Beruf"
                        }else if(data=="4"){
                            return "Führungskraft"
                        }else if(data=="5"){
                            return "Medizinischer und Pflegeberuf"
                        }else if(data=="6"){
                            return "Projektarbeits und Entwicklungskraft"
                        }else if(data=="7"){
                            return "Lehrkraft"
                        }else if(data=="8"){
                            return "Bürokraft und verwandter Beruf"
                        }else if(data=="9"){
                            return "Dienstleistungsberuf und Verkäufer*in"
                        }else if(data=="10"){
                            return "Fachkräfte in der Landwirtschaft und Fischerei"
                        }else if(data=="11"){
                            return "Handwerks- und verwandter Beruf"
                        }else if(data=="12"){
                            return "Anlagen- und Maschinenbediener*in und Montageberuf"
                        }else if(data=="13"){
                            return "Hilfsarbeitskraft"
                        }else if(data=="14"){
                            return "Militärischer Beruf"
                        }else if(data=="15"){
                            return "Arbeitssuchend"
                        }else if(data=="16"){
                            return "Selbständigkeit & Freiberuflichkeit"
                        }else if(data=="17"){
                            return "Sonstiges"
                        }
                        break;
                     case "profession2":
                        if(data=="0"){
                            return "keine Ausbildung / kein Studium"
                        }else if(data=="1"){
                            return "Agrar- und Forst­wissenschaften"
                        }else if(data=="2"){
                            return "Gesellschafts- und Sozial­wissenschaften"
                        }else if(data=="3"){
                            return "Ingenieur­wissenschaften"
                        }else if(data=="4"){
                            return "Kunst"
                        }else if(data=="5"){
                            return "Musik"
                        }else if(data=="6"){
                            return "Design"
                        }else if(data=="7"){
                            return "Mathematik"
                        }else if(data=="8"){
                            return "Naturwissenschaften"
                        }else if(data=="9"){
                            return "Medizin"
                        }else if(data=="10"){
                            return "Gesund­heitswissen­schaften und -wirtschaft"
                        }else if(data=="11"){
                            return "Sprach- und Kulturwissen­schaften"
                        }else if(data=="12"){
                            return "Wirtschafts- und Rechts­wissenschaften"
                        }else if(data=="13"){
                            return "Lehramt"
                        }else if(data=="14"){
                            return "Öffentliche Verwaltung"
                        }else if(data=="15"){
                            return "Sonstiges"
                        }
                        break;
                    case "income":
                        if(data=="0"){
                            return "Unter 400€"
                        }else if(data=="1"){
                            return "400€ - 1000€"
                        }else if(data=="2"){
                            return "1000€ - 1500€"
                        }else if(data=="3"){
                            return "1500€ - 2500€"
                        }else if(data=="4"){
                            return "2500€ - 4000€"
                        }else if(data=="5"){
                            return "4000€ - 6000€"
                        }else if(data=="6"){
                            return "Über 6000€"
                        }else if(data=="7"){
                            return "Keine Angabe"
                        }
                        break;
                    case "origin":
                        return countrynames.getName(data)
                    case "residence":
                        return countrynames.getName(data)
                    case "handedness":
                        if(data == "0"){
                            return "Links"
                        }else if(data =="1"){
                            return "Rechts"
                        }
                        break;
                }
            },
            filterByCode: function(){
                let tmp = []
                if(this.searchCode != ""){
                    for(let i = 0; i<this.filteredMeasurements.length;i++){
                        if(this.filteredMeasurements[i].proband == this.searchCode){
                            tmp.push(this.filteredMeasurements[i])
                        }
                    }
                }
                this.filteredMeasurements = JSON.parse(JSON.stringify(tmp))
            },
            filterByStudy: function(){
                let tmp = []
                if(this.searchStudy != ""){
                    for(let i = 0; i<this.filteredMeasurements.length;i++){
                        if(this.filteredMeasurements[i].studie == this.searchStudy){
                            tmp.push(this.filteredMeasurements[i])
                        }
                    }
                }
                this.filteredMeasurements = JSON.parse(JSON.stringify(tmp))
            },
            filterAll: function(){
                this.filteredMeasurements = JSON.parse(JSON.stringify(this.measurements))

                let matIds = []
                if(this.materialsChosen != this.availableMaterials){
                    for(let i = 0; i<this.materialsChosen.length;i++){
                        matIds.push(this.materialsChosen[i].id)
                    }
                    let tmp = []
                    for(let i = 0; i < this.filteredMeasurements.length; i++){
                        let mats = []
                        if(Object.prototype.hasOwnProperty.call(this.filteredMeasurements[i],"materials")){
                            if(this.filteredMeasurements[i].materials.length > 0){
                                for(let x = 0; x < this.filteredMeasurements[i].materials.length; x++){
                                    if((matIds.includes(this.filteredMeasurements[i].materials[x].id))){
                                        mats.push(this.filteredMeasurements[i].materials[x])
                                        
                                    }
                                }
                            }
                            if(mats.length > 0 || (this.filteredMeasurements[i].materials.length == 0 && this.showMeasurementWithoutMaterials)){
                                let tmp2 = JSON.parse(JSON.stringify(this.filteredMeasurements[i]))
                                tmp2.materials = mats;
                                tmp.push(tmp2)
                            }
                        }else if(mats.length > 0 || this.showMeasurementWithoutMaterials){
                            let tmp2 = JSON.parse(JSON.stringify(this.filteredMeasurements[i]))
                            tmp2.materials = mats;
                            tmp.push(tmp2)
                        }
                        
                        
                    }
                    this.filteredMeasurements = JSON.parse(JSON.stringify(tmp))
                }


                let tmpProbands = []
                let tmp = []
                for(let i = 0; i<this.probanden.length;i++){//Holt sich erst alle Probanden die in die Filter Range passen
                    if(((this.probanden[i].age >= this.ageSlider[0] && this.probanden[i].age <= this.ageSlider[1]) || (this.showProbandsWithMissingData && this.probanden[i].age == null))
                        && (this.gendersChosen.includes(this.probanden[i].gender) == true || (this.showProbandsWithMissingData && this.probanden[i].gender == null) || (this.probanden[i].gender !== undefined ? this.gendersChosen.includes(this.probanden[i].gender.toString()) == true : false))
                        && (this.eduChosen.includes(this.probanden[i].education) == true|| (this.showProbandsWithMissingData && this.probanden[i].education == null) || (this.probanden[i].education !== undefined ? this.eduChosen.includes(this.probanden[i].education.toString()) == true : false))
                        && (this.incChosen.includes(this.probanden[i].income) == true|| (this.showProbandsWithMissingData && this.probanden[i].income == null) || (this.probanden[i].income !== undefined ? this.incChosen.includes(this.probanden[i].income.toString()) == true : false))
                        && (this.jobChosen.includes(this.probanden[i].profession) == true|| (this.showProbandsWithMissingData && this.probanden[i].profession == null) || (this.probanden[i].profession !== undefined ? this.jobChosen.includes(this.probanden[i].profession.toString()) == true : false))
                        && (this.prof2Chosen.includes(this.probanden[i].profession2) == true|| (this.showProbandsWithMissingData && this.probanden[i].profession2 == null) || (this.probanden[i].profession2 !== undefined ? this.prof2Chosen.includes(this.probanden[i].profession2.toString()) == true : false))
                        && ((parseInt(this.probanden[i].environment1) >= this.env1Slider[0] && parseInt(this.probanden[i].environment1) <= this.env1Slider[1]) || (this.showProbandsWithMissingData && this.probanden[i].environment1 == null))
                        && ((parseInt(this.probanden[i].environment2) >= this.env2Slider[0] && parseInt(this.probanden[i].environment2) <= this.env2Slider[1]) || (this.showProbandsWithMissingData && this.probanden[i].environment2 == null))
                        && (this.handsChosen.includes(this.probanden[i].handedness) == true|| (this.showProbandsWithMissingData && this.probanden[i].handedness == null) || (this.probanden[i].handedness !== undefined ? this.handsChosen.includes(this.probanden[i].handedness.toString()) == true : false)) ){
                            tmpProbands.push(this.probanden[i].code)
                    }
                }
                for(let i = 0; i<this.filteredMeasurements.length;i++){//Entfernt dann alle die nicht innerhalb des Filters liegen
                    if(tmpProbands.includes(this.filteredMeasurements[i].proband)  ||  (this.genericChosen && this.filteredMeasurements[i].proband == "Generic")
                    ||(this.showMissingProbands && this.missingProbands.includes(this.filteredMeasurements[i].proband))){
                        tmp.push(this.filteredMeasurements[i])
                    }
                }
                this.filteredMeasurements = JSON.parse(JSON.stringify(tmp))

                tmp = []
                for(let i = 0; i<this.filteredMeasurements.length;i++){//Entfernt dann alle die nicht innerhalb des Filters liegen
                    if(this.showOnline == false){
                        if(this.filteredMeasurements[i].online == false || this.filteredMeasurements[i].online === "undefined" || this.filteredMeasurements[i].online == null){
                            if(this.showOnlineOnly==false){
                                tmp.push(this.filteredMeasurements[i])
                            }
                        }
                    }else{
                        if(this.showOnlineOnly==true){
                            if(this.filteredMeasurements[i].online == true){
                                tmp.push(this.filteredMeasurements[i])
                            }
                        }else{
                            tmp.push(this.filteredMeasurements[i])
                        }
                    }
                }
                this.filteredMeasurements = JSON.parse(JSON.stringify(tmp))
            },
            updateChecked: function(option){
                if(this.findInArray(option, this.materialsChosen) != null){
                    this.materialsChosen = this.materialsChosen.filter(el => el != option)
                }else{
                    this.materialsChosen.push(option)
                }
            },
            toggleCollapse: function(meas){
                if(this.showMeasurement.includes(meas._id)){
                    this.showMeasurement.splice(this.showMeasurement.indexOf(meas._id),1)
                }else{
                    this.showMeasurement.push(meas._id)
                }
            },
            updateMeasurement: function(data){
                delete data.scores
                delete data.updated_at
                delete data.created_at
                axios({url: 'https://'+axios.defaults.baseURL+'/api/answer/update', data: data, method: 'POST' }).then(resp => {
                    console.log(resp)
                    this.loadData()
                }).catch(err => this.errMsg = err)
            },
            deleteMeasurement: function(data){
                axios({url: 'https://'+axios.defaults.baseURL+'/api/answer/delete', data: {"_id": data}, method: 'POST' }).then(() => {
                    this.loadData()
                }).catch(err => console.log(err))
            },
            loadData: function(){
                axios.get('https://'+axios.defaults.baseURL+'/api/answer/getImportant')
                .then(response => {
                    let tmp=[]
                    for(let i=0; i<response.data.return.length; i++){
                        tmp.push(response.data.return[i])
                    }
                    this.measurements = JSON.parse(JSON.stringify(tmp))
                    this.filteredMeasurements = JSON.parse(JSON.stringify(this.measurements))
                    let matIds = []
                    for(let i = 0; i < this.measurements.length; i++){
                        if(this.measurements[i].materials.length > 0){
                            for(let x = 0; x < this.measurements[i].materials.length; x++){
                                if(!(matIds.includes(this.measurements[i].materials[x].id))){
                                        this.availableMaterials.push(this.measurements[i].materials[x])
                                        this.materialsChosen.push(this.measurements[i].materials[x])
                                        matIds.push(this.measurements[i].materials[x].id)
                                    }
                            }
                        }
                    }

                    this.gendersChosen = ["0","1","2"]
                    this.eduChosen = ['0','1','2','3','4','5','6','7','8','9','10','11','12']
                    this.jobChosen = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16']
                    this.incChosen = ['0','1','2','3','4','5','6','7']
                    this.prof2Chosen = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14']

                    axios.get('https://'+axios.defaults.baseURL+'/api/proband/getMinMaxAge')
                    .then(response => {
                        this.sliderOptions.min = parseInt(response.data.minAge)
                        this.sliderOptions.max = parseInt(response.data.maxAge)
                        this.sliderOptions.marks[0] = this.sliderOptions.min
                        this.sliderOptions.marks[1] = this.sliderOptions.max-((this.sliderOptions.max - this.sliderOptions.min)/2)
                        this.sliderOptions.marks[2] = this.sliderOptions.max
                        this.ageSlider[0] = this.sliderOptions.min//(this.sliderOptions.max -this.sliderOptions.min)/3
                        this.ageSlider[1] = this.sliderOptions.max//((this.sliderOptions.max -this.sliderOptions.min)/3)*2
                        
                        this.$refs.ageSlider.setValue(this.ageSlider)
                    }).catch(error => {console.log(error); this.loading = false})  

                    axios.get('https://'+axios.defaults.baseURL+'/api/proband/getAll')
                    .then(response => {
                        this.probanden = response.data.probanden
                        let tmpProbandCodes = []
                        for(let i = 0; i < this.probanden.length; i++){
                            tmpProbandCodes.push(this.probanden[i].code)
                        }
    
                        //Finde alle Probanden die nicht mehr online existieren aber noch in den Messungen sind, falls gewünscht
                        if(this.showMissingProbands == true){
                            for(let i = 0; i < this.measurements.length; i++){
                                if(tmpProbandCodes.includes(this.measurements[i].proband) == false && this.measurements[i].proband != "Generic"){
                                    this.missingProbands.push(this.measurements[i].proband)
                                }
                            }
                        }
                        this.filterAll()
                    }).catch(error => {console.log(error)})
                }).catch(error => {console.log(error)})    
            },
            generateScores: function(measurements){//Hier werden die Scores generiert, nimmt nur Zahlen
                if(Object.prototype.hasOwnProperty.call(measurements,"materials") && measurements.materials != null){
                    for(let i = 0; i < measurements.materials.length; i++){
                        let T0MI = 0
                        let T1OIME = 0
                        let T2IEME = 0
                        let T1HIME = 0
                        let T2HEME = 0
                        let T3E = 0
                        let T4SI = 0
                        let T5MA = 0
                        measurements.materials[i].scores = {"T0MI": 0,"T1OIME": 0,"T2IEME": 0,"T1HIME": 0,"T2HEME": 0,"T3E": 0,"T4SI": 0,"T5MA": 0,}
                        measurements.materials[i].scores["T0MI"] = 0
                        measurements.materials[i].scores["T1OIME"] = 0
                        measurements.materials[i].scores["T2IEME"] = 0
                        measurements.materials[i].scores["T1HIME"] = 0
                        measurements.materials[i].scores["T2HEME"] = 0
                        measurements.materials[i].scores["T3E"] = 0
                        measurements.materials[i].scores["T4SI"] = 0
                        measurements.materials[i].scores["T5MA"] = 0
                        
                        for(let y = 0; y < measurements.answers.length; y++){
                            if(Object.prototype.hasOwnProperty.call(measurements.answers[y],"material") && measurements.answers[y].material != null){
                                let awData = this.getAnswerData(measurements.answers[y])
                                if(typeof awData == "number" && measurements.answers[y].material.id == measurements.materials[i].id){
                                    switch(measurements.answers[y].module){
                                        case "T0 MN":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T0MI"] += awData
                                                T0MI++
                                            }
                                            break;
                                        case "OPTIK T1 IME":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T1OIME"] += awData
                                                T1OIME++
                                            }
                                            break;
                                        case "OPTIK T2 EME":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T2IEME"] += awData
                                                T2IEME++
                                            }
                                            break;
                                        case "HAPTIK T1 IME":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T1HIME"] += awData
                                                T1HIME++
                                            }
                                            break;
                                        case "HAPTIK T2 EME":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T2HEME"] += awData
                                                T2HEME++
                                            }
                                            break;
                                        case "T3 EMO ME":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T3E"] += awData
                                                T3E++
                                            }
                                            break;
                                        case "T4 SI":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T4SI"] += awData
                                                T4SI++
                                            }
                                            break;
                                        case "T5 MA":
                                            if(awData != 0){
                                                measurements.materials[i].scores["T5MA"] += awData
                                                T5MA++
                                            }
                                            break;
                                    }
                                }
                            }
                        }
                        measurements.materials[i].scores["T0MI"] = measurements.materials[i].scores["T0MI"] != 0 ? measurements.materials[i].scores["T0MI"]/T0MI : 0
                        measurements.materials[i].scores["T1OIME"] = measurements.materials[i].scores["T1OIME"] != 0 ? measurements.materials[i].scores["T1OIME"]/T1OIME : 0
                        measurements.materials[i].scores["T2IEME"] = measurements.materials[i].scores["T2IEME"] != 0 ? measurements.materials[i].scores["T2IEME"]/T2IEME : 0
                        measurements.materials[i].scores["T1HIME"] = measurements.materials[i].scores["T1HIME"] != 0 ? measurements.materials[i].scores["T1HIME"]/T1HIME : 0
                        measurements.materials[i].scores["T2HEME"] = measurements.materials[i].scores["T2HEME"] != 0 ? measurements.materials[i].scores["T2HEME"]/T2HEME : 0
                        measurements.materials[i].scores["T3E"] = measurements.materials[i].scores["T3E"] != 0 ? measurements.materials[i].scores["T3E"]/T3E : 0
                        measurements.materials[i].scores["T4SI"] = measurements.materials[i].scores["T4SI"] != 0 ? measurements.materials[i].scores["T4SI"]/T4SI : 0
                        measurements.materials[i].scores["T5MA"] = measurements.materials[i].scores["T5MA"] != 0 ? measurements.materials[i].scores["T5MA"]/T5MA : 0
                    }
                }
                for(let i = 0; i < this.measurements.length; i++){
                    if(this.measurements[i]._id == measurements._id){
                        this.measurements[i] = measurements
                    }
                }
                this.filteredMeasurements = JSON.parse(JSON.stringify(this.measurements))
                console.log(this.filteredMeasurements)
            },
            getAnswerData: function(answerRaw){
                if(answerRaw.questionType ==  "polygonGraph" || answerRaw.questionType == "slider"){
                    return answerRaw.answer
                }else if(answerRaw.questionType == "matrix"){
                    return (answerRaw.answer[0] + answerRaw.answer[1])/2
                }else if(answerRaw.questionType == "matrix_circle"){
                    return (answerRaw.answer[0] + answerRaw.answer[1] + answerRaw.answer[2])/3
                }
                return 0
            },
            editMeasurement: function(measurement){
                if(this.editField != measurement){
                    this.editField = measurement
                    axios({url: 'https://'+axios.defaults.baseURL+'/api/answer/getMeasurement', data: {measurements: [measurement]}, method: 'POST' }).then(response => {
                        this.editingMeasurementData = JSON.stringify(response.data.answers[0])
                    }).catch(error => {console.log(error)})   
                }else{
                    this.editField = ""
                }
            },
            score: function(measurement){
                axios({url: 'https://'+axios.defaults.baseURL+'/api/answer/getMeasurement', data: {measurements: [measurement]}, method: 'POST' }).then(response => {
                    console.log(response)
                    this.generateScores(response.data.answers[0])
                }).catch(error => {console.log(error)})   
            }
        },
        mounted: function(){
            this.loadData()
        }
    }
</script>

<style scoped>

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

.deleteButton:hover{
    background-color: #afafaf;
}

.slider{
    margin-top:45px;
    margin-left:auto;
    margin-right: auto;
    width: 80%;
    height: 45px;
}

.custom-mark {
        position: absolute;
        top: 10px;
        transform: translateX(-50%);
    }
    
    

    .slider-text{
        margin-bottom:70px;
        font-weight: 500;
        font-size: 22px;
    }

    .custom-dot{    
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #212529;
        transition: all .3s;
    }

    .custom-tooltip {
        width: 40px;
        height: 30px;
        text-align: center;
        color: #f9f9f9;
        background-color: #212529;
        line-height: 1.9rem;
    }

    .custom-tooltip::after{
        content: "";
        position: absolute;
        transform: rotate(45deg) scale(1);
        opacity:1;
        left: 14px;
        top: 24px;
        width: 9px;
        height: 9px;
        border: solid #212529;
        border-width: 0 2px 2px 0px;
        background-color: #212529;
        border-radius: 0;
    }

    .tooltip{
        width: 40px;
        height: 25px;
        position:absolute;
        text-align: center;
        color: #f9f9f9;
        background-color: #212529;
    }

    .tooltip-text{
        margin:0 auto;
    }

    .slidercontainer{
        position:relative;
        height:100px
    }

.filter{
    margin-bottom: 25px;
}
.arrow-down {
  width: 0; 
  height: 0; 
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
  position: relative;
  top:9px;
  float: right;
  right:5px;
}

.arrow-right {
  border-left: 60px solid green;
  width: 0; 
  height: 0; 
  border-left: 8px solid white;
  border-bottom: 8px solid transparent;
  border-top: 8px solid transparent;
  position: relative;
  top:5px;
  float: right;
  right:5px;
}

    .wrapper{
        height: 100%;
        width: 100%;
        position: relative;
        top:unset;
        bottom: unset;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: row;
	}
    .left-side{
        width:30%;
        height: 100%;
        overflow:auto;
		background-color: #e6e6e6;
	}

	.right-side{
		width:70%;
        height: 100%;
		background-color: #f9f9f9;
	}
    .admin-measurements-wrapper{
        width:100%;
    }

    .measurements-overview-wrapper{
        width:85%;
        margin:0 auto;
        overflow: auto;
    }
    
    .measurement-box{
        margin-top: 25px;
    }

    .measurement-header{
        color:white;
        background: #000000;
        min-height:32px;
        height: fit-content;
    }

    .measurement-header-text{
        padding-top:3px;
        padding-left:15px;
    }

    .measurement-table{
        width:100%;
    }

    .measurement-table,th, td{
        border: 1px solid black;
        border-collapse: collapse;
        padding: 3px;
    }
    th{
        text-align: left;
        font-weight: 500;
    }

    .measurement-collapse{
        border: 1px solid black;
    }

    .checkbox-wrapper{
        display:flex;
        margin: 10px;
        position: relative;
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

    .textarea{
        width: 100%;
        height: 800px;
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
     .radio-wrapper{
        display:flex;
        position: relative;
    }

    .radio-text{
        margin-top: 5px;
    }


    .radio-label {
        display: block;
        position: relative;
        cursor: pointer;
        font-size: 22px;
        line-height: 24px;
        height: 24px;
        width: 24px;
        clear: both;
        margin:5px;
    }

    .radio-label input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    .radio-label .radio-custom {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 24px;
        width: 24px;
        background-color: transparent;
        border-radius: 5px;
        transition: all 0.3s ease-out;
        border: 2px solid #212529;
    }


    .radio-label input:checked ~ .radio-custom {
        background-color: #212529;
        border-radius: 5px;
        transform: rotate(0deg) scale(1);
        opacity:1;
        border: 2px solid #212529;
    }


    .radio-label .radio-custom::after {
        position: absolute;
        content: "";
        left: 12px;
        top: 12px;
        height: 0px;
        width: 0px;
        border-radius: 5px;
        border: solid #212529;
        border-width: 0 3px 3px 0;
        transform: rotate(0deg) scale(0);
        opacity:1;
        transition: all 0.3s ease-out;
    }


    
    .radio-label .radio-custom.circular {
        border-radius: 50%;
        border: 2px solid #212529;
    }

    .radio-label input:checked ~ .radio-custom.circular {
        background-color: #212529;
        border-radius: 50%;
        border: 2px solid #212529;
        box-shadow: inset 0 0 0 4px #f9f9f9;
    }
    .radio-label input:checked ~ .radio-custom.circular::after {
        border: solid #212529;
        border-width: 0 2px 2px 0;
    }
    .radio-label .radio-custom.circular::after {
        border-radius: 50%;
    }

    .radio-label .radio-custom.circular::before {
        border-radius: 50%;
        border: 2px solid #212529;
    }

    .radio-label input:checked ~ .radio-custom.circular::before {
        border-radius: 50%;
    }

    .loading-measurements-wrapper{
        width: 100%;
        height: 100%;
        position: absolute;
        background-color: rgba(0,0,0,0.4);
        top:0px;
        display: flex;
    }
    
    .loading-logo{
        margin:auto;
    }
</style>