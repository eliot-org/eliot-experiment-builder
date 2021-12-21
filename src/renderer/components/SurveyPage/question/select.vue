<template>
    <div class="right-side-parent">
        <div class="answer-select-wrapper">
            <div class="answers">
                <v-select label="country" :options="options" v-model="picked" class="selector"></v-select>
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
		data: function(){	
			return{
                //The input of the user
                picked: "",                
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
			}
		},
		methods:{
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
    .answer-select-wrapper{
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

    .selector{
        margin:0 auto;
        width: 75%;
    }
</style>