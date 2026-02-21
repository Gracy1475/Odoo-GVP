/**
 * Custom hook for pagination logic
 */

import { useState, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export const usePagination = <T>(items: T[], initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const paginationState = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    return {
      currentPage: Math.min(currentPage, totalPages || 1),
      itemsPerPage,
      totalItems: items.length,
      totalPages: Math.max(totalPages, 1),
      startIndex,
      endIndex,
    };
  }, [currentPage, itemsPerPage, items.length]);

  const paginatedItems = useMemo(
    () => items.slice(paginationState.startIndex, paginationState.endIndex),
    [items, paginationState.startIndex, paginationState.endIndex]
  );

  const goToPage = (page: number) => {
    const maxPage = Math.ceil(items.length / itemsPerPage) || 1;
    setCurrentPage(Math.max(1, Math.min(page, maxPage)));
  };

  const goToNextPage = () => goToPage(paginationState.currentPage + 1);
  const goToPrevPage = () => goToPage(paginationState.currentPage - 1);

  return {
    ...paginationState,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    canGoNext: paginationState.currentPage < paginationState.totalPages,
    canGoPrev: paginationState.currentPage > 1,
  };
};
