<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Constraint</span>
      <Dropdown v-model="selected" :options="options" optionLabel="name" placeholder="Select constraint">
        <template #value="slotProps">
          <span>{{ slotProps.value.name }}</span>
        </template>
        <template #option="slotProps">
          <span> {{ slotProps.option.symbol }} {{ slotProps.option.name }} </span>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;

export default defineComponent({
  name: "Constraint",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: { type: Object as () => { name: string; symbol: string }, required: false },
    showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
  },
  emits: { updateClicked: (_payload: ECLComponentDetails) => true },
  watch: {
    selected() {
      this.onConfirm();
    }
  },
  mounted() {
    if (this.value && isObjectHasKeys(this.value, ["name", "symbol"])) {
      this.selected = this.value;
    } else {
      this.selected = this.options[0];
    }
  },
  data() {
    return {
      options: [
        { name: "Descendant or self of", symbol: "<<" },
        { name: "Descendant of", symbol: "<" },
        { name: "Self", symbol: "" },
        { name: "Child of", symbol: "<!" },
        { name: "Child or self of", symbol: "<<!" },
        { name: "Ancestor of", symbol: ">" },
        { name: "Ancestor or self of", symbol: ">>" },
        { name: "Parent of", symbol: ">!" },
        { name: "Parent or self of", symbol: ">>!" },
        { name: "Member of", symbol: "^" }
      ] as { name: string; symbol: string }[],
      selected: {} as { name: string; symbol: string }
    };
  },
  methods: {
    onConfirm(): void {
      this.$emit("updateClicked", this.createConstraint());
    },

    createConstraint(): ECLComponentDetails {
      return {
        id: this.id,
        value: this.selected,
        position: this.position,
        type: ECLComponent.CONSTRAINT,
        queryString: this.selected.symbol,
        showButtons: this.showButtons
      };
    }
  }
});
</script>

<style scoped>
.query-item-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #ffc952;
  border-radius: 3px;
  gap: 1rem;
}

.label-container {
  flex: 1 1 auto;
  padding: 1rem;
  position: relative;
}

.p-dropdown {
  width: 100%;
  min-width: 15rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
