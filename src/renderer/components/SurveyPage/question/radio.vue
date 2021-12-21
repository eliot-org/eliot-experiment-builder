<template>
    <div class="right-side-parent">
        <div class="answer-radio-wrapper">
            <div class="answers" id="answers" ref="answers">
                <div class="radio-wrapper" v-for="(option,index) in options" v-bind:key="index" v-bind:value="option">
                    <label class="radio-label">
                        <input type="radio" v-bind:value="option" v-model="picked" >
                        <span class="radio-custom circular"></span>
                    </label>
                    <div class="radio-text" v-html="option"></div>
                </div>
            </div>
        </div>
        <div class="ok-btn" v-if="picked">
            <button @click="sendData()" class="btn-black" type="button">
                        <span class="btn-text">Weiter</span>
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
           }
        },
        watch: {
            //When the options change(only on page change) then reinitialize page
            options: function() { // watch it
                this.init()
            }
        },
        mounted(){
            //init page
            this.init()
        },
		data: function(){	
			return{
                //The input of the user
                picked: "",                
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
			}
		},
		methods:{
            /**
             * Reset the scroll of the page
             */
            init(){
                setTimeout(() => {this.$refs.answers.scroll(0,0)}, 50)
            },
            sendData(){//Sends data to parent, resets local data, calls next page
                if(!this.alreadyClicked){
                    this.alreadyClicked = true
                    this.$emit("updateAnswers", [this.picked])
                    this.picked = ""
                    this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
                }
            },
        }
    }
</script>

<style scoped>
    .answer-radio-wrapper{
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

    .radio-wrapper{
        display:flex;
        margin-bottom: 30px;
        position: relative;
    }

    .radio-text{
        font-weight: 600;
        font-size: 25px;
        margin-left: 30px;
        cursor: default;
        user-select: none;
    }


    .radio-label {
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

    .radio-label input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    .radio-label .radio-custom {
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


    .radio-label input:checked ~ .radio-custom {
        background-color: #212529;
        border-radius: 5px;
        transform: rotate(0deg) scale(1);
        opacity:1;
        border: 2px solid #212529;
    }


    .radio-label .radio-custom::after {
        position: absolute;
        content: "";
        left: 12px;
        top: 12px;
        height: 0px;
        width: 0px;
        border-radius: 5px;
        border: solid #212529;
        border-width: 0 3px 3px 0;
        transform: rotate(0deg) scale(0);
        opacity:1;
        transition: all 0.3s ease-out;
    }


    
    .radio-label .radio-custom.circular {
        border-radius: 50%;
        border: 2px solid #212529;
    }

    .radio-label input:checked ~ .radio-custom.circular {
        background-color: #212529;
        border-radius: 50%;
        border: 2px solid #212529;
        box-shadow: inset 0 0 0 4px #f9f9f9;
    }
    .radio-label input:checked ~ .radio-custom.circular::after {
        border: solid #212529;
        border-width: 0 2px 2px 0;
    }
    .radio-label .radio-custom.circular::after {
        border-radius: 50%;
    }

    .radio-label .radio-custom.circular::before {
        border-radius: 50%;
        border: 2px solid #212529;
    }

    .radio-label input:checked ~ .radio-custom.circular::before {
        border-radius: 50%;
    }
</style>