<template>
    <div>
        <input type="file" id="hwScriptDir" @click="chooseDir()" @click.prevent=""/>
        {{scriptLocation}}
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
    mounted(){
        this.getHWScriptLocation()
        this.$electron.ipcRenderer.on('reloadScriptLocation', () => {
            this.getHWScriptLocation()
        })
    }
}
</script>

<style scoped>

</style>