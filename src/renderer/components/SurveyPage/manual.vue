<template>
    <div class="explanationWrapper">
        <!--<div class="question-logo-wrapper" v-if="content.hasOwnProperty('img')">
            <img class="question-logo" v-bind:src="img" alt="" v-if="dataType=='img'">
            <vid :src="img" v-if="dataType=='video'"></vid>
        </div>
        <div class="explanationText" v-html="content.text"></div>-->
        <div class="secondWrapper">
            <div v-if="getImgPos()=='left'" class="LR">
                 <div class="logo-wrapper-LR">
                    <img class="logo-LR" :src="img" alt="" v-if="dataType=='img'">
                    <vid  :src="getImg()" v-if="dataType=='video'" v-on:videoEnd="/*showBtn = true*/$emit('nextPage')"></vid>
                </div>
                <div class="explanationText-LR">
                    <div v-html="content.text" class="explanationHTML"></div>
                </div>
            </div>

            <div v-if="getImgPos()=='right'" class="LR">
                <div class="explanationText-LR">
                    <div v-html="content.text" class="explanationHTML"></div>
                </div>
                <div class="logo-wrapper-LR">
                    <img class="logo-LR" :src="img" alt="" v-if="dataType=='img'">
                    <vid  :src="img" v-if="dataType=='video'"  class="logo-LR" v-on:videoEnd="/*showBtn = true*/$emit('nextPage')"></vid>
                </div>
            </div>

            <div v-if="getImgPos()=='top'" class="TB">
                 <div class="logo-wrapper">
                    <img class="logo" :src="img" alt="" v-if="dataType=='img'">
                    <vid  :src="getImg()" class="logo" v-if="dataType=='video'" style="display:block !important;" v-on:videoEnd="/*showBtn = true*/$emit('nextPage')"></vid>
                </div>
                <div class="explanationText">
                    <div v-html="content.text" class="explanationHTML"></div>
                </div>
            </div>

            <div v-if="getImgPos()=='bottom'" class="TB">
                <div class="explanationText">
                    <div v-html="content.text" class="explanationHTML"></div>
                </div>
                <div class="logo-wrapper">
                    <img class="logo" :src="img" alt="" v-if="dataType=='img'">
                    <vid class="logo"  :src="getImg()" v-if="dataType=='video'" style="display:block !important;" v-on:videoEnd="/*showBtn = true*/$emit('nextPage')"></vid>
                </div>
            </div>

            <div v-if="getImgPos()=='fullscreen'" class="fullscreen">
                 <div class="fullscreen-logo-wrapper">
                    <img class="fullscreen-logo" :src="img" alt="" v-if="dataType=='img'">
                    <vid class="fullscreen-logo" :fullscreen=true  :src="getImg()" v-if="dataType=='video'" v-on:videoEnd="/*showBtn = true*/$emit('nextPage')"></vid>
                </div>
                <div class="explanationText-fullscreen">
                    <div v-html="content.text" class="explanationHTML"></div>
                </div>
            </div>

            <div v-if="getImgPos()=='behind'" class="fullscreen">
                 <div class="fullscreen-logo-wrapper">
                    <img class="fullscreen-logo" :src="img" alt="" v-if="dataType=='img'">
                    <vid class="fullscreen-logo" :fullscreen=true  :src="getImg()" v-if="dataType=='video'" v-on:videoEnd="/*showBtn = true*/$emit('nextPage')"></vid>
                </div>
                <div class="explanationText-behind">
                    <div v-html="content.text" class="explanationHTML"></div>
                </div>
            </div>
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
            }
        },
        watch: {
            //To reinit the page once the data changes, which it does on question change
            content: function() { // watch it
                this.init()
            }
        },
		data: function(){	
			return{
                //image to show 
                img: Object.prototype.hasOwnProperty.call(this.content,("img")) ? this.getImg() : "",
                //the type of image to show (mp4 or png or...)
                dataType: Object.prototype.hasOwnProperty.call(this.content,("img")) ? this.getDataType() : "",
                //If we have already received a message from the admin to continue. To not skip a page
                alreadyReceived: false
			}
        },
		methods:{
            //Try to load a local image
            getImg(){
                try{
                    return require('../../assets/'+this.content.img)
                }catch(e){
					console.log(e)
                }
            } ,
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
			},
            //Find out where on the page to show the image
            getImgPos(){
                if(Object.prototype.hasOwnProperty.call(this.content,"imagePosition")){
                    return this.content.imagePosition
                }else{
                    return "top"
                }
            },
            init(){
                //Reset all data
                this.alreadyReceived = false
                this.img = Object.prototype.hasOwnProperty.call(this.content,"img") ? this.getImg() : ""
                this.dataType = Object.prototype.hasOwnProperty.call(this.content,"img") ? this.getDataType() : ""
                
                //Tell admin there is a page waiting for approval on channel x
                this.$electron.ipcRenderer.send("surveyChannel",this.content.channel)
                console.log("Page loaded, sent message")

                //when receiving data from adminpage continue to next page
                this.$electron.ipcRenderer.on("surveyChannel", (event,arg) => {
                    if(arg == this.content.channel && this.alreadyReceived == false){
                        this.alreadyReceived = true
                        console.log("received answer, will load next page")
                        this.$emit("nextPage")
                    }
                })
            }
        },
        mounted(){
            //Init page
            this.init()
        }
    }    
</script>

<style scoped>

.fullscreen-logo-wrapper{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    top: 0;
    left: 0;
}

.fullscreen-logo{
    width: 100%;
    height: auto;
}

.explWrapper{
    width: 100vw;
		position: absolute;
		top:20px;
		bottom:0px;
    overflow-y: auto;
    overflow-x: hidden;
}

.secondWrapper{
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    vertical-align: middle;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #e6e6e6;
    min-height: 100%;
    width: 100%;
    height: 100%;
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
    margin:auto;
}

.logo-LR{
    display: flex;
    height: auto;
    width: auto;
    max-width: 450px;
    margin:auto;
}

.logo-wrapper-LR{
    max-width: 450px;
}

.explanationText-LR{
    color: #484848;
    font-weight: 500;
    font-size:2rem;
    text-align: center;
    padding-left: 5%;
    padding-right: 5%;
    overflow-y: auto;
    display: flex;
    align-items: center;
    vertical-align: middle;
    flex-direction: column;
    margin: auto;
}

.LR{
    display: flex;
    align-items:center;
    width: 100%;
    height: 100%;
}

.TB{
    display: grid;
}

.fullscreen{
    width: 100%;
    height: 100%;
    display: flex;
    overflow: hidden;
    min-height: 100%;
    align-items: center;
}

.explanationText-fullscreen{
    color: #484848;
    font-weight: 500;
    font-size:2rem;
    text-align: center;
    margin: 0 auto;
    z-index: 100;
    width:60%;
    height: 60%;
    background-color: #e6e6e6;
    position: relative;
    vertical-align: middle;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.explanationText-behind{
    color: #484848;
    font-weight: 500;
    font-size:2rem;
    text-align: center;
    margin: 0 auto;
    z-index: 100;
    width:60%;
    height: 60%;
    position: relative;
    vertical-align: middle;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.explanationHTML{
    height: fit-content;
    margin: auto;
    cursor: default;
    user-select: none;
}

.btn-black{
    margin-top: 25px;
    min-width: 275px;
    min-height: 60px;
}

</style>