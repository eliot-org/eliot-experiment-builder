<template>
    <div class="explWrapper" v-html="content.html" :style="content.style">
       
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
			}
        },
		methods:{
            
        },
        mounted(){
        }
    }    
</script>

<style scoped>
.explWrapper{
    width: 100vw;
    position: absolute;
    bottom:0px;
    overflow-y: auto;
    overflow-x: hidden;
}
</style>