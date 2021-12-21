<template>
    <div class="wrapper" style="height: unset">
        <div class="login">
            <h1> Anmelden </h1>
            <form @submit.prevent="login">
                <label for="username">
                    <i class="fas fa-user"></i>
                </label>
                <input v-model="username" type="username" name="username" placeholder="Benutzername" id="username" required>
                <label for="password">
                    <i class="fas fa-lock"></i>
                </label>
                <input v-model="password" type="password" name="password" placeholder="Passwort" id="password" required>
                
                <v-select style="width:90%" label="label" :options="serverOptions" v-model="serverChoice" @input="setServerChoice"></v-select>

                <span class="error">{{err}}</span>
                <input type="submit" value="Anmelden">
            </form>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    export default {
        data(){
            return {
                username : "",  //Username
                password : "",  //Password
                serverOptions: [{"label":"BoM", "address": "survey.brainofmaterials.com"},{"label":"Kassel", "address":"ifw-humansensorik.de"}],//The options to which server to connect
                serverChoice: {"label":"Kassel", "address": "ifw-humansensorik.de"} //The chosen Server
            }
        },
        methods: {
            /**
             * Calls the setServer
             * Tries to log the user in and on success routes to adminSurvey
             */
            login: function () {
                let username = this.username 
                let password = this.password
                this.setServerChoice()
                this.$store.dispatch('login', { "username":username, "password":password}).then(() => {
                    if (this.$router.currentRoute.name != '/survey') {this.$router.push('/survey')}}).catch(err => console.log(err))
            },
            //Updates the Default Axios URL to the chosen one
            setServerChoice: function(){
                axios.defaults.baseURL = this.serverChoice.address
            }
        },
        computed: {
            //Shows the error if there is while trying to login
            err(){
                if( this.$store.state.auth.status == "error"){
                    return "Fehler"
                }
                return ""
            }
        }
    }
</script>

<style scoped>
    .error{
        color: red;
    }

    .login {
        width: 400px;
        background-color: #ffffff;
        box-shadow: 0 0 9px 0 rgba(0, 0, 0, 0.3);
        margin: 100px auto;
    }
    .login h1 {
        text-align: center;
        color: #5b6574;
        font-size: 24px;
        padding: 20px 0 20px 0;
        border-bottom: 1px solid #dee0e4;
    }
    .login form {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding-top: 20px;
    }
    .login form label {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        background-color: #000;
        color: #ffffff;
    }
    .login form input[type="password"], .login form input[type="username"] {
        width: 310px;
        height: 50px;
        border: 1px solid #dee0e4;
        margin-bottom: 20px;
        padding: 0 15px;
    }
    .login form input[type="submit"] {
        width: 100%;
        padding: 15px;
        margin-top: 20px;
        background-color: #000;
        border: 0;
        cursor: pointer;
        font-weight: bold;
        color: #ffffff;
        transition: background-color 0.2s;
        font-weight: 400;  
    }
    .login form input[type="submit"]:hover {
        background-color: #353535;
        transition: background-color 0.2s;
    }
  .wrapper{
        height: 100vh;
        width: 100vw;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: row;
	}

    .login-form-wrapper{
        display: flex;
        justify-content: center;
        vertical-align: middle;
    }
</style>