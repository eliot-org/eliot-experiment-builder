<template>
    <div class="right-side-parent">
        <div class="answer-input-wrapper">
            <div class="answers">
                <input type="number" min="0"  v-model="picked" class="input" v-if="type=='num'">
                <input type="text" v-model="picked" class="input" v-if="type=='text'">
            </div>
        </div>
        <div class="ok-btn" v-if="picked">
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
           }
        },
		data: function(){	
			return{
                //The input of the user
                picked: "",        
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
                //The type of input the user can input, numbers or text
                type: "num"
			}
		},
        computed: {
            continueBtnText: function(){
                if(this.options !== undefined){
                    return (this.options.continueBtnText !== undefined && this.options.continueBtnText !== "") ? this.options.continueBtnText : 'Next'
                }else{
                    return "Next"
                }
            }
        },
        watch: {
            //When the options change(only on page change) then reinitialize page
            options: function() { // watch it
                this.init()
            }
        },
		methods:{
            addAnswer: function(value){
                this.picked = value
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
            init(){//Find out what type of input we want
                if(Object.prototype.hasOwnProperty.call(this.options,"type")){
                    if(this.options.type == "num"){
                        this.type = "num"
                    }else if(this.options.type=="text"){
                        this.type = "text"
                    }else{
                        this.type = "num"
                    }
                }else{
                    this.type = "num"
                }
            }
        },
        mounted(){
            //init page
            this.init()
        }
    }
</script>

<style scoped>
    .answer-input-wrapper{
		height:90%;
		width:100%;
        display:flex;
        align-items: center;
		justify-content:center;
    }
    
    .answers{
		display:flex;
        flex-direction: column;
        flex-wrap: wrap;
        height:75%;
        width: 75%;
        margin-left: 12.5%;
        justify-content: center;
    }

    .input{
        margin:0 auto;
        width: 75%;
        height: 35px;
        font-size: larger;
        padding-left:10px;
        outline:1px solid black;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
</style>