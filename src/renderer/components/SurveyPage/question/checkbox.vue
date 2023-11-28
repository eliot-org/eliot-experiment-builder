<template>
    <div class="right-side-parent">
        <div class="answer-checkbox-wrapper">
            <div class="answers" id="answers" ref="answers">
                <div class="checkbox-wrapper" v-for="(option,i) in options" v-bind:key="i" v-bind:value="option" v-on:click="updateChecked(option)">
                    <label class="checkbox-label">
                        <input type="checkbox" v-bind:value="option" v-model="checked" v-on:click="updateChecked(option)">
                        <span class="checkbox-custom rectangular"></span>
                    </label>
                    <div class="checkbox-text" v-html="option"></div>
                </div>
            </div>
        </div>
        <div class="ok-btn">
            <button @click="sendData()" class="btn-black" type="button">
                <span class="btn-text">{{continueBtnText}}</span>
            </button>
        </div>
    </div>
</template>

<script>
	export default {
        props:{
            //The options of this page as set by surveyfile
            options:{
               required:true
           },
           continueBtnText:{
               required:true
           },
        },
        watch: {
            //When the options change(only on page change) then reinitialize page
            options: function() { // watch it
                this.init()
            }
        },
        mounted(){
            //inititialize page
            this.init()
        },
		data: function(){	
			return{
                //Which boxes are checked
                checked: [],
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
			}
		},
		methods:{
            addAnswer: function(value){
                this.checked.push(value)
            },
            /**
             * Reset the scroll of the page
             */
            init(){
                //setTimeout(() => {this.$refs.answers.scroll(0,0)}, 50)
            },
            sendData(){//Sends data to parent, resets local data, calls next page
                if(!this.alreadyClicked){
                    this.alreadyClicked = true
                    this.$emit("updateAnswers", this.checked)
                    this.checked = []
                    this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
                }
            },
            //Gets the clicked option and updates the array accordingly. If its already in the "checked" array then it will be removed from there,
            //otherwise it will be added
            updateChecked: function(option){
                if(this.findInArray(option, this.checked) != null){
                    this.checked = this.checked.filter(el => el != option)
                }else{
                    this.checked.push(option)
                }
            },
            //Gets an object to find in an array. Returns the index if its found or null if not
            findInArray: function(obj, arr){
                for(var i=0; i<arr.length; i++){
                    if(arr[i] == obj){
                        return i
                    }
                }
                return null
            }
        }
	}
</script>

<style scoped>

	.answer-checkbox-wrapper{
		height:90%;
		width:100%;
        display:flex;
        align-items: center;
		justify-content:center;
        overflow-x: auto;
    }
    
    .answers{
        height:75%;
        width: 75%;
        margin-left: 12.5%;
    }

    .checkbox-wrapper{
        display:flex;
        margin-bottom: 30px;
        position: relative;
        width: min-content;
    }

    .checkbox-text{
        font-weight: 600;
        font-size: 25px;
        margin-left: 30px;
        cursor: default;
        user-select: none;
    }


    .checkbox-label {
        display: block;
        position: relative;
        cursor: pointer;
        font-size: 22px;
        line-height: 24px;
        height: 24px;
        width: 24px;
        clear: both;
        margin-top:6px;
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
        height: 24px;
        width: 24px;
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
        border: 3px solid #212529;
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
        left: 5px;
        top: 0px;
        width: 6px;
        height: 12px;
        border: solid #f9f9f9;
        border-width: 0 2px 2px 0;
        background-color: transparent;
        border-radius: 0;
    }

    
</style>