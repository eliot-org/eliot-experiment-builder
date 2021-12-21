<template>
    <div class="wrapper">
        <title>ELIOT Survey</title>
        <!--<div class="logo-wrapper">
            <img class="logo" src="~@/assets/eliot.png" alt="ELIOT Logo">
        </div>-->
        <div class="welcome-wrapper">
            <p><b>Herzlich willkommen zur heutigen Messung </b></p>
            <br>
            <p>Wenn Sie bereits früher an der Umfrage teilgenommen haben, geben Sie bitte hier Ihren persönlichen Code ein:</p>
            <input type="text" min="0"  v-model="probandCode" class="input">
            <br>
            <span class="error">{{error}}</span>
            <br>
        </div>
        <div class="start-wrapper">
            <button @click="checkCode()" class="btn-black" type="button">
                <span class="btn-text">MESSUNG STARTEN</span>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return{
                //The code of the subject
                probandCode: "",
                //error message
                error: ""
            }
        },
        methods:{
            /**
             * Checks if the probands code really exists
             */
            checkCode: function(){
                if(this.probandCode == ""){
                    this.$emit('startSurvey', "")
                }else{
                    
                            this.$emit('startSurvey', this.probandCode)
                        
                }
            }
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
		top:20px;
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