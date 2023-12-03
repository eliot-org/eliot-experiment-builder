<template>
    <div class="admin-objects-wrapper">
        <div class="objects-overview-wrapper">
            <div class="objects-box">
                <div class="objects-header">
                    <div class="objects-header-text"> 
                        Add new Object:
                    </div>
                </div>
                <div class="objects-collapse">
                    <div style="margin-top: 12px; margin-bottom: 12px; margin-left: 10px">
                        Name:
                        <input style="border-style:solid;" type="text" v-model="newObject.name">
                    </div>
                    <div v-for="(property, index) in objectProperties" v-bind:key="index" style="margin-left: 10px">
                        {{property}}:
                        <input style="border-style:solid;" type="text" v-model="newObject[property]">
                        <button class="saveButton" @click="delete newObject[property]; objectProperties.splice(objectProperties.indexOf(property),1)">-</button>
                    </div>
                    <hr>
                    <div style="margin-left: 10px">
                        New Property: 
                        <input style="border-style:solid;" type="text" v-model="newProperty"> 
                        <button class="saveButton" @click="addProperty(newProperty)">+</button>
                    </div>
                    <hr>
                    <div>
                        <button @click="addObject()" class="saveButton">
                            Add
                        </button>
                    </div>
                </div>
            </div>
            Number of Objects: {{objects.length}}<br><hr>
            <div class="objects-box" v-for="(object ,index) in objects" v-bind:key="index">
                <div class="objects-header" @click="toggleCollapse(object)">
                    <div class="objects-header-text">  
                        {{object.name}}
                        <button @click="deleteObject(object._id)" class="deleteButton">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="objects-collapse" v-show="showObject.includes(object._id)">
                    <div class="object-element">
                        <div class="leftsidetext">Id:</div>
                        <div class="editField">
                            {{object._id}}
                        </div>
                    </div>
                    <hr>
                    <div v-for="(key, index2) in Object.keys(object)" v-bind:key="index2">
                        <div class="object-element" v-if="key !== '_id'">
                            <div class="leftsidetext">{{key}}: </div>
                            <input style="border-style:solid;" type="text" v-model="object[key]" @change="updateObject()">
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
                //all objects available
                objects: [],
                //data to create new object
                newObject: {name: ""},
                newProperty: "",
                //all properties a object can have
                objectProperties: [],
                //which objects data to show
                showObject: [],
            }
        },
        methods:{
            //Toggles a collapsible
            toggleCollapse: function(obj){
                if(this.showObject.includes(obj._id)){
                    this.showObject.splice(this.showObject.indexOf(obj._id),1)
                }else{
                    this.showObject.push(obj._id)
                }
            },
            //Loads all objects 
            loadData: async function(){
                this.objects = await this.$electron.ipcRenderer.invoke("getStoreValue", "objects") 
            },
            addProperty: function(newProperty){
                if(newProperty.length > 0 && !this.objectProperties.includes(newProperty)){
                    this.objectProperties.push(newProperty)
                }
            }, 
            //deletes an object
            deleteObject: function(id){
                for(let i = 0; i < this.objects.length; i++){
                    if(this.objects[i]._id === id){
                        this.objects.splice(i,1)
                        this.$electron.ipcRenderer.invoke("setStoreValue", "objects", this.objects) 
                    }
                }
            },
            //Create a new object
            addObject: function(){
                if(this.newObject.name !== "" && this.newObject.name.length > 0){
                    this.newObject._id = crypto.randomUUID()
                    this.objects.push(this.newObject)
                    this.newObject = {}
                    this.$electron.ipcRenderer.invoke("setStoreValue", "objects", this.objects) 
                }
            },
            //Update an objects data
            updateObject: function(){
                this.$electron.ipcRenderer.invoke("setStoreValue", "objects", this.objects)
            },
        },
        //init page
        mounted: function(){
            this.loadData()
        }
    }
</script>

<style scoped>
    .admin-objects-wrapper{
        width:100%;
    }

    .objects-overview-wrapper{
        width:85%;
        margin:0 auto;
    }
    
    .objects-box{
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .objects-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .objects-header-text{
        padding-top:3px;
        padding-left:15px;
    }

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

    .object-element{
        height: 22px;
        width:100%;
        margin-left: 10px;
        margin-top: 12px;
        margin-bottom: 12px;
    }
    .object-element-selector{
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

    .objects-collapse{
        border: 1px solid black;
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