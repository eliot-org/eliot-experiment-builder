<template>
    <div class="admin-probanden-wrapper">
        <a id="downloadAnchorElem" style="display:none"></a>
        <div class="probanden-overview-wrapper"> 
            <div>
                Anzahl Probanden: {{probanden.length}}
                <button @click="probandExport()">Download</button> <br>
                Neuen Proband anlegen:<br>
                Alter:
                <input type="text" id="newProbandAge" name="newProbandAge" v-model="newProband.age"><br>
                Geschlecht:
                <v-select label="name" :options="probandOptions.gender" v-model="newProband.gender" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Bildung: 
                <v-select label="name" :options="probandOptions.education" v-model="newProband.education" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Beruf: 
                <v-select label="name" :options="probandOptions.profession" v-model="newProband.profession" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Studienwahl: 
                <v-select label="name" :options="probandOptions.profession2" v-model="newProband.profession2" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Einkommen: 
                <v-select label="name" :options="probandOptions.income" v-model="newProband.income" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Herkunft: 
                <v-select label="name" :options="probandOptions.countrynames" v-model="newProband.origin" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Letzte 5 Jahre Wohnort: 
                <v-select label="name" :options="probandOptions.countrynames" v-model="newProband.residence" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Aufwachsen Zivilisationsnähe: 
                <input type="text" id="newProbandEnvironment1" name="newProbandEnvironment1" v-model="newProband.environment1"><br>
                Letzte 5 Jahre Zivilisationsnähe: 
                <input type="text" id="newProbandEnvironment2" name="newProbandEnvironment2" v-model="newProband.environment2"><br>
                Links-Rechts-Händer: 
                <v-select label="name" :options="probandOptions.handedness" v-model="newProband.handedness" class="selector" style="margin-left:180px;margin-top:-19px;width:30%"></v-select><br>
                Kopfumfang: 
                <input type="text" id="newProbandHead" name="newProbandHead" v-model="newProband.head"><br>
                <button @click="addProband(newProband)">
                    Hinzufügen
                </button>
                {{newProbandCode}}
            </div>    
            <div class="proband-box" v-for="(proband,index) in probanden" v-bind:key="index">
                <div class="proband-header" @click="toggleCollapse(proband)">
                        <div class="proband-header-text">
                            {{proband.code}}
                            <button @click="deleteProband(proband._id)" class="deleteButton">
                                Löschen
                            </button>
                        </div>
                    </div>
                <transition name="slide">
                    <div class="proband-collapse" v-show="showProband.includes(proband)">
                        <table class="proband-table">
                            <tr>
                                <th>Alter:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'age'" @click="editField = proband; editType = 'age'">{{proband.age}} Jahre</div>
                                    <input v-show="editField == proband && editType == 'age'" type="text" @focus="editField = proband; editType = 'age'" @blur="blurField()" v-bind:placeholder="proband.age" v-model="editField.age">
                                </th>
                            </tr>
                            <tr>
                                <th>Geschlecht:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'gender'" @click="editField = proband; editType = 'gender'">({{proband.gender}}) {{decodeProbandData("gender", proband.gender)}}</div>
                                    <input v-show="editField == proband && editType == 'gender'" type="text" @focus="editField = proband; editType = 'gender'" @blur="blurField()" v-bind:placeholder="proband.gender" v-model="editField.gender">
                                </th>
                            </tr>
                            <tr>
                                <th>Bildung:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'education'" @click="editField = proband; editType = 'education'">({{proband.education}}) {{decodeProbandData("education", proband.education)}}</div>
                                    <input v-show="editField == proband && editType == 'education'" type="text" @focus="editField = proband; editType = 'education'" @blur="blurField()" v-bind:placeholder="proband.education" v-model="editField.education">
                                </th>
                            </tr>
                            <tr>
                                <th>Beruf:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'profession'" @click="editField = proband; editType = 'profession'">({{proband.profession}}) {{decodeProbandData("profession", proband.profession)}}</div>
                                    <input v-show="editField == proband && editType == 'profession'" type="text" @focus="editField = proband; editType = 'profession'" @blur="blurField()" v-bind:placeholder="proband.profession" v-model="editField.profession">
                                </th>
                            </tr>
                            <tr>
                                <th>Studienwahl:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'profession2'" @click="editField = proband; editType = 'profession2'">({{proband.profession2}}) {{decodeProbandData("profession2", proband.profession2)}}</div>
                                    <input v-show="editField == proband && editType == 'profession2'" type="text" @focus="editField = proband; editType = 'profession2'" @blur="blurField()" v-bind:placeholder="proband.profession2" v-model="editField.profession2">
                                </th>
                            </tr>
                            <tr>
                                <th>Einkommen:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'income'" @click="editField = proband; editType = 'income'">({{proband.income}}) {{decodeProbandData("income", proband.income)}}</div>
                                    <input v-show="editField == proband && editType == 'income'" type="text" @focus="editField = proband; editType = 'income'" @blur="blurField()" v-bind:placeholder="proband.income" v-model="editField.income">
                                </th>
                            </tr>
                            <tr>
                                <th>Herkunft:</th>
                                <th>
                                    <div v-show="editField != proband  || editType != 'origin'" @click="editField = proband; editType = 'origin'">({{proband.origin}}) {{decodeProbandData("origin", proband.origin)}}</div>
                                    <input v-show="editField == proband && editType == 'origin'" type="text" @focus="editField = proband; editType = 'origin'" @blur="blurField()" v-bind:placeholder="proband.origin" v-model="editField.origin">
                                </th>
                            </tr>
                            <tr>
                                <th>Letzte 5 Jahre Wohnort:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'residence'" @click="editField = proband; editType = 'residence'">({{proband.residence}}) {{decodeProbandData("residence", proband.residence)}}</div>
                                    <input v-show="editField == proband && editType == 'residence'" type="text" @focus="editField = proband; editType = 'residence'" @blur="blurField()" v-bind:placeholder="proband.residence" v-model="editField.residence">
                                </th>
                            </tr>
                            <tr>
                                <th>Aufwachsen Zivilisationsnähe:</th>
                                <th>
                                    <div v-show="editField != proband|| editType != 'environment1'" @click="editField = proband; editType = 'environment1'">{{proband.environment1}}</div>
                                    <input v-show="editField == proband && editType == 'environment1'" type="text" @focus="editField = proband; editType = 'environment1'" @blur="blurField()" v-bind:placeholder="proband.environment1" v-model="editField.environment1">
                                </th>
                            </tr>
                            <tr>
                                <th>Letzte 5 Jahre Zivilisationsnähe:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'environment2'" @click="editField = proband; editType = 'environment2'">{{proband.environment2}}</div>
                                    <input v-show="editField == proband && editType == 'environment2'" type="text" @focus="editField = proband; editType = 'environment2'" @blur="blurField()" v-bind:placeholder="proband.environment2" v-model="editField.environment2">
                                </th>
                            </tr>
                            <tr>
                                <th>Links-Rechts-Händer:</th>
                                <th>
                                    <div v-show="editField != proband || editType!= 'handedness'" @click="editField = proband; editType = 'handedness'">({{proband.handedness}}) {{decodeProbandData("handedness", proband.handedness)}}</div>
                                    <input v-show="editField == proband && editType == 'handedness'" type="text" @focus="editField = proband; editType = 'handedness'" @blur="blurField()" v-bind:placeholder="proband.handedness" v-model="editField.handedness">
                                </th>
                            </tr>
                            <tr>
                                <th>Kopfumfang:</th>
                                <th>
                                    <div v-show="editField != proband || editType != 'head'" @click="editField = proband; editType = 'head'">{{proband.head}} cm</div>
                                    <input v-show="editField == proband && editType == 'head'" type="text" @focus="editField = proband; editType = 'head'" @blur="blurField()" v-bind:placeholder="proband.head" v-model="editField.head">
                                </th>
                            </tr>
                            <tr>
                                <th>Code:</th>
                                <th>{{proband.code}}</th>
                            </tr>
                        </table>
                        
                        <button @click="updateProband(proband)" class="saveButton">
                            Speichern
                        </button>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    const countrynames = require("countrynames")
    export default {
        data: function( ){
            return{
                //all subjects that exist
                probanden: [],
                //data of a new subject to create
                newProband: {},
                //which probands data to show
                showProband: [],
                //which field/subject is being edited
                editField: {},
                //what field exactly is being edited
                editType: "",
                //the code of a subject that was created on this page
                newProbandCode: "",
                //all possible options to choose from for a subject
                probandOptions: {
                    gender: [{"name":"Männlich","id":2},{"name":"Weiblich","id":1},{"name":"Anders","id":0}],
                    education: [{"name":"Kein Schulabschluss","id":0},{"name":"Grund-/Hauptschulabschluss","id":1},{"name":"Mittlere Reife (Realschulabschluss)","id":2},
                    {"name":"Fachhochschulabschluss","id":3},{"name":"Allgemeine Hochschulreife (Abitur)","id":4},{"name":"Abgeschlossene Ausbildung","id":5},
                    {"name":"Bachelor","id":6},{"name":"Master","id":7},{"name":"Promotion","id":8},{"name":"Sonstiges","id":9},
                    {"name":"Staatsexamen","id":10},{"name":"Approbation","id":11},{"name":"Diplom","id":12},{"name":"Meister","id":13}],
                    profession: [{"name":"Schüler*in","id":0},{"name":"Student*in","id":1},{"name":"Akademischer Beruf","id":2},
                    {"name":"Techniker*in und gleichrangiger nichttechnischer Beruf","id":3},{"name":"Führungskraft","id":4},{"name":"Medizinischer und Pflegeberuf","id":5},
                    {"name":"Projektarbeits und Entwicklungskraft","id":6},{"name":"Lehrkraft","id":7},{"name":"Bürokraft und verwandter Beruf","id":8},{"name":"Dienstleistungsberuf und Verkäufer*in","id":9},
                    {"name":"Fachkräfte in der Landwirtschaft und Fischerei","id":10},{"name":"Handwerks- und verwandter Beruf","id":11},
                    {"name":"Anlagen- und Maschinenbediener*in und Montageberuf","id":12},{"name":"Hilfsarbeitskraft","id":13},{"name":"Militärischer Beruf","id":14}
                    ,{"name":"Arbeitssuchend","id":15},{"name":"Selbständigkeit & Freiberuflichkeit","id":16},{"name":"Sonstiges","id":17}],
                    profession2: [{"name":"keine Ausbildung / kein Studium","id":0},{"name":"Agrar- und Forst­wissenschaften","id":1},
                    {"name":"Gesellschafts- und Sozial­wissenschaften","id":2},{"name":"Ingenieur­wissenschaften","id":3},
                    {"name":"Kunst","id":4},{"name":"Musik","id":5},{"name":"Design","id":6},
                    {"name":"Mathematik","id":7},{"name":"Naturwissenschaften","id":8},{"name":"Medizin","id":9},{"name":"Gesund­heitswissen­schaften/-/-wirtschaft","id":10},
                    {"name":"Sprach- und Kulturwissen­schaften","id":11},{"name":"Wirtschafts- und Rechts­wissenschaften","id":12},
                    {"name":"Lehramt","id":13},{"name":"Öffentliche Verwaltung","id":14},{"name":"Sonstiges","id":15}],
                    income: [{"name":"Unter 400€","id":0},{"name":"400€ - 1000€","id":1},{"name":"1000€ - 1500€","id":2},
                    {"name":"1500€ - 2500€","id":3},{"name":"2500€ - 4000€","id":4},{"name":"4000€ - 6000€","id":5},
                    {"name":"Über 6000€","id":6},{"name":"Keine Angabe","id":7}],
                    handedness:[{"name":"Links","id":0},{"name":"Rechts","id":1}],
                    countrynames: countrynames.getAllNames(),
                }
            }
        },
        methods:{
            //export the data of a subject
            probandExport: function(){
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({"array":this.probanden}));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "probanden.json");
                dlAnchorElem.click();
            },
            //focus on a specific field to edit it
            focusField(proband){
                this.editField = proband;
            },
            //blur that field when finished editing
            blurField(){
                for(var i=0;i<this.probanden.length;i++){
                    if(this.probanden[i]._id == this.editField._id){
                        this.probanden[i] = this.editField
                    }
                }
                this.editField = '';
                this.editType = ""
            },
            //
            showField(proband){
                return this.editField == proband
            },
            //decodes the probands data to something more useful
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
            //toggles a collapsible
            toggleCollapse: function(prob){
                if(this.showProband.includes(prob)){
                    this.showProband.splice(this.showProband.indexOf(prob),1)
                }else{
                    this.showProband.push(prob)
                }
            },
            //loads all subjects
            loadData: function(){
                axios.get('https://'+axios.defaults.baseURL+'/api/proband/getAll')
                .then(response => {
                    var tmp=[]
                    for(var i=0; i<response.data.probanden.length; i++){
                        /*tmp.push({"id": response.data.probands[i]._id, "age":response.data.probands[i].age, "gender":response.data.probands[i].gender,
                        "education":response.data.probands[i].education, "profession":response.data.probands[i].profession, "income":response.data.probands[i].income,
                        "origin":response.data.probands[i].origin, "residence":response.data.probands[i].residence, "environment1":response.data.probands[i].environment1,
                        "environment2":response.data.probands[i].environment2, "handedness":response.data.probands[i].handedness, "head":response.data.probands[i].head,
                        "code":response.data.probands[i].code})*/
                        tmp.push(response.data.probanden[i])
                    }
                    this.probanden = tmp
                    
                })
                .catch(error => console.log(error))
            },
            //deletes a subject
            deleteProband: function(data){
                axios({url: 'https://'+axios.defaults.baseURL+'/api/proband/delete', data: {"_id": data.toString()}, method: 'POST' }).then(() => {
                    this.loadData()
                }).catch(err => console.log(err))
            },
            //creates a new subject
            addProband: function(data){
                try{
                    data.gender = data.gender.id
                    data.education = data.education.id
                    data.profession = data.profession.id
                    data.profession2 = data.profession2.id
                    data.income = data.income.id
                    data.handedness = data.handedness.id
                    data.origin = countrynames.getCode(data.origin)
                    data.residence = countrynames.getCode(data.residence)
                }catch(e){
                    this.newProbandCode = e
                }
                if(data != ""){
                    axios({url: 'https://'+axios.defaults.baseURL+'/api/proband/store', data: data, method: 'POST' }).then(resp => {
                        this.loadData()
                        //this.newProband = {}
                        this.newProbandCode = resp.data.proband.code
                    }).catch(err => this.newProbandCode = err)
                }
            },
            //updates the data of a subject
            updateProband: function(data){
                axios({url: 'https://'+axios.defaults.baseURL+'/api/proband/update', data: data, method: 'POST' }).then(() => {
                    this.loadData()
                }).catch(err => console.log(err))
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
    .admin-probanden-wrapper{
        width:100%;
    }

    .probanden-overview-wrapper{
        width:85%;
        margin:0 auto;
    }
    
    .proband-box{
        margin-top: 25px;
    }

    .proband-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .proband-header-text{
        padding-top:3px;
        padding-left:15px;
    }

    .proband-table{
        width:100%;
    }

    .proband-collapse{
        border: 1px solid black;
    }

    .proband-table,th, td{
        border-collapse: collapse;
        padding: 3px;
    }
    th{
        text-align: left;
        font-weight: 500;
    }

    .saveButton{
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

    .saveButton:hover{
		color: white;
        background-color: #353535;
    }
</style>