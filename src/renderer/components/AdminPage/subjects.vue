<template>
    <div class="admin-subjects-wrapper">
        <a id="downloadAnchorElem" style="display:none"></a>
        <div class="subjects-overview-wrapper"> 

            <div class="subjects-box">
                <div class="subjects-header">
                    <div class="subjects-header-text"> 
                        Add new Subject:
                    </div>
                </div>
                <div class="subjects-collapse">
                    <div v-for="(property, index) in subjectProperties" v-bind:key="index" style="margin-left: 10px">
                        {{property}}:
                        <input style="border-style:solid;" type="text" v-model="newSubject[property]">
                        <button class="saveButton" @click="delete newSubject[property]; subjectProperties.splice(subjectProperties.indexOf(property),1)">-</button>
                    </div>
                    <hr>
                    <div style="margin-left: 10px">
                        New Property: 
                        <input style="border-style:solid;" type="text" v-model="newProperty"> 
                        <button class="saveButton" @click="subjectProperties.push(newProperty)">+</button>
                    </div>
                    <hr>
                    <div>
                        <button @click="addSubject()" class="saveButton">
                            Add
                        </button>
                    </div>
                </div>
            </div>
            Number of Subjects: {{subjects.length}} <button class="saveButton" @click="probandExport()">Download</button><br><hr>
            <div class="subjects-box" v-for="(subject ,index) in subjects" v-bind:key="index">
                <div class="subjects-header" @click="toggleCollapse(subject)">
                    <div class="subjects-header-text">  
                        {{subject.code}}
                        <button @click="deleteSubject(subject._id)" class="deleteButton">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="subjects-collapse" v-show="showSubject.includes(subject._id)">
                    <div class="subject-element">
                        <div class="leftsidetext">Id:</div>
                        <div class="editField">
                            {{subject._id}}
                        </div>
                    </div>
                    <hr>
                    <div v-for="(key, index2) in Object.keys(subject)" v-bind:key="index2">
                        <div class="subject-element" v-if="key !== '_id'">
                            <div class="leftsidetext">{{key}}: </div>
                            <input style="border-style:solid;" type="text" v-model="subject[key]" @change="updateSubject()">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data: function( ){
            return{
                //all subjects that exist
                subjects: [],
                //data of a new subject to create
                newSubject: {},
                //which probands data to show
                showSubject: [],
                //
                subjectProperties: [],
                newProperty: "",
            }
        },
        methods:{
            //export the data of a subject
            subjectExport: function(){
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({"array":this.subjects}));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "subjects.json");
                dlAnchorElem.click();
            },
            //toggles a collapsible
            toggleCollapse: function(subj){
                if(this.showSubject.includes(subj._id)){
                    this.showSubject.splice(this.showSubject.indexOf(subj._id),1)
                }else{
                    this.showSubject.push(subj._id)
                }
            },
            //loads all subjects
            loadData: async function(){
                this.subjects = await this.$electron.ipcRenderer.invoke("getStoreValue", "subjects") 
            },
            //deletes a subject
            deleteSubject: function(id){
                for(let i = 0; i < this.subjects.length; i++){
                    if(this.subjects[i]._id === id){
                        this.subjects.splice(i,1)
                        this.$electron.ipcRenderer.invoke("setStoreValue", "subjects", this.subjects) 
                    }
                }
            },
            generateCode: function(length) {
                var result           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            },
            //creates a new subject
            addSubject: function(){
                this.newSubject._id = crypto.randomUUID()
                this.newSubject.code = this.generateCode(6)
                this.subjects.push(this.newSubject)
                this.newSubject = {}
                this.$electron.ipcRenderer.invoke("setStoreValue", "subjects", this.subjects) 
            },
            //updates the data of a subject
            updateSubject: function(){
                this.$electron.ipcRenderer.invoke("setStoreValue", "subjects", this.subjects)
            }
        },
        mounted: function(){
            this.loadData()
        }
    }
</script>

<style scoped>
    .deleteButton{
        color: black;
        height:30px;
        float:right;
        margin-right:10px;
        padding: 0.2rem 1rem;
        line-height: 1.5;
        background-color: white ;
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
    .admin-subjects-wrapper{
        width:100%;
    }

    .subjects-overview-wrapper{
        width:85%;
        margin:0 auto;
    }
    
    .subjects-box{
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .subjects-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .subjects-header-text{
        padding-top:3px;
        padding-left:15px;
    }

    .subjects-table{
        width:100%;
    }

    .subjects-collapse{
        border: 1px solid black;
    }

    .subjects-table,th, td{
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

    .subject-element{
        height: 22px;
        width:100%;
        margin-left: 10px;
        margin-top: 12px;
        margin-bottom: 12px;
    }
    .subject-element-selector{
        height: 35px;
        width:100%;
    }
    .leftsidetext{
        float: left;
    }
</style>