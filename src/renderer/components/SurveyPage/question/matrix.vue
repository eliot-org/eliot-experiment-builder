<template>
    <div class="right-side-parent">
        <div class="answer-matrix-wrapper">
            <div class="answer-column">
                <div class="option-y">{{options.above}}</div>
                <div class="answer-row">
                    <div class="option-x">{{options.left}}</div>
                    <div class="matrix" @touchmove="moveDot()" @mousemove="moveDot()" @touchstart="captureOn()" @mousedown="captureOn()" @touchend="captureOff()" @touchcancel="captureOff()" @mouseup="captureOff()">
                        <div class="" id="matrix" ref="matrix" v-bind:class="getMatrixClass()">

                        </div>
                        <div class="dot" id="dot" ref="dot" v-bind:style="{top: dotTop+'px', left: dotLeft+'px'}">
                            
                        </div>
                    </div>
                    <div class="option-x">{{options.right}}</div>
                </div>
                <div class="option-y">{{options.below}}</div>
            </div>
        </div>
        <div class="ok-btn">
            <button @click="sendData()" class="btn-black" type="button">
                <span class="btn-text">Next</span>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
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
		data: function(){	
			return{
                //If the mouse position should be logged
                captureToggle: false,
                //y pos of dot
                dotTop: 0,
                //x pos of dot
                dotLeft: 0,
                //x pos of mouse
                x: 0,
                //y of mouse
                y: 0,
                //Did the user already click on the continue button? To prevent skipping a page
                alreadyClicked: false,
			}
		},
		methods:{
            //Which type of matrix to show
            getMatrixClass: function(){
                if(Object.prototype.hasOwnProperty.call(this.options,"alignment")){
                    if(this.options.alignment == "horizontal"){ //Wenn explizit horizontal gefordert ist
                        return "matrix-background-horizontal"
                    }else if(this.options.alignment == "vertical"){
                        return "matrix-background-vertikal"
                    }else{ //Ansonsten automatisch
                        return "matrix-background-diagonal"
                    }
                }else{ //Ansonsten automatisch
                    return "matrix-background-diagonal"
                }
            },
            sendData(){//Sends data to parent, resets local data, calls next page
                if(!this.alreadyClicked){
                    this.alreadyClicked = true
                    this.$emit("updateAnswers", [Math.round((this.x + Number.EPSILON) * 100) / 100, Math.round((this.y + Number.EPSILON) * 100) / 100])
                    this.dotTop = 0
                    this.dotLeft = 0
                    this.x = 0
                    this.y = 0
                    this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
                }
            },
            //Move the dot to mouse pos
            moveDot: function(){
                if(this.captureToggle){
                    const matrixLeft = this.$refs["matrix"].getBoundingClientRect().left
                    const matrixTop = this.$refs["matrix"].getBoundingClientRect().top
                    const matrixWidth = this.$refs["matrix"].clientWidth
                    const matrixHeight = this.$refs["matrix"].clientHeight
                    let mouseX = 0; 
                    let mouseY = 0;
                    if(event.type == "touchstart" ||event.type == "touchmove" || event.type == "touchend"){
                        event.preventDefault()
                        event.stopImmediatePropagation();
                        if(event.touches.length > 0){
                            mouseX = event.touches.item(0).clientX; 
                            mouseY = event.touches.item(0).clientY;
                        }
                    }else{
                        mouseX = event.pageX; 
                        mouseY = event.pageY;
                    }
                    if(((mouseX - matrixLeft)>=0) && ((mouseY - matrixTop)>=0)){ //As long as mouse is inside matrix, lower boundary
                        if(((mouseX - matrixLeft)<=matrixWidth) && ((mouseY - matrixTop)<=matrixHeight)){//Upper Boundary
                            this.dotLeft= mouseX - matrixLeft;
                            this.dotTop= mouseY - matrixTop;
                            
                            this.x = ((this.dotLeft/matrixWidth)*100)
                            this.y = ((this.dotTop/matrixHeight)*100)

                        }
                    }
                }
            },
            //On click follow mouse pos
            captureOn: function(){
                this.captureToggle = true
                this.moveDot()
                console.log("on")
            },
            //on second click stop following mouse
            captureOff: function(){
                this.moveDot()
                this.captureToggle = false
                console.log("off")
            },
            //init data
            init(){
                this.dotLeft = (this.$refs["matrix"].clientWidth/2)
                this.dotTop = (this.$refs["matrix"].clientHeight/2)
                this.x = 50
                this.y = 50
            },
        },
        mounted(){
            this.init()
        }
    }
</script>

<style scoped>
    .answer-column{
        display: flex;
        flex-direction: column;
        align-items: center;
		justify-content:center;
        width:85%;
        max-height: 100%;
    }

    .answer-row{
        display: flex;
        flex-direction: row;
        align-items: center;
		justify-content:center;
        width:inherit;
    }

    .matrix{
        width: 70%;
        height: 100%;
        float:left;
        position:relative;
    }

    .answer-matrix-wrapper{
		height:90%;
		width:100%;
        display:flex;
        align-items: center;
		justify-content:center;
    }

    .matrix-background-diagonal{
        padding-top:100%;
        background: linear-gradient(225deg, #00B050,#FFD966, #FF0000);
    }

    .matrix-background-horizontal{
        padding-top:100%;
        background: linear-gradient(180deg, #00B050,#FFD966, #FF0000);
    }

    .matrix-background-vertikal{
        padding-top:100%;
        background: linear-gradient(270deg, #00B050,#FFD966, #FF0000);
    }

    .option-y{
        margin:25px;
        text-align: center;
        font-weight: 600;
        font-size: 18px;
        min-width: min-content;
        min-height: min-content;
        cursor: default;
        user-select: none;
    }

    .option-x{
        text-align: center;
        font-weight: 600;
        font-size: 18px;
        float:left;
        min-height: min-content;
        cursor: default;
        user-select: none;
        padding-left: 5px;
        padding-right: 5px;
    }

    .dot{
        position: absolute;
        width: 30px;
        height: 30px;
        border: 4px solid #f9f9f9;
        border-radius: 15px;
        background: #212529;
        margin-top: -12px;
        margin-left: -12px;
    }

</style>