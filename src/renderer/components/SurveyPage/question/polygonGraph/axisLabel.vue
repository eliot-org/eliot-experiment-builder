<template>
        <text class="text" :x="point.x" :y="point.y">{{stat.label.text}}</text>
</template>

<script>
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
    props: {
              stat: Object,
              index: Number,
              total: Number
            },
    computed: {
        point: function() {
            return valueToPoint(
                +this.stat.value + 10,
                this.index,
                this.total
            );
        }
    }
}
</script>

<style scoped>

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