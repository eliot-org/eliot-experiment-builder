<template>
    <div class="admin-config-wrapper">
        <div class="config-overview-wrapper">            
            <div class="box-element">
                <div class="box-header" >
                    <div class="box-header-text">  
                        Hardware Scripts
                    </div>
                </div>
                <div class="box-body">
                    Current Location: {{scriptLocation}}
                    <br>
                    Select new Location: 
                    <input type="file" id="hwScriptDir" @click="chooseDir()" @click.prevent=""/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function(){
        return{
            scriptLocation: ""
        }
    },
    methods:{
        chooseDir: function(){
            this.$electron.ipcRenderer.invoke('openHWDirDialog')
        },
        getHWScriptLocation: async function(){
            this.scriptLocation = await this.$electron.ipcRenderer.invoke('getStoreValue', 'scriptLocation')
        }
    },
    destroyed(){    
        this.$electron.ipcRenderer.removeAllListeners()
    },
    mounted(){
        this.getHWScriptLocation()
        this.$electron.ipcRenderer.on('reloadScriptLocation', () => {
            this.getHWScriptLocation()
        })
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
</style>