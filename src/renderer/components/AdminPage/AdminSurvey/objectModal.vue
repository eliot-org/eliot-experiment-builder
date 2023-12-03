<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Choose Objects</h3>
                    </div>
                    <div class="modal-body">
                        <div v-for="(obj, x) in objects" v-bind:key="x" style="margin-bottom:22px;margin-top:22px;height:25px">
                            <label class="checkbox-label" style="float:left">
                                <input style="border-style:solid;" v-bind:id="obj.name" type="checkbox" v-bind:value="obj" v-on:click="$emit('updateChecked', obj)">
                                <span class="checkbox-custom rectangular"></span>
                            </label>
                            <div class="checkbox-text" style="float:left">{{obj.name}}</div>
                            <br><br><hr>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
                            <button class="btn-black " id="chooseAllMaterials" @click="chooseAllObjects()">Choose all</button>
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
            //All possible objects
            objects:{
               required:true
            }
        },
        methods:{
            //chooses all possible objects
            chooseAllObjects: function(){
                for(var i = 0; i< this.objects.length;i++){
                    document.querySelector("#"+this.objects[i].name).checked = (document.querySelector("#"+this.objects[i].name).checked == true) ? false : true
                    this.$emit('updateChecked',this.objects[i])
                }
            },
        },
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