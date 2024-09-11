# Coding Challenge: Searchable List

## Description
Your task is to modify `SearchableList` and `useDataManagement` to display (1000 items) a searchable, paginated list of items with **search**, **filter** by category  and **sort** by a data point **(`name`, `category` and `date` in ascending order)** features. This component should demonstrate your skills in state management, performance optimization, async operations, and other advanced React patterns.

### Requirements:

1. Write your solution in the `src/components/SearchableList` and `src/hooks/useDataManagement` files
   - Feel free to create new files as you need to augment your solutions implemented in the files above.
2. Implement pagination leveraging the `useDataManagement` hook
    - The pages should not go beyond the first and last page (i.e. If on page 1, clicking the Previous Page button should do nothing and if the page is on 100, clicking the Next Page button should do nothing).
4. Each item from the data will have `id`, `name`, `description`, `category`, and `dateAdded` properties.
5. As the user types in the search field, the list rendered should adapt accordingly with a 300ms delay. Your search solution should only search the `name` field of the items.
6. Implement sorting functionality (by name, category, or date) in ascending order.
7. Use the custom hook for data fetching, management, filtering, sorting and pagination logic.
    - Implement this solution in the `src/hooks/useDataManagement` file.
8. Implement proper loading and error states for the async data fetching using the provided `data-test-id` values.

**Note:** Your solution should allow a user to search, filter and sort at the same time if all values are present.

### Deliverables:

1. A `SearchableList` component that meets the above requirements.
2. A custom hook `useDataManagement` for data fetching, management, filtering, sorting and pagination.

In other words, your solution should:
   - Modify the search input field to allow the search feature
   - Modify category filter dropdown by adding
      - a list of all the categories present in the total list
      - allow for filtering the data by the chosen category from the options
   - List the items, displaying the item's name, description, category, and formatted date
     - It is expected that your rendering should complement the existing design already present
   - Modify the Pagination controls
      - to show the current page and total number of pages
      - to be able to move back and forth between the different pages
 - Pass the provided test suite

### Evaluation Criteria:

- Code organization and clarity
- Effective use of React hooks and advanced patterns
- Implementation of performance optimizations
- Proper handling of asynchronous operations
- Proper state management for filtering, sorting, and pagination
- Appropriate use of TypeScript
- Design/UI considerations

Good luck!