import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchableList } from "../components/SearchableList";
import { useDataManagement } from "../hooks/useDataManagement";
import { TEST_DATA } from "../testData";
import type { DataItem } from "./mockDataGenerator";

vi.mock("../hooks/useDataManagement", () => ({
  useDataManagement: vi.fn(),
}));

const mockLoading = async () => {
  return await new Promise<boolean>((resolve) =>
    setTimeout(() => resolve(false), 1500),
  );
};

const totalPages = Math.ceil(TEST_DATA.length / 10);
const categories = Array.from(new Set(TEST_DATA.map((item) => item.category)));
const getDataItems = (page = 1, alternateResult = TEST_DATA) => {
  const validatedPage = Math.max(page, 1);

  return alternateResult.slice((validatedPage - 1) * 10, validatedPage * 10);
};

const runSearch = ({
  search,
  category,
  sortBy,
  page,
}: {
  search?: string;
  category?: string;
  sortBy?: string;
  page?: number;
}) => {
  let parsedResult = TEST_DATA;

  if (search) {
    parsedResult = parsedResult.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (category) {
    parsedResult = parsedResult.filter((item) => item.category === category);
  }

  if (sortBy) {
    parsedResult = [...parsedResult].sort((a, b) => {
      return a?.[sortBy as keyof DataItem]
        ?.toString()
        .localeCompare(b?.[sortBy as keyof DataItem]?.toString());
    });
  }

  return getDataItems(page || 1, parsedResult);
};

describe("Searchable List Solution", () => {
  beforeEach(async () => {
    vi.mocked(useDataManagement).mockReturnValue({
      items: getDataItems(),
      totalItems: TEST_DATA.length,
      currentPage: 1,
      totalPages,
      isLoading: false,
      categories,
      error: null,
      setSearch: vi.fn(),
      setCategory: vi.fn(),
      setSortBy: vi.fn(),
      nextPage: vi.fn(),
      previousPage: vi.fn(),
      // Add any other properties that the hook should return
    });
  }, 30000);

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders loading state initially", async () => {
    vi.mocked(useDataManagement).mockReturnValueOnce({
      ...vi.mocked(useDataManagement)(),
      isLoading: (await mockLoading()) || true,
    });

    const { getByTestId } = render(<SearchableList />);
    expect(getByTestId("loading-indicator")).toBeDefined();
  });

  it("renders error state when data fetching fails", () => {
    const errorMessage = "Failed to fetch data";
    vi.mocked(useDataManagement).mockReturnValueOnce({
      ...vi.mocked(useDataManagement)(),
      error: errorMessage,
    });

    const { getByText } = render(<SearchableList />);

    expect(getByText(errorMessage)).toBeDefined();
  });

  it("renders items and pagination controls after successful data fetch", async () => {
    vi.mocked(useDataManagement).mockReturnValueOnce({
      ...vi.mocked(useDataManagement)(),
      isLoading: await mockLoading(),
    });

    const { getByTestId, getAllByTestId } = render(<SearchableList />);

    await waitFor(() => {
      expect(getByTestId("search-input")).toBeDefined();
      expect(getByTestId("category-select")).toBeDefined();
      expect(getByTestId("sort-select")).toBeDefined();
      expect(getByTestId("pagination-controls")).toBeDefined();
      expect(getAllByTestId("list-item").length).toBe(10);
    });
  });

  it("filters items based on search input with debounce", async () => {
    const search = "Plastic";
    const searchResults = runSearch({ search });

    vi.mocked(useDataManagement).mockReturnValue({
      ...vi.mocked(useDataManagement)(),
      search,
      items: searchResults,
    });

    vi.useFakeTimers();
    const { getByTestId, getAllByTestId } = render(<SearchableList />);

    const searchInput = getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: search } });

    act(() => {
      vi.advanceTimersByTime(50); // Assuming 50ms debounce
    });

    // The data should not have loaded yet
    expect(getAllByTestId("list-item").length).toBe(10);

    act(() => {
      vi.advanceTimersByTime(250); // Assuming 300ms debounce
    });

    // Data should have loaded after 300ms
    expect(getAllByTestId("list-item").length).toBe(searchResults.length);

    vi.useRealTimers();
  });

  it("filters items by category", () => {
    const setCategoryMock = vi.fn();
    vi.mocked(useDataManagement).mockReturnValue({
      ...vi.mocked(useDataManagement)(),
      setCategory: setCategoryMock,
    });

    const { getByTestId } = render(<SearchableList />);

    const categorySelect = getByTestId("category-select");
    fireEvent.change(categorySelect, { target: { value: "Electronics" } });

    expect(setCategoryMock).toHaveBeenCalledWith("Electronics");
  });

  it("changes to next page when next-btn pagination control is used", async () => {
    let currentPage = 1;
    const nextPageMock = vi.fn(() => {
      currentPage++;
      vi.mocked(useDataManagement).mockReturnValue({
        ...vi.mocked(useDataManagement)(),
        items: getDataItems(currentPage),
        currentPage: currentPage,
      });
    });

    vi.mocked(useDataManagement).mockReturnValue({
      ...vi.mocked(useDataManagement)(),
      items: getDataItems(currentPage),
      currentPage: currentPage,
      nextPage: nextPageMock,
    });

    const { getByTestId, getAllByTestId, rerender } = render(
      <SearchableList />,
    );

    const nextPageButton = getByTestId("next-page-button");

    /* Ensure that the data does move to the next page */
    await act(async () => {
      fireEvent.click(nextPageButton);
      fireEvent.click(nextPageButton);
    });

    // Rerender component to take page change
    rerender(<SearchableList />);

    // Expect next button to have bee called twice
    expect(nextPageMock).toHaveBeenCalledTimes(2);
    const nextPageItems = getDataItems(3);

    // Check length
    expect(getAllByTestId("list-item").length).toBe(nextPageItems.length);

    // Get a random index between 0 - 9
    const nextPageRandomIndex = Math.floor(
      +Math.random().toFixed(2) * (nextPageItems.length - 1),
    );

    // Check random data
    expect(
      getAllByTestId("list-item")[nextPageRandomIndex].querySelector(
        "[data-test-id='list-item-name']",
      )?.textContent,
    ).toEqual(nextPageItems[nextPageRandomIndex].name);
  });

  it("does not change when the current page is 1 when prev-btn controls are used", async () => {
    let currentPage = 1;

    const prevPageMock = vi.fn(() => {
      currentPage = Math.max(currentPage - 1, 1);
      vi.mocked(useDataManagement).mockReturnValue({
        ...vi.mocked(useDataManagement)(),
        items: getDataItems(currentPage),
        currentPage: currentPage,
      });
    });

    vi.mocked(useDataManagement).mockReturnValue({
      ...vi.mocked(useDataManagement)(),
      items: getDataItems(currentPage),
      currentPage: currentPage,
      previousPage: prevPageMock,
    });

    const { getByTestId, getAllByTestId, rerender } = render(
      <SearchableList />,
    );

    const prevPageButton = getByTestId("previous-page-button");

    /* Ensure that the data does move since current page is 1 */
    await act(async () => {
      fireEvent.click(prevPageButton);
      fireEvent.click(prevPageButton);
    });

    // Rerender component to take page change
    rerender(<SearchableList />);

    // Expect prev button to have been called twice
    expect(prevPageMock).toHaveBeenCalledTimes(2);
    const prevPageItems = getDataItems();

    // Check length
    expect(getAllByTestId("list-item").length).toBe(prevPageItems.length);

    // Get a random index between 0 - 9
    const prevPageRandomIndex = Math.floor(
      +Math.random().toFixed(2) * (prevPageItems.length - 1),
    );

    // Check random data
    expect(
      getAllByTestId("list-item")[prevPageRandomIndex].querySelector(
        "[data-test-id='list-item-name']",
      )?.textContent,
    ).toEqual(prevPageItems[prevPageRandomIndex].name);
  });

  it("sorts items when sort option is changed", async () => {
    const sortBy = "category";
    const currentPage = 1;

    const setSortByMock = vi.fn(() => {
      vi.mocked(useDataManagement).mockReturnValue({
        ...vi.mocked(useDataManagement)(),
        items: runSearch({ sortBy, page: currentPage }),
      });
    });

    vi.mocked(useDataManagement).mockReturnValue({
      ...vi.mocked(useDataManagement)(),
      items: getDataItems(),
      setSortBy: setSortByMock,
    });

    const { getAllByTestId, rerender } = render(<SearchableList />);

    const sortSelect = screen.getByTestId("sort-select");

    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: "name" } });
    });

    rerender(<SearchableList />);

    expect(setSortByMock).toHaveBeenCalledWith("name");
    const sortData = runSearch({ sortBy, page: currentPage });

    // Check length
    expect(getAllByTestId("list-item").length).toBe(sortData.length);

    // Get a random index between 0 - 9
    const randomIndex = Math.floor(
      +Math.random().toFixed(2) * (sortData.length - 1),
    );

    // Check random data
    expect(
      getAllByTestId("list-item")[randomIndex].querySelector(
        "[data-test-id='list-item-name']",
      )?.textContent,
    ).toEqual(sortData[randomIndex].name);
  });

  it("can search, sort and filter", async () => {
    const sortBy = "date";
    const search = "plastic";
    const category = "Games";

    const currentPage = 1;

    const setMock = vi.fn(() => {
      vi.mocked(useDataManagement).mockReturnValue({
        ...vi.mocked(useDataManagement)(),
        items: runSearch({ sortBy, search, category, page: currentPage }),
      });
    });

    vi.mocked(useDataManagement).mockReturnValue({
      ...vi.mocked(useDataManagement)(),
      items: getDataItems(),
      setSortBy: setMock,
      setCategory: setMock,
      setSearch: setMock,
    });

    const { getAllByTestId, rerender, getByTestId } = render(
      <SearchableList />,
    );

    const sortSelect = screen.getByTestId("sort-select");
    const categorySelect = getByTestId("category-select");
    const searchInput = getByTestId("search-input");

    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: sortBy } });
      fireEvent.change(categorySelect, { target: { value: category } });
      fireEvent.change(searchInput, { target: { value: search } });
    });

    rerender(<SearchableList />);

    expect(setMock).toHaveBeenCalledTimes(3);
    const data = runSearch({ sortBy, search, category, page: currentPage });

    // Check length
    expect(getAllByTestId("list-item").length).toBe(data.length);
  });
});
