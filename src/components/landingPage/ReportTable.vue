<template>
  <div :id="id" class="dashcard-container report-table">
    <Card class="dashcard dash-table">
      <template #title>
        <span v-if="name">{{ name }}</span>
      </template>
      <template #subtitle>
        <span v-if="description">{{ description }}</span>
      </template>
      <template #content>
        <div class="p-d-flex p-flex-row p-jc-center p-ai-center loading-container" v-if="loading">
          <ProgressSpinner />
        </div>
        <DataTable v-else-if="isCorrectInputData" :value="tableData" class="p-datatable-sm" :scrollable="true" scrollHeight="350px">
          <template #header>
            Ontology data
          </template>
          <Column field="label" header="Label"></Column>
          <Column field="count" header="Total"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Helpers, Vocabulary } from "im-library";
const { RDFS, IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;

export default defineComponent({
  name: "ReportTable",
  props: {
    name: { type: String, required: false },
    description: { type: String, required: false },
    inputData: { type: Array as PropType<Array<any>>, required: true },
    id: { type: String, required: true }
  },
  computed: {
    isCorrectInputData(): boolean {
      return this.inputData.every(item => {
        return !!(isObjectHasKeys(item, [RDFS.LABEL, IM.HAS_VALUE]) || isObjectHasKeys(item, ["count", "label"]));
      });
    }
  },
  data() {
    return {
      tableData: [] as { count: number; label: string }[],
      loading: false
    };
  },
  mounted() {
    this.getReportTableData();
  },
  methods: {
    getReportTableData(): void {
      if (!this.isCorrectInputData) return;
      this.loading = true;
      for (const entry of this.inputData) {
        if (isObjectHasKeys(entry, [RDFS.LABEL, IM.HAS_VALUE])) {
          this.tableData.push({
            label: entry[RDFS.LABEL],
            count: +entry[IM.HAS_VALUE]
          });
        }
        if (isObjectHasKeys(entry, ["label", "count"])) {
          this.tableData.push({
            label: entry.label,
            count: +entry.count
          });
        }
      }
      this.loading = false;
    }
  }
});
</script>

<style scoped>
.dashcard-container {
  height: fit-content;
  width: 50%;
}
.dashcard {
  width: 100%;
  box-shadow: none;
  border-radius: none;
}
.loading-container {
  width: 100%;
}
</style>
