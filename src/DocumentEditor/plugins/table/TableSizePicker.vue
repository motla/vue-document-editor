<template>
  <div class="vde-table-grid" @mousedown.prevent>
    <div class="vde-table-grid-cells" @mouseleave="hoverRow = 0; hoverCol = 0">
      <div v-for="row in 10" :key="row" class="vde-table-grid-row">
        <span v-for="col in 10" :key="col"
          class="vde-table-grid-cell"
          :class="{ 'vde-table-grid-active': row <= hoverRow && col <= hoverCol }"
          @mouseenter="hoverRow = row; hoverCol = col"
          @click="select(row, col)" />
      </div>
    </div>
    <div class="vde-table-grid-label">
      {{ hoverRow && hoverCol ? hoverRow + ' \u00d7 ' + hoverCol : 'Inserir tabela' }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ item: Object })

const hoverRow = ref(0)
const hoverCol = ref(0)

function select(rows, cols) {
  if (props.item && props.item.onSelect) props.item.onSelect(rows, cols)
}
</script>

<style>
.vde-table-grid {
  padding: 8px;
}
.vde-table-grid-cells {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vde-table-grid-row {
  display: flex;
  gap: 2px;
}
.vde-table-grid-cell {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.05s;
}
.vde-table-grid-cell:hover,
.vde-table-grid-active {
  background-color: #1a73e8;
  border-color: #1a73e8;
}
.vde-table-grid-label {
  text-align: center;
  margin-top: 6px;
  font-size: 12px;
  color: #555;
  min-height: 16px;
}
</style>
