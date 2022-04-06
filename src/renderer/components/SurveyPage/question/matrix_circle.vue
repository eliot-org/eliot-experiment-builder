<template>
    <div class="right-side-parent">
        <div class="answer-matrix-wrapper">
            <div class="answer-column" >
                <div class="progress" v-if="get3D() !=''">
                    <div style="margin-bottom:6px">{{get3D()}}</div>
                    <div class="barOverflow">
                        <div class="bar" v-bind:style="{transform:'rotate('+(45+(radiusCalc*(1.8)))+'deg)'}"></div>
                    </div>
                    <span>{{radiusCalc}}</span>
                </div>
                <div class="option-y">{{options.above}}</div>
                <div class="answer-row">
                    <div class="option-x">{{options.left}}</div>
                    <div class="matrix" @touchmove="moveDot()" @mousemove="moveDot()" @touchstart="captureOn()" @mousedown="captureOn()" @touchend="captureOff()" @touchcancel="captureOff()" @mouseup="captureOff()">
                        <div class="" id="matrix" ref="matrix" v-bind:class="getMatrixClass()">

                        </div>
                        <div class="dot" id="dot" ref="dot" v-bind:style="{top: dotTop+'px', left: dotLeft+'px', width: radius+'px', height: radius+'px', 
                        marginTop: -(radius/2)+'px', marginLeft: -(radius/2)+'px', borderRadius: (radius/2)+'px', 'background': getColor()}">
                            
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
    import Gradient from "javascript-color-gradient"
    const colorGradient = new Gradient()
    const c1 = "#FF0000"
    const c2 = "#FFD966"
    const c3 = "#00B050"
    colorGradient.setMidpoint(100)
    colorGradient.setGradient(c1,c2,c3)
    export default {
        props:{
            //The options for this question
            options:{
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
                //Radius of dot
                radius: 0,
                //calulated percentage of radius(0-100%)
                radiusCalc: 0,
                //Maximum radius in px
                maxRadius: 40
			}
		},
		methods:{
            //Find out what color the dot should be, depending on percentage 
            getColor: function(){
                console.log(this.radiusCalc)
                return colorGradient.getColor(Math.round(this.radiusCalc)+1)
            },
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
            //Should the third dimension data be shown
            get3D: function(){
                if(Object.prototype.hasOwnProperty.call(this.options,"thirdDimension")){
                    return this.options.thirdDimension
                }else{
                    return ""
                }
            },
            sendData(){//Sends data to parent, resets local data, calls next page
                if(!this.alreadyClicked){
                    this.alreadyClicked = true
                    this.$emit("updateAnswers", [Math.round((this.x + Number.EPSILON) * 100) / 100, Math.round((this.y + Number.EPSILON) * 100) / 100, Math.round((this.radiusCalc + Number.EPSILON) * 100) / 100])
                    this.dotTop = 0
                    this.dotLeft = 0
                    this.x = 0
                    this.y = 0
                    this.$emit("nextPage")
                    setTimeout(() => {this.alreadyClicked = false}, 250)
                }
            },
            // Calculate where exactly the mouse is inside the matrix
            calculatePos: function(){
                const matrixLeft = this.$refs["matrix"].getBoundingClientRect().left
                const matrixTop = this.$refs["matrix"].getBoundingClientRect().top
                const matrixWidth = this.$refs["matrix"].clientWidth
                const matrixHeight = this.$refs["matrix"].clientHeight
                let mouseX = 0; 
                let mouseY = 0;
                if(event.type == "touchstart" ||event.type == "touchmove" || event.type == "touchend"){
                    //event.preventDefault()
                    //event.stopImmediatePropagation();
                    //if(event.touches.length > 0){
                        mouseX = parseInt(event.touches[0].clientX) 
                        mouseY = parseInt(event.touches[0].clientY)
                    //}
                }else{
                    mouseX = event.pageX; 
                    mouseY = event.pageY;
                }
                if(((mouseX - matrixLeft)>=0) && ((mouseY - matrixTop)>=0)){ //As long as mouse is inside matrix, lower boundary
                    if(((mouseX - matrixLeft)<=matrixWidth) && ((mouseY - matrixTop)<=matrixHeight)){//Upper Boundary
                        return {"dotLeft": mouseX - matrixLeft, "dotTop": mouseY - matrixTop, "x": ((this.dotLeft/matrixWidth)*100), "y": ((this.dotTop/matrixHeight)*100)}
                    }
                }
                
                return []
            },
            //Move the dot to mouse pos and calculate size of it
            moveDot: function(){
                if(this.captureToggle){
                    let resp = this.calculatePos()
                    if(resp.dotTop != this.dotTop || resp.dotLeft != this.dotLeft){
                        let a = 0
                        let b = 0
                        console.log(event)
                        if(event.type == "touchstart" ||event.type == "touchmove" || event.type == "touchend"){
                            a = Math.abs(this.dotTop+this.$refs["matrix"].getBoundingClientRect().top - parseInt(event.touches[0].clientY))//Damit das auch außerhalb der Matrix berechnet wird
                            b = Math.abs(this.dotLeft+this.$refs["matrix"].getBoundingClientRect().left - parseInt(event.touches[0].clientX))
                        }else{
                            a = Math.abs(this.dotTop+this.$refs["matrix"].getBoundingClientRect().top - event.pageY)//Damit das auch außerhalb der Matrix berechnet wird
                            b = Math.abs(this.dotLeft+this.$refs["matrix"].getBoundingClientRect().left - event.pageX)
                        }
                        let c = Math.sqrt((a*a)+(b*b))//Radius vom Kreis a^2+b^2=c^2
                        c = (c > this.maxRadius) ? this.maxRadius : c  //Max von c ist maxRadius
                        console.log("a "+a)
                        console.log("b "+b)
                        console.log("c "+c)
                        this.radius = c
                        this.radiusCalc = Math.round(Number(((c * (100/this.maxRadius)).toString()).slice(0,5))) //Max radius ist 40, wollen aber 0-100 Punkte 
                    }
                }
            },
            //On click follow mouse pos
            captureOn: function(){
                this.captureToggle = true
                let resp = this.calculatePos()
                this.x = resp.x
                this.y = resp.y
                this.dotTop = resp.dotTop
                this.dotLeft = resp.dotLeft
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
                this.maxRadius = (Object.prototype.hasOwnProperty.call(this.options,"circleSize") ? this.options.circleSize : 40)
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
        border: 1px solid #212529;
        border-radius: 15px;
        background: #212529;
        margin-top: -12px;
        margin-left: -12px;
    }

    .progress{
        position: relative;
        margin: 8px;
        float:left;
        text-align: center;

    }
    .barOverflow{ /* Wraps the rotating .bar */
        position: relative;
        overflow: hidden; /* Comment this line to understand the trick */
        width: 180px;
        height: 90px; /* Half circle (overflow) */
        margin-bottom: -28px; /* bring the numbers up */
    }

    .bar{
        position: absolute;
        top: 0;
        left: 0;
        width: 180px;
        height: 180px; /* full circle! */
        border-radius: 50%;
        box-sizing: border-box;
        border: 20px solid #FFF;     /* half gray, */
        border-bottom-color: #b7b7b8;  /* half azure */
        border-right-color: #b7b7b8;
    }
</style>