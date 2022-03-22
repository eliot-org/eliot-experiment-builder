<template>
    <div class="admin-config-wrapper">
        <div class="config-overview-wrapper">            
            <div class="box-element">
                <div class="box-header">
                    <div class="box-header-text">  
                        Hardware Scripts
                    </div>
                </div>
                <div class="box-body">
                    <div style="margin-left: 10px">
                        Current Location: {{scriptLocation}}
                        <br>
                        Select new Location: 
                        <input type="file" id="hwScriptDir" @click="chooseDir()" @click.prevent=""/>
                    </div>
                </div>
            </div>
            <div class="box-element">
                <div class="box-header">
                    <div class="box-header-text">  
                        Surveys
                    </div>
                </div>
                <div class="box-body">
                    <div style="margin-left: 10px">
                        Import File: 
                        <input type="file" id="surveyJSONDir" @click="addSurvey()" @click.prevent=""/>
                    </div>
                    <hr>
                    <div v-for="(survey, index) in surveys" v-bind:key="index">
                        <div style="margin-left: 10px">
                            {{survey.name}}
                            <button @click="removeSurvey(survey._id)" class="saveButton">
                                Delete
                            </button>
                        </div>
                        <hr>
                    </div>
                </div>
            </div>
            <div class="box-element">
                <div class="box-header">
                    <div class="box-header-text">  
                        Picture Folder
                    </div>
                </div>
                <div class="box-body">
                    <div style="margin-left: 10px">
                        Current Location: {{pictureLocation}}
                        <br>
                        Select new Location: 
                        <input type="file" id="picDir" @click="choosePicDir()" @click.prevent=""/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function(){
        return{
            scriptLocation: "",
            surveys: [],
            pictureLocation: "",
        }
    },
    methods:{
        chooseDir: function(){
            this.$electron.ipcRenderer.invoke('openHWDirDialog')
        },
        choosePicDir: function(){
            this.$electron.ipcRenderer.invoke('openPicDirDialog')
        },
        getPicDir: async function(){
            this.pictureLocation = await this.$electron.ipcRenderer.invoke('getStoreValue', 'pictureLocation')
        },
        getHWScriptLocation: async function(){
            this.scriptLocation = await this.$electron.ipcRenderer.invoke('getStoreValue', 'scriptLocation')
        },
        addSurvey: function(){
            this.$electron.ipcRenderer.invoke('openSurveyFileDialog')
        },
        getSurveys: async function(){
            this.surveys = await this.$electron.ipcRenderer.invoke('getStoreValue', 'surveys')
        },
        removeSurvey: function(id){
            for(let i = 0; i < this.surveys.length; i++){
                if(this.surveys[i]._id == id){
                    this.surveys.splice(i,1)
                    this.$electron.ipcRenderer.invoke("setStoreValue", "surveys", this.surveys) 
                }
            }
        }
    },
    destroyed(){    
        this.$electron.ipcRenderer.removeAllListeners()
    },
    mounted(){
        this.getHWScriptLocation()
        this.getSurveys()
        this.getPicDir()
        this.$electron.ipcRenderer.on('reloadScriptLocation', () => {this.getHWScriptLocation()})
        this.$electron.ipcRenderer.on('reloadSurveys', () => {this.getSurveys()})
    }
}
</script>

<style src="./adminPage.css"></style>
<style scoped>
    .admin-config-wrapper{
        width:100%;
    }

    .config-overview-wrapper{
        width:85%;
        margin:0 auto;
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
</style>