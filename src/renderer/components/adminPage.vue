<template>
    <div class="wrapper-admin">
        <div class="navbar">
            <div class="navbar-width-locker">
                <div class="logo-wrapper">
                    <img class="logo" src="~@/assets/eliot.png" alt="ELIOT Logo">
                </div>
                <div class="nav-link-wrapper">
                    <router-link :to="{ name: 'survey'}" class="nav-element">Survey</router-link>
                    <router-link :to="{ name: 'subjects'}" class="nav-element">Subjects</router-link>
                    <router-link :to="{ name: 'objects'}" class="nav-element">Objects</router-link>
                    <router-link :to="{ name: 'measurements'}" class="nav-element">Measurements</router-link>
                    <router-link :to="{ name: 'hardware'}" class="nav-element">Hardware</router-link>
                    <router-link :to="{ name: 'config'}" class="nav-element">Settings</router-link>
                </div>
            </div>
        </div>
        
        <router-view></router-view>      
    </div>
</template>

<script>
    export default {}
</script>

<style src="./AdminPage/adminPage.css"></style>
<style scoped>
</style>