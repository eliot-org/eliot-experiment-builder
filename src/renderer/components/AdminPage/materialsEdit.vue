<template>
    <div class="admin-materials-wrapper">
        <div class="materials-overview-wrapper">
            <div>
                Anzahl Materialien: {{materials.length}}<br>
                Neues Material anlegen:<br>
                Name:
                <input type="text" id="newMaterialName" name="newMaterialName" v-model="newMaterial.name"><br>
                Information:
                <input type="text" id="newMaterialInfos" name="newMaterialInfos" v-model="newMaterial.information"><br>
                Bild-/Videoname: 
                <input type="text" id="newMaterialImage" name="newMaterialImage" v-model="newMaterial.image"><br>
                Zeige Extrabild/-video: (true/false)
                <!--<input type="text" id="newMaterialShowExtraImg" name="newMaterialShowExtraImg" v-model="newMaterial.showExtraImg">--> 
                <input type="text" id="newMaterialshowExtraImg" name="newMaterialImage" v-model="newMaterial.showExtraImg"><br>
                Extrabild/-video: 
                <input type="text" id="newMaterialExtraImg" name="newMaterialExtraImg" v-model="newMaterial.extraImg"><br>
                BOM Id:
                <input type="number" id="newMaterialBomId" name="newMaterialBomId" v-model="newMaterial.bomId"><br>
                Position für Roboter:
                <select name="roboPos" id="roboPos" v-model="newMaterial.roboPos">
                    <option v-for="(pos, y) in roboPosSelectors" v-bind:key="y" v-bind:value="pos">{{pos}}</option>
                </select><br>
                <button @click="addMaterial(newMaterial)">
                    Hinzufügen
                </button>
            </div>
            <div class="materials-box" v-for="(material,index) in materials" v-bind:key="index">
                <div class="materials-header" @click="toggleCollapse(material)">
                    <div class="materials-header-text">  
                        {{material.name}}
                        <button @click="deleteMaterial(material._id)" class="deleteButton">
                            Löschen
                        </button>
                    </div>
                </div>
                <div class="materials-collapse" v-show="showMaterial.includes(material._id)">
                    <div class="material-element">
                        <div class="leftsidetext">Id:</div>
                        <div class="editField">
                            {{material._id}}
                        </div>
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">Name:</div>
                        <input type="text" v-model="material.name">
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">Informationen: </div>
                        <input v-model="material.information">
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">Bild-/Videoname: </div>
                        <input v-model="material.image">
                    </div>
                    <hr>
                    <div class="material-element-selector">
                        <div class="leftsidetext">Zeige Extrabild/-video:</div>
                        <input v-model="material.showExtraImg">
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">Extrabild/-video: </div>
                        <input v-model="material.extraImg">
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">Position: </div>
                        <input v-bind:max="materials.length" type="number" v-model="material.position">
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">BOM Id: </div>
                        <input type="number" v-model="material.bomId">
                    </div>
                    <hr>
                    <div class="material-element">
                        <div class="leftsidetext">Position für Roboter:</div>
                        <select v-model="material.roboPos">
                            <option v-for="(pos, y) in roboPosSelectors" v-bind:key="y" v-bind:value="pos">{{pos}}</option>
                        </select>
                    </div>
                    <hr>
                    <button @click="updateMaterial(material)" class="saveButton">
                        Speichern
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data: function( ){
            return{
                //all materials available
                materials: [],
                //data to create new material
                newMaterial: {
                    name: "",
                    information: "",
                    image: "",
                    showExtraImg: false,
                    extraImg: "",
                    bomId: 0,
                    roboPos: "",
                },
                //which materials data to show
                showMaterial: [],
                //has the order of the materials changed?
                hasOrderChanged: false,
                //
                boolOptions: [{"name":"true","id":"true"},{"name":"false","id":"false"}],
                //Selectors für robot position, where to get material from
                roboPosSelectors: ["","A1","A2","A3","B1","B2","B3","C1","C2","C3","D1","D2","D3"/*,"LA1","LA2","LA3","LB1","LB2","LB3","LC1","LC2","LC3","LD1","LD2","LD3"*/]
            }
        },
        methods:{
            //Updates the order of the materials so that there are no holes or doubles in it
            updateMaterialOrder: function(reference){
                //Ist das Loch vor oder hinter der neuen Pos?(Materials ist geordnet bis auf das bearbeitete Element)
                if(reference.position < this.editField.position){//Wenn neu pos größer ist, also nach hinten geschoben wurde
                    let end = this.editField.position//Von wo aus gestartet wird, neue pos
                    let start = reference.position //Bis wohin verschoben werden muss
                    //let toMove = reference.position-this.editField.position //Wie viele geschoben werden müssen
                    for(let i = 0; i < this.materials.length; i++){//Finde den doppelten
                        if(this.materials[i]._id != this.editField._id && this.materials[i].position > start && this.materials[i].position <= end){
                            this.materials[i].position--
                        }
                    }
                    this.hasOrderChanged = true
                    console.log(this.materials)
                }else if(reference.position > this.editField.position){//Wenn neue pos kleiner ist, also nach vorne geschoben wurde
                    let start = this.editField.position//Von wo aus gestartet wird, neue pos
                    let end = reference.position //Bis wohin verschoben werden muss
                    //let toMove = reference.position-this.editField.position //Wie viele geschoben werden müssen
                    for(let i = 0; i < this.materials.length; i++){//Finde den doppelten
                        if(this.materials[i]._id != this.editField._id && this.materials[i].position >= start && this.materials[i].position < end){
                            this.materials[i].position++
                        }
                    }
                    this.hasOrderChanged = true
                    console.log(this.materials)
                }
                this.blurField()
            },
            //Toggles a collapsible
            toggleCollapse: function(mat){
                if(this.showMaterial.includes(mat._id)){
                    this.showMaterial.splice(this.showMaterial.indexOf(mat._id),1)
                }else{
                    this.showMaterial.push(mat._id)
                }
            },
            //Loads all materials, ordered
            loadData: function(){
                
            },
            //deletes a material and changes order accordingly
            deleteMaterial: function(data){
                //Alle die größer sind müssen nach vorne geschoben werden
                let end = this.materials.length
                let start = data.position
                for(let i = 0; i < this.materials.length; i++){
                    if(this.materials[i]._id != data._id && this.materials[i].position > start && this.materials[i].position <= end){
                        this.materials[i].position--
                    }
                }
                for(let i = 0; i < this.materials.length; i++){
                    if(this.materials[i]._id != data._id){
                        
                    }
                }
            },
            //Create a new material
            addMaterial: function(data){
                console.log(data)
                if(data.extraImg == ""){delete data.extraImg}
                if(data.image == ""){delete data.image}
                if(data.information == ""){delete data.information}
                if(data.showExtraImg == ""){delete data.showExtraImg}
                if(data.showExtraImg != null){
                    data.showExtraImg = data.showExtraImg === "true"
                }
                if(data.bomId == ""){delete data.bomId}
                data.position = (this.materials.length+=1)
                console.log(data)
               
            },
            //Update a materials data
            updateMaterial: function(data){
                if(this.hasOrderChanged == true){
                    for(let i = 0; i < this.materials.length; i++){
                        if(this.materials[i]._id != data._id){
                            
                        }
                    }
                    this.hasOrderChanged = false
                }
                console.log(data)
            },
            //get information of specific material
            getDataVar(data){
                var tmp = {"name": data.name, "_id": data._id, "position": parseInt(data.position), "roboPos": data.roboPos}
                console.log(tmp)
                if(data.information != null){
                    if(data.information != ""){
                        tmp.information = data.information
                    }
                }
                if(data.image != null){
                    if(data.image != ""){
                        tmp.image = data.image
                    }
                }
                if(data.showExtraImg != null){
                    tmp.showExtraImg = data.showExtraImg === "true"
                }
                if(data.extraImg != null){
                    if(data.extraImg != ""){
                        tmp.extraImg = data.extraImg
                    }
                }
                if(data.bomId != null){
                    if(data.bomId != ""){
                        tmp.bomId = parseInt(data.bomId)
                    }
                }
                console.log(tmp)
                return tmp
            }
        },
        //init page
        mounted: function(){
            this.loadData()
        }
    }
</script>

<style scoped>
    .admin-materials-wrapper{
        width:100%;
    }

    .materials-overview-wrapper{
        width:85%;
        margin:0 auto;
    }
    
    .materials-box{
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .materials-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .materials-header-text{
        padding-top:3px;
        padding-left:15px;
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

    .deleteButton:hover{
        background-color: #afafaf;
    }

    .material-element{
        height: 22px;
        width:100%;
    }
    .material-element-selector{
        height: 35px;
        width:100%;
    }
    
    .editField{
        display:block;
        min-width: 100px;
        float: left;
    }

    .leftsidetext{
        float: left;
    }

    .materials-collapse{
        border: 1px solid black;
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