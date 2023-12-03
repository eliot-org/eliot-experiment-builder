<template>
    <div class="wrapper">
        <title>ELIOT Survey</title>
        <div class="welcome-wrapper">
            <div v-html="content.text"></div>
            <input style="border-style:solid;" type="text" min="0" v-model="subjectCode" class="input">
        </div>
        <br>
        <div class="start-wrapper">
            <button @click="nextPage()" class="btn-black" type="button">
                <span class="btn-text">{{continueBtnText}}</span>
            </button>
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
            }
        },
        data: function(){
            return{
                //The code of the subject
                subjectCode: "",
                //error message
                error: ""
            }
        },
        computed: {
            continueBtnText: function(){
                if(this.content !== undefined){
                    return (this.content.continueBtnText !== undefined && this.content.continueBtnText !== "") ? this.content.continueBtnText : 'Next'
                }else{
                    return "Next"
                }
            }
        },
        methods:{
            nextPage: function(){
                if(this.subjectCode != ""){
                    this.$emit("subjectCode", this.subjectCode)
                }
                this.$emit("nextPage")
            },
        }
    }
</script>

<style scoped>
    .error{
        color: red;
        font-size: medium;
    }
    .wrapper{
		position: absolute;
		bottom:0px;
        width: 100vw;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
    }

    .logo{
        height:auto;
        width:300px;
    }

    .welcome-wrapper{
        margin: 0 auto;
        text-align: center;
        font-size: 40px;
        color: #696969;
        font-weight: 100;
        margin-top: 70px;
    }

    .start-wrapper{
        margin: 0 auto;
    }

    .logo-wrapper{
        margin: 0 auto;
    } 
    
    .input{
        margin:0 auto;
        width: 35%;
        height: 35px;
        padding-left:10px;
        text-align: center;
    }
</style>