import { useEffect } from 'react';
import { Pagination } from 'react-bootstrap';

import { scrollToTop } from '@shared/utils/scroll-to-top.utils/scroll-to-top.util';

interface IPaginationProps {
  itemsCount: number;
  itemsPerPage: number;
  currentPage: number;
  alwaysShown: boolean;
  totalPage: number;
  setCurrentPage: (number: number) => void;
}

const PaginationComponent = ({
  itemsCount,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  totalPage,
  alwaysShown = true,
}: IPaginationProps) => {
  const pagesCount = Math.ceil(itemsCount / itemsPerPage);
  const isPaginationShown = alwaysShown ? true : pagesCount > 1;
  const isCurrentPageFirst = currentPage === 1;
  const isCurrentPageLast = currentPage === pagesCount;

  const changePage = (number: number) => {
    if (currentPage === number || currentPage < 1) return;
    setCurrentPage(number);
    scrollToTop();
  };

  const onPageNumberClick = (pageNumber: number) => {
    changePage(pageNumber);
  };

  const onPreviousPageClick = () => {
    changePage(currentPage - 1);
  };

  const onFirstPageClick = () => {
    changePage(1);
  };

  const onNextPageClick = () => {
    changePage(currentPage + 1);
  };

  const onLastPageClick = () => {
    changePage(totalPage);
  };

  const setLastPageAsCurrent = () => {
    if (currentPage > pagesCount) {
      if (pagesCount > 0) setCurrentPage(pagesCount);
    }
  };

  let isPageNumberOutOfRange: boolean;
  const pageNumbers = [...new Array(pagesCount)].map((_, index) => {
    const pageNumber = index + 1;
    const isPageNumberFirst = pageNumber === 1;
    const isPageNumberLast = pageNumber === pagesCount;
    const isCurrentPageWithinTwoPageNumbers =
      Math.abs(pageNumber - currentPage) <= 2;

    const handleEllipsisClick = () => {
      if (pageNumber > 0) setCurrentPage(pageNumber);
    };

    if (
      isPageNumberFirst ||
      isPageNumberLast ||
      isCurrentPageWithinTwoPageNumbers
    ) {
      isPageNumberOutOfRange = false;
      return (
        <Pagination.Item
          key={pageNumber}
          activeLabel=""
          onClick={() => onPageNumberClick(pageNumber)}
          active={pageNumber === currentPage}
        >
          {pageNumber}
        </Pagination.Item>
      );
    }

    if (!isPageNumberOutOfRange) {
      isPageNumberOutOfRange = true;
      return (
        <Pagination.Ellipsis
          className="pg-ellipsis"
          key={pageNumber}
          onClick={handleEllipsisClick}
        />
      );
    }

    return null;
  });

  useEffect(setLastPageAsCurrent, [pagesCount]);

  return (
    <>
      {isPaginationShown && (
        <Pagination size="sm" className="pagination">
          <Pagination.First
            onClick={onFirstPageClick}
            disabled={isCurrentPageFirst || itemsCount == 0}
          >
            First
          </Pagination.First>
          <Pagination.Prev
            onClick={onPreviousPageClick}
            disabled={isCurrentPageFirst || itemsCount == 0}
          >
            <i className="fa-solid fa-caret-left"></i>
          </Pagination.Prev>
          {pageNumbers}
          <Pagination.Next
            onClick={onNextPageClick}
            disabled={isCurrentPageLast || itemsCount == 0}
          >
            <i className="fa-solid fa-caret-right"></i>
          </Pagination.Next>
          <Pagination.Last
            onClick={onLastPageClick}
            disabled={isCurrentPageLast || itemsCount == 0}
          >
            Last
          </Pagination.Last>
        </Pagination>
      )}
    </>
  );
};

export default PaginationComponent;
