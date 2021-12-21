<template>
    <div class="explanationWrapper">
        <div class="explanationText" v-if="!timerOver" v-html="content.textBefore"></div>
        <div id="before" class="logo-wrapper" v-if="!timerOver && timeLeft >= 0">
            <img class="logo" v-bind:src="imgBefore" alt="" v-if="dataTypeBefore=='img'">
            <vid :src="imgBefore" v-if="dataTypeBefore=='video'"></vid>
        </div>
        
        <audio id="audio">
            <source src="~@/assets/maingong.wav" type="audio/wav">
        </audio>

        <div class="explanationText" v-if="timerOver" v-html="content.textAfter"></div>
        <div id="after" class="logo-wrapper" v-if="timerOver">
            <img class="logo" v-bind:src="imgAfter" alt="" v-if="dataTypeAfter=='img'">
            <vid :src="imgAfter" v-if="dataTypeAfter=='video'"></vid>
        </div>
        <div class="explanationText"  v-if="!timerOver">
            Zeit übrig: {{timeLeft}}
        </div>
        <div class="ok-btn" v-if="timerOver">
            <button @click="nextPage()" v-if="showContinueBtn" class="btn-black" type="button">
                <span class="btn-text">Weiter</span>
            </button>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    export default {
        props:{
            //Content of the Current Question
            content:{               
                required: true
            },
            //The material that is the current focus
            material:{
                required:false
            },
        },
		data: function(){	
			return{
                //Is the timer over? Has it reached 0
                timerOver: false,
                //Are we ready to show the continue button
                showContinueBtn: false,
                //The timer
                timeLeft: this.content.timer,
                //Image to show while the timer is going
				imgBefore: (Object.prototype.hasOwnProperty.call(this.content, "imgBefore")) ? this.getImg(0) : "",
                //Image to show after timer has finished
                imgAfter:   (Object.prototype.hasOwnProperty.call(this.content, "imgAfter")) ? this.getImg(1) : "",
                //datatype of the first image
                dataTypeBefore: (Object.prototype.hasOwnProperty.call(this.content, "imgBefore")) ? this.getDataType(0) : "",
                //datatype of the second image
                dataTypeAfter: (Object.prototype.hasOwnProperty.call(this.content, "imgAfter")) ? this.getDataType(1) : ""
			}
		},
		methods:{
            //Reset all data
            init(){
                this.imgBefore = (Object.prototype.hasOwnProperty.call(this.content, "imgBefore")) ? this.getImg(0) : ""
                this.imgAfter = (Object.prototype.hasOwnProperty.call(this.content, "imgAfter")) ? this.getImg(1) : ""
                this.dataTypeBefore = (Object.prototype.hasOwnProperty.call(this.content, "imgBefore")) ? this.getDataType(0) : ""
                this.dataTypeAfter = (Object.prototype.hasOwnProperty.call(this.content, "imgAfter")) ? this.getDataType(1) : ""
            },
            //Go to next page and destroy current
            nextPage: function(){
                this.$emit("nextPage")
                this.$destroy()
            },
            /**
             * Countdown function. Reduces timer every second. Toggles light early on. Triggers eeg
             */
            countdown: function(){
                if(this.timeLeft>=0 && this.timerOver != true){
                    this.timeLeft--
                    if(this.timeLeft == 2){ this.$emit("toggleLight")}
                    setTimeout(() => {this.countdown()},1000)
                    if(this.timeLeft <= 0){
                        setTimeout(() => {this.timerOver = true},1000)
                        if(Object.prototype.hasOwnProperty.call(this.content, "light")){
                            if(this.content.light == "on"){
                                setTimeout(() => {this.showContinueBtn = true},6000)
                            }else{
                                this.showContinueBtn = true
                            }
                        }else{
                            this.showContinueBtn = true
                        }
                        document.getElementById('audio').play()
                        this.$emit("toggleLight")
                        this.$emit("eegTrigger")
                    }
                }
            },
            //Countdown starts at -3, -2, -1, 15, 14 ... . Function for that
            preCountdown: function(){
                if(this.timeLeft >= 0){
                    this.timeLeft = this.content.timer
                    this.timerOver = false
                    setTimeout(() => {document.getElementById('audio').play(), this.timerOver = true}, this.content.timer*1000)
                    //this.$emit("toggleLight")
                    this.$emit("eegTrigger")
                    this.countdown()
                    document.getElementById('audio').play()
                }else{
                    this.timeLeft++
                    setTimeout(() => {this.preCountdown()},1000)
                }
            },
            //Loads local or online image
            getImg(which){ 
                if(Object.prototype.hasOwnProperty.call(this.material,"bomId")){
                    axios.post('https://db.brainofmaterials.com/api/materialimages/'+this.material.bomId, {} ,{headers: {"common": "","Authorization": "Bearer RGFzIGlzdCBlaW4gQmVhcmVyLVRva2Vu"}}).then(response => {
                        if(response.data.length > 0){
                            this.imgAfter =  response.data[0]
                            this.imgBefore =  response.data[0]
                        }
                    }).catch(error => console.log(error)) 
                }
                try{
                    if(which == 0){
                        return require('../../assets/'+this.content.imgBefore)
                    }else if(which == 1){
                        return require('../../assets/'+this.content.imgAfter)
                    }
                }catch(e){
                    if(which == 0){
                        return 'https://'+axios.defaults.baseURL+'/storage/'+this.content.imgBefore
                    }else if(which == 1){
                        return 'https://'+axios.defaults.baseURL+'/storage/'+this.content.imgAfter
                    }else{
                        console.log(e)
                    }
                }
            },
            //Gets image datatype
            getDataType: function(which){
                let tmp;
                if(which == 0){
                    tmp = this.content.imgBefore.split(".").pop().toLowerCase()
                }else if(which == 1){
                    tmp = this.content.imgAfter.split(".").pop().toLowerCase()
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
            this.timerOver = false
            this.timeLeft = -4
            //this.$emit("toggleLight")
            this.preCountdown()
            this.init()
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