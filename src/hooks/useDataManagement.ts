import * as React from "react";
import { type DataItem, generateMockData } from "../tests/mockDataGenerator";

// This is the expected return type for the useDataManagement hook
export type DataManagementResult = {
	items: DataItem[];
	totalItems: number;
	totalPages: number;
	isLoading: boolean;
	error: string | null;
	categories: string[];
	search?: string;
	currentPage: number;
	category?: string;
	sortBy?: string;
	nextPage: () => void;
	previousPage: () => void;
	setSearch: (q: string) => void;
	setCategory: (cat: string) => void;
	setSortBy: (srt: string) => void;
};

export function useDataManagement(): DataManagementResult {
	// Implement your solution here
	const [items, setItems] = React.useState<DataItem[]>([]);
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [currentPage, setCurrentPage] = React.useState<number>(1);
	const [totalPages, setTotalPages] = React.useState<number>(100);
	const [search, setSearch] = React.useState<string>("");

	//const ITEMS_PER_PAGE = 100

	const getData = async () => {
		setIsLoading(true);
		try {
			const response = await generateMockData();
			setItems(response);
			//setTotalPages(Math.ceil(response / ITEMS_PER_PAGE));

			console.log("mockdata", response);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		getData();
	}, [getData]);

	return {
		isLoading: false,
		items: [],
		currentPage: 1,
		totalPages: 10,
		search: "",
		totalItems: 100,
		error: null,
		categories: [],

		// Return an object with the necessary properties as described in the DataManagementResult type
	};
}
