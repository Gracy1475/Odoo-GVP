/**
 * Custom hook for table sorting logic
 */

import { useState, useMemo } from "react";

export type SortOrder = "asc" | "desc" | null;

export const useSort = <T extends Record<string, any>>(items: T[]) => {
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const sortedItems = useMemo(() => {
    if (!sortBy || !sortOrder) return items;

    return [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === "asc" ? 1 : -1;
      if (bVal == null) return sortOrder === "asc" ? -1 : 1;

      // String comparison
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      // Numeric comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [items, sortBy, sortOrder]);

  const toggleSort = (column: keyof T) => {
    if (sortBy === column) {
      // Cycle: asc -> desc -> null
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortBy(null);
        setSortOrder(null);
      }
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return {
    sortedItems,
    sortBy,
    sortOrder,
    toggleSort,
  };
};
