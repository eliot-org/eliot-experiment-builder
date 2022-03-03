<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Preset Optionen</h3>
                    </div>
                    <div class="modal-body">
                        <div class="mindChannels-head">
                            <div v-for="(preset,i) in presets" v-bind:key="i" >
                                - {{preset.name}}:
                                <button class="btn-black-small btn-black" id="chooseAllModules" @click="$emit('chooseModules', preset)">Wählen</button>
                                <button class="btn-black-small btn-black" id="chooseAllModules" @click="$emit('deletePreset', preset)">Löschen</button>
                            </div>
                        </div>
                        <br><hr><br>
                        <div>
                            <div>Aktuelle Modulauswahl als neues Template anlegen</div>
                            <div class="surveySettings-name">Name:</div>
                            <input class="surveySettings-input" type="text" name="newPresetName" v-model="newPresetName">
                            <button class="btn-black " id="chooseAllModules" @click="$emit('addPreset', newPresetName)">Speichern</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
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
            presets:{//The survey presets that exist
               required:true
            },
        },
        data: function( ){
            return{
                //For creating new presets
                newPresetName: "",
            }
        },
    }
</script>

<style scoped>
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
.btn-black-small{
        padding: 0rem 0rem;
        font-size:0.8rem;
        width:100px;
        height:25px;
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


.surveySettings-name{
    width: 25%;
    float: left;
}

.surveySettings-input{
    width:75%;
} 

</style>