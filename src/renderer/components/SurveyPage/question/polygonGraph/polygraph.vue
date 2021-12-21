<template>
        <g>
            <polygon class="polygon" :points="points" v-if="stats.length>2"></polygon>
            <circle class="polygon" cx="150" cy="150" :r="150-(singlePoint().y)" v-if="stats.length==1"></circle>
            <circle class="circle" cx="150" cy="150" r="125"></circle>
            <axis-label v-for="(stat, index) in stats" v-bind:key="index" :stat="stat" :index="index" :total="stats.length"></axis-label>
        </g>
        
</template>

<script>
import axisLabel from './axisLabel'

function valueToPoint (value, index, total) {
  var x     = 0
  var y     = -value * 1.25
  var angle = Math.PI * 2 / total * index
  var cos   = Math.cos(angle)
  var sin   = Math.sin(angle)
  var tx    = x * cos - y * sin + 150
  var ty    = x * sin + y * cos + 150
  return {
    x: tx,
    y: ty
  }
}

export default {
    props: ['stats'],
    replace: true,
    computed: {
        points: function () {
            var total = this.stats.length
            return this.stats.map(function (stat, i) {
                var point = valueToPoint(stat.value, i, total)
                return point.x + ',' + point.y
            }).join(' ')
        }
    },
    components: {axisLabel},
    methods:{
        singlePoint: function(){
            return valueToPoint(
                this.stats[0].value,
                0,
                1
            );
        }
    }
}
</script>

<style scoped>
     .polygon {
        fill: #42b983;
        opacity: 0.75;
    }

    .circle {
        fill: transparent;
        stroke: #999;
    }

    .text {
        font-family: Helvetica Neue, Arial, sans-serif;
        font-size: 10px;
        fill: #666;
    }

    .label {
        display: inline-block;
        margin-left: 10px;
        width: 20px;
    }
</style>