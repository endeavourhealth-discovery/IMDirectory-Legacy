<template>
  <div class="search-container">
    <InputText id="autocomplete-search" v-model="searchText" placeholder="Search" @keyup.enter="search" />

    <Button id="filter-button" icon="pi pi-sliders-h" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openFiltersOverlay" />
    <OverlayPanel ref="filtersO" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div class="p-fluid results-filter-container">
        <Filters :search="search" />
      </div>
    </OverlayPanel>
  </div>
</template>

<script lang="ts">
import Filters from "@/components/topbar/search/Filters.vue";
import axios from "axios";
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { TTIriRef, Namespace, EntityReferenceNode, SearchRequest } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Models, Helpers } from "im-library";
const { SortBy } = Enums;
const {
  DataTypeCheckers: { isObject },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;

export default defineComponent({
  name: "Search",
  components: { Filters },
  computed: {
    ...mapState(["conceptIri", "filterOptions", "searchResults", "selectedFilters", "authReturnUrl"])
  },
  watch: {
    async searchText() {
      await this.search();
    }
  },
  data() {
    return {
      controller: {} as AbortController,
      searchText: ""
    };
  },
  methods: {
    getFAIconFromType(types: TTIriRef[]) {
      return getFAIconFromType(types);
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    openFiltersOverlay(event: any) {
      (this.$refs.filtersO as any).toggle(event);
    },

    async search(): Promise<void> {
      if (this.searchText) {
        this.$router.push({
          name: "Search"
        });
        this.$store.commit("updateSearchLoading", true);
        const searchRequest = {} as SearchRequest;
        searchRequest.termFilter = this.searchText;
        searchRequest.sortBy = SortBy.Usage;
        searchRequest.page = 1;
        searchRequest.size = 100;
        searchRequest.schemeFilter = this.selectedFilters.schemes.map((scheme: Namespace) => scheme.iri);

        searchRequest.statusFilter = [];
        this.selectedFilters.status.forEach((status: EntityReferenceNode) => {
          searchRequest.statusFilter.push(status["@id"]);
        });

        searchRequest.typeFilter = [];
        this.selectedFilters.types.forEach((type: TTIriRef) => {
          searchRequest.typeFilter.push(type["@id"]);
        });

        if (this.selectedFilters.sortField) {
          searchRequest.sortField = this.selectedFilters.sortField;
          searchRequest.sortDirection = this.selectedFilters.sortDirection;
        }

        if (!isObject(this.controller)) {
          this.controller.abort();
        }
        this.controller = new AbortController();
        await this.$store.dispatch("fetchSearchResults", {
          searchRequest: searchRequest,
          controller: this.controller
        });
        this.$store.commit("updateSearchLoading", false);
      }
    }
  }
});
</script>

<style scoped>
#filter-button {
  height: 2.25rem;
}

.search-container {
  padding: 0 0.2rem;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.2rem;
}

#autocomplete-search {
  font-size: 1rem;
  background: #dee2e6;
  border: none;
  width: 30rem;
  height: 2.25rem;
}

.fa-icon {
  padding-right: 0.25rem;
}
</style>
