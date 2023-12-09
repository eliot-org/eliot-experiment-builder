<template>
    <div class="loading-wrapper">  
        <div class="centerarea">
            <img class="logo" src="~@/assets/eliot.png" alt="ELIOT"> 
            <h1 style="font-size:3rem; margin-bottom:10px">ELIOT Experiment Builder</h1>
            <p style="font-size: 0.9rem">
                Version 0.3.1<br>
                Cherry<br>
            </p>
        </div>

        <div class="footer">
            Developed by <a class="link" href="mailto:tom.hilgers@unitybox.de">Tom Hilgers</a>, <a class="link" href="mailto:leander.schweiger@posteo.de">Leander Schweiger</a><br>
            License Holder:  <a @click="openLink" class="link" href="https://imat-uve.de">imat-uve gmbh</a> 
        </div>
    </div>
</template>

<script>
const shell = require('electron').shell;
export default {
    methods: {
        openLink: function(event){
            event.preventDefault()
            shell.openExternal(event.srcElement.href)
        }
    },
    mounted(){ 
        /**
         * Called when the Main process sends on the surveyOps channel. arg includes the data to which page this instance should go to. So if it is a admin or surveypage
         */
        this.$electron.ipcRenderer.on("WindowManagement", (event,arg) => {
            if(arg == "SurveyPage"){
                if (this.$router.currentRoute.name != "SurveyPage") {
                    this.$router.push({ name: "SurveyPage", params: { index: 0}})
                }
            }else if(arg == "AdminPage"){
                if (this.$router.currentRoute.name != "SurveyWelcome") {
                    setTimeout(() => {
                        this.$router.push({ name: "survey"})
                    }, 1000)
                }
            }
        })
        this.$electron.ipcRenderer.send("WindowManagement", "ready")
    },
}
</script>

<style scoped>
    .loading-wrapper{
        width: 100vw;
        height: 100vh;
        background: #f9f9f9;
        display: flex;
    }

    .footer{
        position: absolute;
        bottom: 0px;
        width: 100%;
        text-align: center;
        font-size: 0.7rem;
        padding-bottom: 15px;
    }

    .link{
        color:black
    }

    .logo{
        width: 350px
    }

    .centerarea{
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        text-align: center;
        margin: auto;
    }
</style>