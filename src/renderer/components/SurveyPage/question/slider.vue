<template>
    <div class="right-side-parent">
        <div class="answer-slider-wrapper" id="answers" ref="answers">
            <div class="answers">
                <div class="slider-wrapper" v-for="(option,index) in options" v-bind:key="index">
                    <div class="slider-text" v-html="option.text"></div>
                    <div class="slidercontainer">
                        <vue-slider v-model="picked[index].value" :data="(option.hasOwnProperty('data')) ? option.data : null " v-bind="sliderOptions(index)" style="height:10px">                         
                            <template v-slot:dot="{ focus }">
                                <div :class="['custom-dot', { focus }]"></div>
                            </template>
                            <template v-slot:tooltip="{ focus }">
                                <div v-if="!tooltip(index)"></div>
                                <div v-if="tooltip(index)" :class="['custom-tooltip', { focus }]">{{picked[index].value}}</div>
                            </template>
                            <template v-slot:mark="{ pos, label }">
                                <div class="custom-mark" :style="{ left: `${pos}%` }">
                                    <div class="logo-wrapper">
                                        <img class="logo" v-bind:src="getImg(index,pos)" alt="" v-if="isImgTagThere(index,pos) && getDataType(index,pos) =='img'">
                                        <video id="video" ref="video" class="logo" v-if="isImgTagThere(index,pos) &&  getDataType(index,pos) =='video'" autoplay loop>
                                            <source :src="getImg(index,pos)"  type="video/mp4">
                                            Your browser does not support the video tag.
                                        </video> 
                                    </div>
                                    <div v-html="label"></div>
                                </div>
                            </template>
                        </vue-slider>
                    </div>            
                </div>  
            
                <div class="ok-btn">
                    <button @click="sendData()" class="btn-black" type="button">
                        <span class="btn-text">{{continueBtnText}}</span>
                    </button>
                </div>     
            </div>  
        </div>
    </div>
</template>

<script>
    export default {
        props:{
            //The options for this question
            options:{
               required:true
           },
           continueBtnText:{
               required:true
           },
        },
        watch: {
            //To reinit the page once the data changes, which it does on question change
            options: function() { // watch it
                this.init()
            }
        },
		data: function(){	
			return{
                //The answers
                picked: [],
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
                assetLocation: "",
			}
        },
		methods:{
            //Get the type of the image
            getDataType: function(i,pos){
                let tmp = this.getImg(i,pos)
                if(tmp != null){
                    tmp = tmp.split(".").pop().toLowerCase()
                    if(tmp == "mp4"){
                        return "video"
                    }else if((tmp == "png") || (tmp =="jpg") || (tmp == "jpeg") || (tmp == "gif")){
                        return "img"
                    }else{
                        return "img"
                    }
                }
            },
            //Load the local images
            getImg: function(i,pos){
                if(Object.prototype.hasOwnProperty.call(this.options[i],"img")){
                    if(Object.prototype.hasOwnProperty.call(this.options[i],"marks")){
                        /*if(pos == 0 && Object.prototype.hasOwnProperty.call(this.options[i],"min")){//Wenn es ein min < 0 gibt und dieses in den Marks ist und die pos gerade 0 ist(Minimale position)
                            if(Object.keys(this.options[i].marks).includes(this.options[i].min.toString())){
                                return require('../../../assets/'+ this.options[i].img[0]) 
                            }
                        }else if(pos == 100 && Object.prototype.hasOwnProperty.call(this.options[i],"max")){
                            if(Object.keys(this.options[i].marks).includes(this.options[i].max.toString())){
                                return require('../../../assets/'+ this.options[i].img[1])
                            }
                        }else*/ if(Object.keys(this.options[i].marks).includes(pos.toString())){
                            return this.assetLocation+"/"+ this.options[i].img[Object.keys(this.options[i].marks).findIndex((e) => e === pos.toString())]
                        }
                    }else{
                        if(pos == 0){
                            return this.assetLocation+"/"+ this.options[i].img[0]
                        }else if(pos == 100){
                            return this.assetLocation+"/"+this.options[i].img[1]
                        }
                    }
                }
                return ""
            },
            //Does the surveyfile even have image paths?
            isImgTagThere: function(i,pos){
                if(!Object.prototype.hasOwnProperty.call(this.options[i],"data")){
                    if(Object.prototype.hasOwnProperty.call(this.options[i],"img")){
                        if(Object.prototype.hasOwnProperty.call(this.options[i],"marks")){
                            if(pos == 0 && Object.prototype.hasOwnProperty.call(this.options[i],"min")){//Wenn es ein min < 0 gibt und dieses in den Marks ist und die pos gerade 0 ist(Minimale position)
                                if(Object.keys(this.options[i].marks).includes(this.options[i].min.toString())){
                                    return true 
                                }
                            }else if(pos == 100 && Object.prototype.hasOwnProperty.call(this.options[i],"max")){
                                if(Object.keys(this.options[i].marks).includes(this.options[i].max.toString())){
                                    return true 
                                }
                            }else if(Object.keys(this.options[i].marks).includes(pos.toString())){
                                return true 
                            }
                        }else{
                            if(pos == 0 || pos == 100){
                                return true
                            }   
                        }
                    }
                }
                return false
            },
            //Should the tooltip in this slider i be shown
            tooltip: function(i){
                if(Object.prototype.hasOwnProperty.call(this.options[i],"tooltip")){
                    if(this.options[i].tooltip == "false"){
                        return false
                    }else{
                        return true
                    }
                }
                return true
            },
            //Get the options of slider i
            sliderOptions: function(i){
                 var sliderOptions = {
                    tooltip:"always",
                    processStyle:{backgroundColor: '#ccc', opacity: "1"},
                    railStyle:{backgroundColor: '#e6e6e6'},
                    silent:true,
                }
                
                if(Object.prototype.hasOwnProperty.call(this.options[i],"sliderStyle")){
                    if(this.options[i].sliderStyle == "neutral1"){
                        sliderOptions.processStyle = {backgroundColor: '#e6e6e6',opacity: "1"}
                        sliderOptions.railStyle = {backgroundColor: '#e6e6e6'}
                    }else if(this.options[i].sliderStyle == "neutral2"){
                        sliderOptions.processStyle = {backgroundColor: '#ccc',opacity: "1"}
                        sliderOptions.railStyle = {backgroundColor: '#e6e6e6'}
                    }else if(this.options[i].sliderStyle == "quantity"){
                        sliderOptions.railStyle = {backgroundImage: 'linear-gradient(to right, #c8c8c8 0%,#7f7f7f 40%,#7f7f7f 60%, #373737 100%)'}
                        sliderOptions.processStyle = {opacity: "0"}
                    }else if(this.options[i].sliderStyle == "quality"){
                        sliderOptions.railStyle = {backgroundImage: 'linear-gradient(to left, #00B050 0%,#FFD966 40%,#FFD966 60%, #FF0000 100%)'}
                        sliderOptions.processStyle = {opacity: "0"}
                    }
                }
                
                if(Object.prototype.hasOwnProperty.call(this.options[i],"data")){
                    sliderOptions.marks = this.options[i].data//Für Slider wenn er Buchstaben hat
                }else{
                    if(Object.prototype.hasOwnProperty.call(this.options[i],"marks")){
                        sliderOptions.marks = this.options[i].marks//für eigene Marks
                        for(var key in sliderOptions.marks){
                            if(sliderOptions.marks[key] == null){
                                sliderOptions.marks[key] = ""
                            }
                        }
                        if(Object.prototype.hasOwnProperty.call(this.options[i],"min")){//Wenn custom min max
                            sliderOptions.min = this.options[i].min
                        }
                        if(Object.prototype.hasOwnProperty.call(this.options[i],"max")){//Wenn custom min max
                            sliderOptions.max = this.options[i].max
                        }
                    }else{
                        if(Object.prototype.hasOwnProperty.call(this.options[i],"min")){//Wenn custom min max
                            sliderOptions.min = this.options[i].min
                            if(Object.prototype.hasOwnProperty.call(this.options[i],"max")){
                                sliderOptions.max = this.options[i].max
                                sliderOptions.marks = [sliderOptions.min,((sliderOptions.min+sliderOptions.max)/2),sliderOptions.max]
                            }else{
                                sliderOptions.marks = [sliderOptions.min,((sliderOptions.min+100)/2),100]
                            }
                        }else if(Object.prototype.hasOwnProperty.call(this.options[i],"max")){//Wenn custom min max
                            sliderOptions.max = this.options[i].max
                            if(Object.prototype.hasOwnProperty.call(this.options[i],"min")){
                                sliderOptions.min = this.options[i].min
                                sliderOptions.marks = [sliderOptions.min,((sliderOptions.min+sliderOptions.max)/2),sliderOptions.max]
                            }else{
                                sliderOptions.marks = [0,((0+sliderOptions.max)/2),sliderOptions.max]
                            }
                        }else{
                            sliderOptions.marks = [0,50,100]
                        }
                    }
                } 
                return sliderOptions
            },
            //reset data
            init(){//Text wird über dem Slider angezeigt
                for (var i=0;i<this.options.length;i++){
                    if(Object.prototype.hasOwnProperty.call(this.options[i],"data")){
                        this.picked.push({name:this.options[i].name, text: this.options[i].text, value:Object.prototype.hasOwnProperty.call(this.options[i], "defaultValue") ? this.options[i].defaultValue :this.options[i].data[Math.floor(this.options[i].data.length/2)]})//Für Slider wenn er Buchstaben hat
                    }else{
                        if(Object.prototype.hasOwnProperty.call(this.options[i],"min")){//Wenn custom min max
                            if(Object.prototype.hasOwnProperty.call(this.options[i],"max")){
                                this.picked.push({name:this.options[i].name, text: this.options[i].text, value:Object.prototype.hasOwnProperty.call(this.options[i], "defaultValue") ? this.options[i].defaultValue :((this.options[i].min+this.options[i].max)/2)})
                            }else{
                                this.picked.push({name:this.options[i].name, text: this.options[i].text, value:Object.prototype.hasOwnProperty.call(this.options[i], "defaultValue") ? this.options[i].defaultValue :((this.options[i].min+100)/2)})
                            }
                        }else if(Object.prototype.hasOwnProperty.call(this.options[i],"max")){//Wenn custom min max
                            if(Object.prototype.hasOwnProperty.call(this.options[i],"min")){
                                this.picked.push({name:this.options[i].name, text: this.options[i].text, value:Object.prototype.hasOwnProperty.call(this.options[i], "defaultValue") ? this.options[i].defaultValue :((this.options[i].min+this.options[i].max)/2)})
                            }else{
                                this.picked.push({name:this.options[i].name, text: this.options[i].text, value:Object.prototype.hasOwnProperty.call(this.options[i], "defaultValue") ? this.options[i].defaultValue :((0+this.options[i].max)/2)})
                            }
                        }else{
                            this.picked.push({name:this.options[i].name, text: this.options[i].text, value:50})//Für Skala von 0-100
                        }
                    } 
                }
                setTimeout(() => {this.$refs.answers.scroll(0,0)}, 50)
            },
            //Send answers
            sendData: function(){//Sends data to parent, resets local data, calls next page
               if(!this.alreadyClicked){
                    this.alreadyClicked = true
                    this.$emit("updateAnswers", this.picked)
                    this.picked = []
                    this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
                }
            },
            getAssetDir: async function(){
                this.assetLocation = await this.$electron.ipcRenderer.invoke('getStoreValue', 'assetLocation')
                this.init()
            },
        },
        mounted(){
            //init page
            this.getAssetDir()
        }
    }
</script>

<style scoped>
    
    .logo-wrapper{
        margin: auto;
        width: fit-content;
    }

    .custom-mark {
        position: absolute;
        top: 15px;
        transform: translateX(-50%);
        text-align: center;
        width: 15%;
        text-align: center;
        display: flex;
        flex-direction: column;
    }
    
    .logo{
        width: 70px;
        max-height: 70px;
    }

    .slider-text{
        margin-bottom:45px;
        font-weight: 500;
        font-size: 22px;
        cursor: default;
        user-select: none;
    }

    .custom-dot{    
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #212529;
        transition: all .3s;
    }

    .custom-tooltip {
        width: 40px;
        height: 30px;
        text-align: center;
        color: #f9f9f9;
        background-color: #212529;
        line-height: 1.9rem;
    }

    .custom-tooltip::after{
        content: "";
        position: absolute;
        transform: rotate(45deg) scale(1);
        opacity:1;
        left: 14px;
        top: 24px;
        width: 9px;
        height: 9px;
        border: solid #212529;
        border-width: 0 2px 2px 0px;
        background-color: #212529;
        border-radius: 0;
    }

    .tooltip{
        width: 40px;
        height: 25px;
        position:absolute;
        text-align: center;
        color: #f9f9f9;
        background-color: #212529;
    }

    .tooltip-text{
        margin:0 auto;
    }

    .slidercontainer{
        position:relative;
        height:125px;
    }

    .answer-slider-wrapper{
		height:90%;
		width:100%;
        display:flex;
        align-items: center;
		justify-content:center;
        overflow: auto;
    }
    
    .answers{
        height:75%;
        width: 75%;
        justify-content: center;
    }

    .slider-wrapper{
        margin-bottom: 30px;
        min-height: 250px;
    }
</style>