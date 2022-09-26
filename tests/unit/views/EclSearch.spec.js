import { render, fireEvent, within } from "@testing-library/vue";
import ExpressionConstraintsSearch from "@/views/EclSearch.vue";
import { flushPromises } from "@vue/test-utils";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import testData from "./EclSearch.testData";
import { Services } from "im-library";
import { expect, it } from "vitest";
import { data } from "../../../src/mocks/factory";
import VueClipboard from "vue3-clipboard";
import Tooltip from "primevue/tooltip";
const { SetService } = Services;

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch
  })
}));

const mockDispatch = vi.fn();

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

describe("EclSearch.vue", async () => {
  let component;
  let mockECLSearch;
  let docSpy;
  let windowSpy;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockECLSearch = vi.spyOn(SetService.prototype, "ECLSearch").mockResolvedValue(testData.SEARCH_RESULTS);

    component = render(ExpressionConstraintsSearch, {
      global: {
        components: { Textarea, Button },
        directives: {
          tooltip: Tooltip
        },
        stubs: { SearchResults: true, Builder: true },
        plugins: [
          app =>
            VueClipboard(app, {
              autoSetContainer: true,
              appendToBody: true
            })
        ]
      }
    });

    await flushPromises();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    component.getByText("ECL expression:");
  });

  it("searches", async () => {
    const textbox = component.getByTestId("query-string");
    await fireEvent.update(textbox, "<< 10363601000001109 |UK product|");
    component.getByDisplayValue("<< 10363601000001109 |UK product|");
    const search = component.getByTestId("search-button");
    await fireEvent.click(search);
    await flushPromises();
    expect(mockECLSearch).toHaveBeenCalledTimes(1);
  });

  it("opens builder overlay", async () => {
    const button = component.getByTestId("builder-button");
    await fireEvent.click(button);
    component.getByTestId("builder-visible-true");
  });

  it("handles >1000 results", async () => {
    const largeSearchResults = [];
    for (let i = 1; i <= 1100; i++) {
      largeSearchResults.push(data.conceptSummary.create());
    }
    mockECLSearch.mockResolvedValue({ page: 1, count: largeSearchResults.length, entities: largeSearchResults });
    const textbox = component.getByTestId("query-string");
    await fireEvent.update(textbox, "<< 10363601000001109 |UK product|");
    component.getByDisplayValue("<< 10363601000001109 |UK product|");
    const search = component.getByTestId("search-button");
    await fireEvent.click(search);
    await flushPromises();
    component.getByText("1100 results found. Display limited to first 1000.");
  });

  it("toasts on copy", async () => {
    const textbox = component.getByTestId("query-string");
    await fireEvent.update(textbox, "<< 10363601000001109 |UK product|");
    component.getByDisplayValue("<< 10363601000001109 |UK product|");
    const button = component.getByTestId("copy-to-clipboard-button");
    await fireEvent.click(button);
    await flushPromises();
    expect(mockAdd).toHaveBeenCalledOnce();
  });
});
