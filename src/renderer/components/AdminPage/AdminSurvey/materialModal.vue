<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">

                    <div class="modal-header">
                        <!--<slot name="header">
                        </slot>-->
                        <h3>Hier haben sie eine Übersicht über alle Materialien</h3>
                    </div>

                    <div class="modal-body">
                        <!--<slot name="body">
                        </slot>-->
                        <table id="table">
                            <tr>
                                <th>Auswahl</th>
                                <th>Doppelte Präsentation</th>
                                <th>Material</th>
                                <th>Roboterposition</th>
                            </tr>
                            <tr v-for="(mat, x) in materials" v-bind:key="x">
                                <td>
                                    <label class="checkbox-label">
                                        <input type="checkbox" v-bind:value="mat" v-model="materialsChosen" v-on:click="$emit('updateChecked',mat)">
                                        <span class="checkbox-custom rectangular"></span>
                                    </label>
                                </td>
                                <td>
                                    <label class="checkbox-label" v-if="mat.showExtraImg">
                                        <input type="checkbox" v-bind:value="mat" v-model="materialsChosenExtraInformation" v-on:click="$emit('updateCheckedExtraInformation',mat)">
                                        <span class="checkbox-custom rectangular"></span>
                                    </label>
                                </td>
                                <td>
                                    <div class="checkbox-text">{{mat.name}}</div>
                                </td>
                                <td> 
                                    <select name="roboPos" id="roboPos" style="margin-left:15px;" v-model="mat.roboPos">
                                        <option v-for="(pos, y) in roboPosSelectors" v-bind:key="y" v-bind:value="pos">{{pos}}</option>
                                    </select>
                                </td>
                            </tr>
                        </table>

                        <!--<div>
                            <div class="checkbox-wrapper" v-for="(mat, x) in materials" v-bind:key="x">
                                <label class="checkbox-label">
                                    <input type="checkbox" v-bind:value="mat" v-model="materialsChosen" v-on:click="$emit('updateChecked',mat)">
                                    <span class="checkbox-custom rectangular"></span>
                                </label>
                                <div class="checkbox-text">{{mat.name}}</div>
                                <label class="checkbox-label" v-if="mat.showExtraImg">
                                    <input type="checkbox" v-bind:value="mat" v-model="materialsChosenExtraInformation" v-on:click="$emit('updateCheckedExtraInformation',mat)">
                                    <span class="checkbox-custom rectangular"></span>
                                </label>
                                <div v-if="mat.showExtraImg && materialsChosenExtraInformation.includes(mat)">Doppelte Präsentation</div>
                            </div>
                        </div>-->
                    </div>

                    <div class="modal-footer">
                        <slot name="footer">
                            <button class="btn-black " id="chooseAllMaterials" @click="chooseAllMaterials()">Alle wählen</button>
                            <button class="modal-default-button btn-black btn" @click="$emit('close')">
                                OK
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
      </transition>
</template>

<script>
    export default {
        props:{
            //The materials that the user chose
            materialsChosen:{
               required:true
            },
            //The chosen materials extra informations
            materialsChosenExtraInformation:{
               required:true
            },
            //All possible materials
            materials:{
               required:true
            }
        },
        methods:{
            /**
             * chooses all possible materials
             */
            chooseAllMaterials: function(){
                for(var i = 0; i< this.materials.length;i++){
                    if(!this.materialsChosen.includes(this.materials[i])){
                        this.$emit('updateChecked',this.materials[i])
                    }
                }
            }
        },
        data: function(){
            return{
                //Possible positions the robot can get materials from
                roboPosSelectors: ["A1","A2","A3","B1","B2","B3","C1","C2","C3","D1","D2","D3"/*,"LA1","LA2","LA3","LB1","LB2","LB3","LC1","LC2","LC3","LD1","LD2","LD3"*/]
            }
        }
    }
</script>

<style scoped>
    table, th, td{
        width: 100%;
        border: 1px solid black;
        border-collapse: collapse;
    }

    .checkbox-wrapper{
        display:flex;
        margin-bottom: 15px;
        position: relative;
    }

    .checkbox-text{
        margin-left: 15px;
        margin-right: 15px;
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
        margin: auto;
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
.btn-black{
        padding: 0rem 0rem;
        font-size:0.8rem;
        width:150px;
        height:35px;
        color:#ffffff;
        margin:10px;
    }
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 500px;
  height:500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
}

.modal-body {
  margin: 20px 0;
  height:330px;
  overflow: auto;
}

.modal-default-button {
  float: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

</style>