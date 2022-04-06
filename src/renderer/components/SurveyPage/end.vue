<template>
  <div class="explanationWrapper">
        <div class="explanationText">
            <div v-html="content.text"></div>
            <div @click="copyCodeToClipboard()" class="tooltip">
                <span class="tooltiptext" id="myTooltip">Kopieren</span>
                {{code}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
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
                //Generated Code for the subject
                code: ""
			}
		},
		methods:{
            /**
             * Init page by setting the code,
             * telling the admin that survey is ready to end
             */
            init(){   
                this.code = this.$parent.receivedCode
                this.$electron.ipcRenderer.send("surveyOps","readyToEnd")
                console.log("Page loaded, sent message")
            },
            /**
             * Copies the code to the clipboard
             */
            copyCodeToClipboard(){
                var textArea = document.createElement("textarea");
                textArea.value = this.code;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
            }
        },
        mounted(){
            //init page
            this.init()
        }
    }
</script>

<style scoped>
    .tooltip {
        position: relative;
        display: inline-block;
    }

    .tooltip .tooltiptext {
        visibility: hidden;
        width: 85px;
        background-color: #555;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        bottom: 100%;
        left: 80%;
        margin-left: -75px;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 1rem;
    }

    .tooltip .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555 transparent transparent transparent;
    }

    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
</style>