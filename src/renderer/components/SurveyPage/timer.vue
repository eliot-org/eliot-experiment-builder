<template>
    <div class="explanationWrapper">
        <!-- Pre -->
        <div v-if="showPre && preTimer >= 0">
            <div class="explanationText" v-html="content.preText"></div>
            <div id="before" class="logo-wrapper">
                <img class="logo" v-bind:src="preImg" alt="" v-if="preImgType=='img'">
                <vid :src="preImg" v-if="preImgType=='video'"></vid>
            </div>
            <div class="explanationText" v-if="content.preTimer.show">
                {{preTimer}}
            </div>
        </div>

        <!-- Main -->
        <div v-if="showMain && mainTimer >= 0">
            <div class="explanationText" v-html="content.mainText"></div>
            <div id="after" class="logo-wrapper">
                <img class="logo" v-bind:src="mainImg" alt="" v-if="mainImgType=='img'">
                <vid :src="mainImg" v-if="mainImgType=='video'"></vid>
            </div>
            <div class="explanationText" v-if="content.mainTimer.show">
                {{mainTimer}}
            </div>
        </div>
        
        <!-- Post -->
        <div v-if="showPost">
            <div class="explanationText" v-html="content.postText"></div>
            <div id="after" class="logo-wrapper">
                <img class="logo" v-bind:src="postImg" alt="" v-if="postImgType=='img'">
                <vid :src="postImg" v-if="postImgType=='video'"></vid>
            </div>
            <div class="explanationText" v-if="content.postTimer.show">
                {{postTimer}}
            </div>
        </div>

        <!-- Other -->
        <div class="ok-btn" v-if="showPost && postTimer == -1">
            <button @click="nextPage()" class="btn-black" type="button">
                <span class="btn-text">Next</span>
            </button>
        </div>
    </div>
</template>

<script>
    const sound = require('sound-play')
    export default {
        props:{
            //Content of the Current Question
            content:{               
                required: true
            }
        },
		data: function(){	
			return{
                showPre: true,
                preTimer: 0,
                preImg: (Object.prototype.hasOwnProperty.call(this.content, "preImg")) ? this.assetLocation+"/"+this.content.preImg : "",
                preImgType: (Object.prototype.hasOwnProperty.call(this.content, "preImg")) ? this.getDataType(0) : "",

                showMain: false,
                mainTimer: 0,
                mainImg: (Object.prototype.hasOwnProperty.call(this.content, "mainImg")) ? this.assetLocation+"/"+this.content.mainImg : "",
                mainImgType: (Object.prototype.hasOwnProperty.call(this.content, "mainImg")) ? this.getDataType(1) : "",
                
                showPost: false,
                postTimer: 0,  
                postImg: (Object.prototype.hasOwnProperty.call(this.content, "postImg")) ? this.assetLocation+"/"+this.content.postImg : "",
                postImgType: (Object.prototype.hasOwnProperty.call(this.content, "postImg")) ? this.getDataType(2) : "",
                    
                assetLocation: ""
            }
		},
		methods:{
            getAssetDir: async function(){
                this.assetLocation = await this.$electron.ipcRenderer.invoke('getStoreValue', 'assetLocation')
                this.init()
            },
            //Reset all data
            init(){
                this.preImg = (Object.prototype.hasOwnProperty.call(this.content, "preImg")) ? this.assetLocation+"/"+this.content.preImg : ""
                this.mainImg = (Object.prototype.hasOwnProperty.call(this.content, "mainImg")) ? this.assetLocation+"/"+this.content.mainImg : ""
                this.postImg = (Object.prototype.hasOwnProperty.call(this.content, "postImg")) ? this.assetLocation+"/"+this.content.postImg : ""
                
                this.preImgType = (Object.prototype.hasOwnProperty.call(this.content, "preImg")) ? this.getDataType(0) : ""
                this.mainImgType = (Object.prototype.hasOwnProperty.call(this.content, "mainImg")) ? this.getDataType(1) : ""
                this.postImgType = (Object.prototype.hasOwnProperty.call(this.content, "postImg")) ? this.getDataType(2) : ""

                this.preTimer = this.content.preTimer.time
                this.mainTimer = this.content.mainTimer.time
                this.postTimer = this.content.postTimer.time

                this.showPre = true
                this.showMain = false
                this.showPost = false

                if(this.content.preTimer.time > 0){
                    this.showPre = true
                    this.preCountdown()
                }else{
                    this.showPre = false
                    this.showMain = true
                    this.countdown()
                }
            },
            //Go to next page and destroy current
            nextPage: function(){
                this.$emit("nextPage")
                this.$destroy()
            },
            /**
             * Countdown function. Reduces timer every second. 
             */
            countdown: function(){
                if(this.mainTimer <= 0){//On finish
                    if(Object.prototype.hasOwnProperty.call(this.content, "endIndicatorSound")){
                        if(this.content.endIndicatorSound != ""){
                            sound.play(this.assetLocation+"/"+this.content.endIndicatorSound)
                        }
                    }
                    this.showMain = false
                    if(this.postTimer == 0){
                        this.nextPage()
                    }else if(this.postTimer == -1){
                        this.showPost = true
                    }else{
                        this.showPost = true
                        this.postCountdown()
                    }
                }else{
                    this.mainTimer--
                    setTimeout(() => {this.countdown()}, 1000)
                }
            },
            postCountdown: function(){
                if(this.postTimer <= 0){//On finish
                    this.nextPage()
                }else{
                    this.postTimer--
                    setTimeout(() => {this.postCountdown()}, 1000)
                }
            },
            preCountdown: function(){
                if(this.preTimer <= 0){//On finish
                    if(Object.prototype.hasOwnProperty.call(this.content, "startIndicatorSound")){
                        if(this.content.startIndicatorSound != ""){
                            sound.play(this.assetLocation+"/"+this.content.startIndicatorSound)
                        }
                    }
                    this.showPre = false
                    this.showMain = true
                    this.countdown()
                }else{
                    this.preTimer--
                    setTimeout(() => {this.preCountdown()}, 1000)
                }
            },
            //Gets image datatype
            getDataType: function(which){
                let tmp;
                if(which == 0){
                    tmp = this.content.preImg.split(".").pop().toLowerCase()
                }else if(which == 1){
                    tmp = this.content.mainImg.split(".").pop().toLowerCase()
                }else if(which == 2){
                    tmp = this.content.postImg.split(".").pop().toLowerCase()
                }
                if(tmp == "mp4"){
                    return "video"
                }else if((tmp == "png") || (tmp =="jpg") || (tmp == "jpeg") || (tmp == "gif")){
                    return "img"
                }else{
                    return "img"
                }
            },
        },
        //call init and precountdown
        mounted() {
            this.getAssetDir()
        }
    }
</script>

<style scoped>
.explanationText{
    margin-bottom:5%;
}

.logo-wrapper{
    margin: 0 auto;
    margin-bottom:30px;
}

.logo{
    display: flex;
    height: auto;
    width: auto;
    max-width: 1000px;
    max-height: 450px;
}

.ok-btn{
    margin-right:0;
}
</style>