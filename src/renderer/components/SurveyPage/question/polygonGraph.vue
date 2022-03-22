<template>
    <div class="right-side-parent">
        <div class="answer-polygraph-wrapper">
            <div class="svg-wrapper">
                <svg width="300" height="300" class="svg">
                    <polygraph :stats="graphAverage() ? (options[0] != 'hide' ? [average]: picked) : picked"></polygraph>
                </svg>
                <div v-if="options[0]!= 'hide'" class="average">Durchschnitt: {{average.value}}</div><br>
            </div>
            <div class="answers" ref="answers" id="answers">
                <div class="slider-wrapper" v-for="(option,index) in picked" v-bind:key="index">
                    <div class="slider-text" v-html="option.label.sliderText"></div>
                    <div class="slidercontainer">
                        <vue-slider v-model="picked[index].value" :data="(option.hasOwnProperty('data')) ? option.data : null " v-bind="sliderOptions(index)" style="height:10px">                  
                            <template v-slot:dot="{focus }">
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
                                        </video> </div>
                                    <div v-html="label"></div>
                                </div>
                            </template>
                        </vue-slider>
                    </div>            
                </div>   
            
                <div class="ok-btn">
                    <button @click="sendData()" class="btn-black" type="button">
                        <span class="btn-text">Weiter</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import polygraph from './polygonGraph/polygraph'
    export default{
        props:{
            //The options for this question
            options:{
               required:true
           }
        },
        watch: {
            //To reinit the page once the data changes, which it does on question change
            options: function() { // watch it
                this.init()
            }
        },
        //Load in the polygon
        components: { polygraph },
        data: function(){	
			return{
                //Answers picked by user
                picked: [],
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
                pictureLocation: "",
            }
        },
        computed: {
            //Compute the average over all sliders
            average: function(){
                let tmp = 0
                if(this.picked.length > 0){
                    for(let i = 0; i < this.picked.length; i++){
                        tmp += this.picked[i].value
                    }
                    tmp = tmp/this.picked.length
                }
                return {label:{name:"", text:""}, value: (tmp.toString()).slice(0,4)}
            } 
        },
        methods:{
            //get images datatype for slider i
            getDataType: function(i,pos){
                let tmp = this.getImg(i,pos)
                if(tmp != null){
                    tmp = tmp.split(".").pop().toLowerCase()
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
            //Load local image for slider i
            getImg: function(i,pos){
                if(Object.prototype.hasOwnProperty.call(this.options[(this.graphAverage() ? (i+1) : i)],"img")){
                    if(Object.prototype.hasOwnProperty.call(this.options[(this.graphAverage() ? (i+1) : i)],"marks")){
                        if(Object.keys(this.options[(this.graphAverage() ? (i+1) : i)].marks).includes(pos.toString())){
                            return this.pictureLocation+"/"+ this.options[(this.graphAverage() ? (i+1) : i)].img[Object.keys(this.options[(this.graphAverage() ? (i+1) : i)].marks).findIndex((e) => e === pos.toString())]
                        }
                    }else{
                        if(pos == 0){
                            return this.pictureLocation+"/"+ this.options[(this.graphAverage() ? (i+1) : i)].img[0]
                        }else if(pos == 100){
                            return this.pictureLocation+"/"+ this.options[(this.graphAverage() ? (i+1) : i)].img[1]
                        }
                    }
                }
                return ""
            },
            //Do we want to load an image for slider i
            isImgTagThere: function(i,pos){
                if(Object.prototype.hasOwnProperty.call(this.options[(this.graphAverage() ? (i+1) : i)],"img")){
                    if(Object.prototype.hasOwnProperty.call(this.options[(this.graphAverage() ? (i+1) : i)],"marks")){
                        if(Object.keys(this.options[(this.graphAverage() ? (i+1) : i)].marks).includes(pos.toString())){
                            return true 
                        }
                    }else{
                        if(pos == 0 || pos == 100){
                            return true
                        }   
                    }
                }
                return false
            },
            //Load options for slider i
            sliderOptions: function(i){
                var sliderOptions = {
                    tooltip:"always",
                    processStyle:{backgroundColor: '#ccc', opacity: "1"},
                    railStyle:{backgroundColor: '#e6e6e6'},
                    silent:true,
                }
                
                if(Object.prototype.hasOwnProperty.call(this.options[(this.graphAverage() ? (i+1) : i)],"sliderStyle")){
                    if(this.options[(this.graphAverage() ? (i+1) : i)].sliderStyle == "neutral1"){
                        sliderOptions.processStyle = {backgroundColor: '#e6e6e6',opacity: "1"}
                        sliderOptions.railStyle = {backgroundColor: '#e6e6e6'}
                    }else if(this.options[(this.graphAverage() ? (i+1) : i)].sliderStyle == "neutral2"){
                        sliderOptions.processStyle = {backgroundColor: '#ccc',opacity: "1"}
                        sliderOptions.railStyle = {backgroundColor: '#e6e6e6'}
                    }else if(this.options[(this.graphAverage() ? (i+1) : i)].sliderStyle == "quantity"){
                        sliderOptions.railStyle = {backgroundImage: 'linear-gradient(to right, #c8c8c8 0%,#7f7f7f 40%,#7f7f7f 60%, #373737 100%)'}
                        sliderOptions.processStyle = {opacity: "0"}
                    }else if(this.options[(this.graphAverage() ? (i+1) : i)].sliderStyle == "quality"){
                        sliderOptions.railStyle = {backgroundImage: 'linear-gradient(to left, #00B050 0%,#FFD966 40%,#FFD966 60%, #FF0000 100%)'}
                        sliderOptions.processStyle = {opacity: "0"}
                    }
                }

                if(Object.prototype.hasOwnProperty.call(this.options[(this.graphAverage() ? (i+1) : i)],"marks")){
                    sliderOptions.marks = this.options[(this.graphAverage() ? (i+1) : i)].marks//für eigene Marks
                    for(var key in sliderOptions.marks){
                        if(sliderOptions.marks[key] == null){
                            sliderOptions.marks[key] = ""
                        }
                    }
                }else{
                    sliderOptions.marks = [0,50,100]
                }
                
                return sliderOptions
            },
            //Should the tooltip in this slider i be shown
            tooltip: function(i){
                if(this.graphAverage()){//Wegen Verschiebung durch start bei 1 oder 0
                    i++
                }
                if(Object.prototype.hasOwnProperty.call(this.options[i],"tooltip")){
                    if(this.options[i].tooltip == "false"){
                        return false
                    }else{
                        return true
                    }
                }
                return true
            },
            //Reset data
            init(){
                for (var i= (this.graphAverage() ? 1 : 0);i<this.options.length;i++){
                    this.picked.push({name:this.options[i].name, label: {"name":this.options[i].name, "text":this.options[i].text,"sliderText":Object.prototype.hasOwnProperty.call(this.options[i],"sliderText") ? this.options[i].sliderText : this.options[i].text}, value:Object.prototype.hasOwnProperty.call(this.options[i], "defaultValue") ? this.options[i].defaultValue :50})//Für Skala von 0-100   
                }
                setTimeout(() => {this.$refs.answers.scroll(0,0)}, 50)
            },
            sendData: function(){//Sends data to parent, resets local data, calls next page
                if(!this.alreadyClicked){
                    console.log(this.picked)
                    this.alreadyClicked = true
                    this.$emit("updateAnswers", this.picked)
                    this.picked = []
                    this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
                }
            },
            //should the average be shown
            graphAverage: function(){
                if(this.options[0] == "average" || this.options[0]== "hide"){
                    return true
                }else{
                    return false
                }
            },
            getPicDir: async function(){
                this.pictureLocation = await this.$electron.ipcRenderer.invoke('getStoreValue', 'pictureLocation')
                this.init()
            },
        },        
        mounted(){
            //init page
            this.igetPicDirnit()
        },
    }
</script>

<style scoped>
    .logo-wrapper{
        margin: auto;
        width: fit-content;
    }
    
    .logo{
        width: 70px;
        max-height: 70px;
    }

    .svg{
        display: block;
        margin: auto;
    }

    .text {
        font-family: Helvetica Neue, Arial, sans-serif;
        font-size: 10px;
        fill: #666;
    }

    .label {
        display: inline-block;
        margin-left: 10px;
        width: 20px;
    }

    .answer-polygraph-wrapper{
		height:90%;
		width:100%;
        display:flex;
        align-items: center;
		justify-content:center;
        flex-direction: column;
    }
    
    .answers{
		overflow-y: auto;
        padding: 0% 7% 0% 7%;
        height:100%;
        width: 100%;
        justify-content: center;
    }

    .custom-mark {
        position: absolute;
        top: 15px;
        transform: translateX(-50%);
        width: 15%;
        text-align: center;
        display: flex;
        flex-direction: column;
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
        height:10px
    }

    .slider-wrapper{
        margin-bottom: 30px;
        min-height: 250px;
    }

    .svg-wrapper{
        margin:0 auto;
    }

    .average{
        margin:auto;
        width:min-content;
        cursor: default;
        user-select: none;
    }
</style>