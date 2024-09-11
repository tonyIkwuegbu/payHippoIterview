import { TEST_DATA } from "../testData";

export const generateMockData = async (count = 1000): Promise<DataItem[]> => {
  const responseTime = Math.random() * 12000;
  const actualCount = Math.min(count, 1000);

  // Simulate network delay
  await new Promise((resolve, reject) =>
    setTimeout(count === 0 ? reject : resolve, Math.max(1000, responseTime)),
  );

  return TEST_DATA.slice(0, actualCount);
};

export type DataItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  dateAdded: string;
};
