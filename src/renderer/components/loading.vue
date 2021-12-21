<template>
    <div class="loading-wrapper">
        <img class="logo" src="~@/assets/loading.gif" alt="Loading">   
    </div>
</template>

<script>
export default {
    mounted(){ 
        /**
         * Called when the Main process sends on the surveyOps channel. arg includes the data to which page this instance should go to. So if it is a admin or surveypage
         */
        this.$electron.ipcRenderer.on("surveyOps", (event,arg) => {
            console.log(arg)
            if(arg == "goToSurvey"){
                if (this.$router.currentRoute.name != "SurveyWelcome") {
                    this.$router.push({ name: "SurveyWelcome"})
                }
            }else if(arg == "goToLogin"){
                if (this.$router.currentRoute.name != "SurveyWelcome") {
                    this.$router.push({ name: "AdminPage"})
                }
            }
        })
        this.$electron.ipcRenderer.send("loader", "ready")
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

    .logo{
        margin: auto;
    }
</style>