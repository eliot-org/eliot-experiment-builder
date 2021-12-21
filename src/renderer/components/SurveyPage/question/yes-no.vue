<template>
	<div class="answer-btn-wrapper">
		<button  @click="sendData(options[0])" type="button" class="btn-black answer-btn answer-yes">
			<span class="btn-text" v-html="options[0]"></span>
		</button>
		<button  @click="sendData(options[1])" type="button" class="btn-black answer-btn answer-no">
			<span class="btn-text" v-html="options[1]"></span>
		</button>
	</div>
</template>

<script>
	export default {
        props:{
            //The options of this page as set by surveyfile
            options:{               
               required: true
            }
        },
		data: function(){	
			return{
                //Did the user already click on the continue button? To prevent skipping a page
				alreadyClicked: false,
			}
		},
		methods:{
            sendData(chosen){//Sends Data to parent, resets local data, calls next page
                if(!this.alreadyClicked){
					this.alreadyClicked = true
					if(chosen.toLowerCase() == "ja"){
						this.$emit("updateAnswers", [1])
					}else if(chosen.toLowerCase() == "nein"){
						this.$emit("updateAnswers", [0])
					}else{
						this.$emit("updateAnswers", [chosen])
					}
					this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
				}
            },
		}
	}
</script>

<style scoped>

	.answer-btn-wrapper{
		height:90%;
		width:100%;
		display:flex;
        justify-content:center;
        flex-direction: column;
        align-items: center;
	}

	.answer-no{		
		margin-top:60px;
	}
</style>