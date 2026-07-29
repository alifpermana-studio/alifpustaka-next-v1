interface DiscussionPaginationProps {
  skip: number;
  limit: number;
  total: number;
  onPageChange: (skip: number) => void;
}

export function DiscussionPagination({
  skip,
  limit,
  total,
  onPageChange,
}: DiscussionPaginationProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const handlePrevious = () => {
    if (skip > 0) {
      onPageChange(skip - limit);
    }
  };

  const handleNext = () => {
    if (skip + limit < total) {
      onPageChange(skip + limit);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange((page - 1) * limit);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        className="btn btn-sm"
        onClick={handlePrevious}
        disabled={skip === 0}
      >
        Previous
      </button>

      <div className="join">
        {getPageNumbers().map((page, index) => {
          if (page === -1) {
            return (
              <button key={`ellipsis-${index}`} className="join-item btn btn-sm btn-disabled">
                ...
              </button>
            );
          }
          return (
            <button
              key={page}
              className={`join-item btn btn-sm ${
                page === currentPage ? "btn-active" : ""
              }`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-sm"
        onClick={handleNext}
        disabled={skip + limit >= total}
      >
        Next
      </button>
    </div>
  );
}
