<template>
    <div style="width:85%; margin: auto">
        <div>
            Anzahl User: {{users.length}}<br>
            Neuen User anlegen:<br>
            Vorname:<input type="text" id="newUserfirstName" name="newUserfirstName" v-model="newUser.firstName"><br>
            Nachname:<input type="text" id="newUserlastName" name="newUserlastName" v-model="newUser.lastName"><br>
            Benutzername:<input type="text" id="newUserusername" name="newUserusername" v-model="newUser.username"><br>
            Password:<input type="password" id="newUserpassword" name="newUserpassword" v-model="newUser.password"><br>
            Password Bestätigung:<input type="password" id="newUserpassword_confirmation" name="newUserpassword_confirmation" v-model="newUser.password_confirmation"><br>
            <button @click="register()" class="saveButton">
                Hinzufügen
            </button>
        </div>    
        <div class="user-box" v-for="(user,index) in users" v-bind:key="index">
            <div class="user-header"  @click="toggleCollapse(user)">
                <div class="user-header-text">  
                    {{user.username}}
                </div>
                <button @click="deleteUser(user)" class="deleteButton">
                    Löschen
                </button>
            </div>
            <div class="user-collapse" v-show="showUser.includes(user._id)">
                Vorname: {{user.firstName}}<br>
                Nachname: {{user.lastName}}<br>
                Benutzername: {{user.username}}<br>
                <hr>
                Altes Passwort<input type="text" id="oldPassword" name="oldPassword" v-model="user.oldPassword"><br>
                Neues Passwort<input type="text" id="newPassword" name="newPassword" v-model="user.newPassword"><br>
                Neues Passwort Bestätigung<input type="text" id="newPassword_confirmation" name="newPassword_confirmation" v-model="user.newPassword_confirmation"><br>
                <button @click="changePassword(user)" class="saveButton">
                    Bestätigen
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    data: function(){	
        return{
            //all the users
            users: [],
            //which users to show
            showUser: [],
            //data for a new user
            newUser: {}
        }
    },
    methods:{
        //toggles the collapsible element
        toggleCollapse: function(meas){
            if(this.showUser.includes(meas._id)){
                this.showUser.splice(this.showUser.indexOf(meas._id),1)
            }else{
                this.showUser.push(meas._id)
            }
        },
        //Load user data from server
        loadData: function(){
            axios.get('https://'+axios.defaults.baseURL+'/api/users/getAll').then(response => {
                var tmp=[]
                for(var i=0; i<response.data.users.length; i++){
                    tmp.push(response.data.users[i])
                }
                this.users = tmp
            }).catch(error => console.log(error))
        },
        //change a users password
        changePassword: function(user){
            axios({url: 'https://'+axios.defaults.baseURL+'/api/users/changePassword', data: {"username": user.username, "oldPassword": user.oldPassword, "newPassword": user.newPassword,
            "newPassword_confirmation": user.newPassword_confirmation}, method: 'POST' }).then(() => {
                this.loadData()
            }).catch(err => console.log(err))
        },
        //register a new user
        register: function(){
            axios({url: 'https://'+axios.defaults.baseURL+'/api/register', data: {"username": this.newUser.username, "firstName": this.newUser.firstName, "lastName": this.newUser.lastName,
            "password": this.newUser.password, "password_confirmation": this.newUser.password_confirmation}, method: 'POST' }).then(() => {
                this.loadData()
            }).catch(err => console.log(err))
        },
        //delete an user
        deleteUser: function(user){
            axios({url: 'https://'+axios.defaults.baseURL+'/api/users/delete', data: {"_id": user._id}, method: 'POST'}).then(() => {
                this.loadData()
            }).catch(err => console.log(err))
        },
    },
    //Load data on creating of page
    mounted: function(){
        this.loadData()
    }
}
</script>

<style scoped>
    .user-box{
        margin-top: 2px;
        margin-bottom: 2px;
        padding-right: 2px;
        float: left;
        width:100%;
    }

    .user-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .user-header-text{
        padding-top:3px;
        padding-left:15px;
        text-overflow: clip;
        overflow: hidden;
        width:70%;
        float: left;
    }
    
    .deleteButton{
        float:right;
        margin-right:10px;
        padding: 0.2rem 1rem;
        line-height: 1.5;
        background-color: white ;
        border-radius:0.5rem;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
		text-transform: none;
		transition: 0.3s;
        outline:none !important;
        cursor: pointer;
        border: none;
        margin-top:3px;
    }

    .deleteButton:hover{
        background-color: #afafaf;
    }

    .user-collapse{
        border: 1px solid black;
    }
    
    .saveButton:hover{
		color: white;
        background-color: #353535;
    }
</style>