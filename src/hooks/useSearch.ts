/**
 * Custom hook for search and filter logic
 */

import { useState, useMemo } from "react";

export const useSearch = <T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[]
) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(term);
      })
    );
  }, [items, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
  };
};

export const useFilter = <T extends Record<string, any>>(
  items: T[],
  filterFn: (item: T) => boolean
) => {
  return useMemo(() => items.filter(filterFn), [items, filterFn]);
};
