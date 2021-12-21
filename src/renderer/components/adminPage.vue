<template>
    <div class="wrapper-admin">
        <div class="navbar">
            <div class="navbar-width-locker">
                <div class="logo-wrapper">
                    <img class="logo" src="~@/assets/eliot.png" alt="ELIOT Logo">
                </div>
                <div class="nav-link-wrapper">
                    <router-link :to="{ name: 'AdminSurvey'}" class="nav-element">Umfrage</router-link>
                    <router-link :to="{ name: 'expirementeesEdit'}" class="nav-element">Probanden</router-link>
                    <router-link :to="{ name: 'materialsEdit'}" class="nav-element">Materialien</router-link>
                    <router-link :to="{ name: 'measurements'}" class="nav-element">Messungen</router-link>
                    <router-link :to="{ name: 'hardware'}" class="nav-element">Hardware</router-link>
                </div>
            </div>
        </div>
        
        <router-view></router-view>      
        
    </div>
</template>

<script>
    export default {
        methods: {}
    }
</script>

<style src="./AdminPage/adminPage.css"></style>
<style scoped>

</style>