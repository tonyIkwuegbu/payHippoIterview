import "@testing-library/jest-dom";
// import matchers from "@testing-library/jest-dom/matchers";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

// expect.extend(matchers);

// Mock React hooks
vi.mock("react", async () => {
	const actual = await vi.importActual("react");
	return {
		...actual,
		// useState: vi.fn(),
		// useEffect: vi.fn(),
		// useContext: vi.fn(),
	};
});

configure({
	testIdAttribute: "data-test-id",
	asyncUtilTimeout: 60000,
	testTimeout: 60000,
});

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup();
});
