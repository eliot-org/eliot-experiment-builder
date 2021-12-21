<template>
	<div class="wrapper">
        <div class="left-side">
            <div class="question-wrapper">
                <h2 class="question-head">FRAGE:</h2>
                <div id="question" class="question" v-html="content.text"></div>
				<div class="question-logo-wrapper" v-if="content.hasOwnProperty('img')">
					<img class="question-logo" v-bind:src="img" alt="" v-if="dataType=='img'">
                    <vid :src="img" v-if="dataType=='video'"></vid>
				</div>
            </div>
        </div>
        <div class="right-side">
            <transition name="fade" mode="out-in">
                <router-view :options="content.options" v-on:updateAnswers="$emit('updateAnswers', $event)" v-on:nextPage="$emit('nextPage')"></router-view>//Prop options wird an Child Component übergeben
            </transition>
        </div>
    </div>
</template>

<script>
	import vid from './explanationPic/vid'
    export default {
        components: { vid },
        props:{
            //Content of the Current Question
            content:{               
               required: true
			},
        },
        watch: {
            //To reinit the page once the data changes, which it does on question change
            content: function() { // watch it
                this.init()
            }
        },
		data: function(){	
			return{
                //image to show on the left side of screen
                img: Object.prototype.hasOwnProperty.call(this.content,"img") ? this.getImg() : "",
                //the type of image to show (mp4 or png or...)
				dataType: Object.prototype.hasOwnProperty.call(this.content,"img") ? this.getDataType() : ""
			}
        },
		methods:{
            //Reset variables
            init(){
                this.img = Object.prototype.hasOwnProperty.call(this.content,"img") ? this.getImg() : ""
                this.dataType = Object.prototype.hasOwnProperty.call(this.content,"img") ? this.getDataType() : ""
            },
            //Try to load a local image
			getImg(){
				try{
					return require('../../assets/'+this.content.img)
                }catch(e){
					console.log(e)
                }
			},
            //get the type of the image
			getDataType: function(){
				if(this.content.img != null){
                    var tmp = this.content.img.split(".").pop().toLowerCase()
                    console.log(tmp)
                    if(tmp == "mp4"){
                        return "video"
                    }else if((tmp == "png") || (tmp =="jpg") || (tmp == "jpeg") || (tmp == "gif")){
                        return "img"
                    }else{
                        return "img"
                    }
                }
			}
		},
		mounted(){
            //Init page
			console.log(this.content)
			this.init()
		}
    }
</script>

<style src="./SurveyPage.css"></style>
<style>
	.answer-wrapper{
		height:90%;
	}

	.question-head{
		cursor: default;
		user-select: none;
	}

	.question-wrapper{
		color: #484848;
        font-weight:100;
		margin-top:7.5%;
		margin-left: 7.5%;
		margin-right: 7.5%;
	}

	.question{
		margin-top:25px;
		font-weight: 500;
		font-size:1.5rem;
		cursor: default;
		user-select: none;
	}
	.question-logo-wrapper{
		margin: 0 auto;
		margin-bottom:30px;
		margin-top: 30px;
	}

	.question-logo{
		display: flex;
		height: auto;
		width: auto;
		max-width: 300px;
		max-height: 600px;
		margin:auto;
	}
</style>