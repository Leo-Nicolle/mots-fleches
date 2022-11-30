<template>
    <div class="grid" :style="getTemapleColumn()">
      <div  class="row" v-for="(row, i) in grid.cells" :key="i">
        <div class="cell" v-for="(cell, j) in row" :key="j">
        <span class="text">{{
          cell.text
        }}</span>
        <button></button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Grid, Cell } from "../js/types";

const cellWidth = ref(`${52}px`);
const buttonWidth = ref(`${15}px`);


const grid: Grid = {
  rows: 10,
  cols: 10,
  cells: new Array(10).fill(0).map((_, y) =>
    new Array(10).fill(0).map((_, x) => ({
      x,
      y,
      definition: false,
      text: "A",
    }))
  ),
};
console.log(grid);
// @click="onSelectCell(item.i, item.j)"
//           @switch="onSwitch($event, item.i, item.j)"
//           @type="onType($event, item.i, item.j)"
//           :value="item.value"
//           :isDefinition="isDefinition[item.i][item.j]"
//           :isImpossible="isImpossible(item.i, item.j)"
//           :highlighted="isHighlighted(item.i, item.j)"

const isDefinition: boolean[][] = [];
const flatCells: { i: number; j: number; key: string; value: string }[] = [];
function getTemapleColumn() {
  return "";
}
function getClass(key: string) {
  return "";
}
function onSelectCell(i: number, j: number) {}
function onType(e: KeyboardEvent, i: number, j: number) {}
function isImpossible(i: number, j: number): boolean {
  return false;
}
function isHighlighted(i: number, j: number): boolean {
  return false;
}
const rgrid = ref(grid)
</script>

<style scoped>
.row{
  display: flex;
  flex-direction: row;
}
.grid{
  display: flex;
  flex-direction: column;
}
.cell{
  width: v-bind(cellWidth);
  height: v-bind(cellWidth);
  border: 1px solid black;
  cursor: text;
}
.cell > span{
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
}
.cell > button {
  position: relative;
  cursor: pointer;
  min-width: v-bind(buttonWidth);
  min-height: v-bind(buttonWidth);
  max-width: v-bind(buttonWidth);
  max-height: v-bind(buttonWidth);
  border-radius: 50%;
  padding: 0;
  transform: translate(calc(v-bind(cellWidth) - v-bind(buttonWidth)* 0.75), calc(v-bind(buttonWidth) * -0.75));
}
.cell:hover{
background: #eee;
}
</style>