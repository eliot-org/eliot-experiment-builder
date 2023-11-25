<template>
    <div class="admin-measurements-wrapper">
        <div class="measurements-overview-wrapper"> 
        <a id="downloadAnchorElem" style="display:none"></a>
            <a id="downloadAnchorElem" style="display:none"></a>
            Number of Measurements: {{measurements.length}} <button class="saveButton" @click="downloadAll()">Download</button><br><hr>
            <div class="measurements-box" v-for="(meas ,index) in measurements" v-bind:key="index">
                <div class="measurements-header" @click="toggleCollapse(meas)">
                    <div class="measurements-header-text">  
                        {{meas._id}}
                        <button @click="deleteSubject(meas._id)" class="deleteButton">
                            Delete
                        </button>
                        <button @click="download(meas)" class="deleteButton">
                            Download JSON
                        </button>
                        <button @click="downloadCSV(meas)" class="deleteButton">
                            Download CSV
                        </button>
                    </div>
                </div>
                <div class="measurements-collapse" v-show="showMeasurement.includes(meas._id)">
                    <vue-json-pretty :path="'res'" :data="meas"> </vue-json-pretty>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { json2csv } from 'json-2-csv';
    export default {
        data: function( ){
            return{
                measurements: [],
                showMeasurement:[],
                csvOptions: {
                    emptyFieldValue: "",
                    expandNestedObjects: true,
                    expandArrayObjects: true,
                    prependHeader: true,
                }
            }
        },
        methods:{
            toggleCollapse: function(meas){
                if(this.showMeasurement.includes(meas._id)){
                    this.showMeasurement.splice(this.showMeasurement.indexOf(meas._id),1)
                }else{
                    this.showMeasurement.push(meas._id)
                }
            },
            download: function(toExport){
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toExport));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "measurement_"+ toExport._id +".json");
                dlAnchorElem.click();
            },
            downloadCSV: function(toExport){
                let answers = toExport.answers
                delete toExport.answers
                const csv = json2csv(answers, this.csvOptions);
                console.log(csv)

                var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "measurement_answers_"+ toExport._id +".csv");
                dlAnchorElem.click();

                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(toExport);
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "measurement_data_"+ toExport._id +".json");
                dlAnchorElem.click();
            },
            downloadAll: function(){
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({"array":this.measurements}));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "measurements.json");
                dlAnchorElem.click();
            },
            deleteMeasurement: function(id){
                for(let i = 0; i < this.measurements.length; i++){
                    if(this.measurements[i]._id === id){
                        this.measurements.splice(i,1)
                        this.$electron.ipcRenderer.invoke("setStoreValue", "objects", this.measurements) 
                    }
                }
            },
            loadData: async function(){
                this.measurements = await this.$electron.ipcRenderer.invoke("getStoreValue", "measurements") 
                console.log(this.measurements)
            },
            getAnswerData: function(answerRaw){
                if(answerRaw.questionType ==  "polygonGraph" || answerRaw.questionType == "slider"){
                    return answerRaw.answer
                }else if(answerRaw.questionType == "matrix"){
                    return (answerRaw.answer[0] + answerRaw.answer[1])/2
                }else if(answerRaw.questionType == "matrix_circle"){
                    return (answerRaw.answer[0] + answerRaw.answer[1] + answerRaw.answer[2])/3
                }
                return 0
            },
        },
        mounted: function(){
            this.loadData()
        }
    }
</script>

<style scoped>
.deleteButton{
        float:right;
        margin-right:10px;
        padding: 0.2rem 1rem;
        line-height: 1.5;
        background-color: white ;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
		text-transform: none;
		transition: 0.3s;
        outline:none !important;
        cursor: pointer;
        border: none;
    }

    .deleteButton:hover{
        background-color: #afafaf;
    }
    .admin-measurements-wrapper{
        width:100%;
    }

    .measurements-overview-wrapper{
        width:85%;
        margin:0 auto;
    }
    
    .measurements-box{
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .measurements-header{
        color:white;
        background: #000000;
        height:32px;
    }

    .measurements-header-text{
        padding-top:3px;
        padding-left:15px;
    }

    .measurements-table{
        width:100%;
    }

    .measurements-collapse{
        border: 1px solid black;
    }

    .measurements-table,th, td{
        border-collapse: collapse;
        padding: 3px;
    }
    th{
        text-align: left;
        font-weight: 500;
    }

    .saveButton{
        margin:10px;
        padding: 0.2rem 1rem;
        line-height: 1.5;
        background-color: black ;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
		text-transform: none;
		transition: 0.3s;
        outline:none !important;
        cursor: pointer;
        border: none;
		color: white;
    }

    .saveButton:hover{
		color: white;
        background-color: #353535;
    }

    .subject-element{
        height: 22px;
        width:100%;
        margin-left: 10px;
        margin-top: 12px;
        margin-bottom: 12px;
    }
    .subject-element-selector{
        height: 35px;
        width:100%;
    }
    .leftsidetext{
        float: left;
    }
</style>