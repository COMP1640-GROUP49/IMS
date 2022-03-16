import ReactPaginate from 'react-paginate';

type PaginationProps = {
	items: [];
	currentItems: [];
	itemOffset: number;
	pageCount: number;
	handlePaginationClick: () => void;
	handlePageClick: (event: any) => void;
};

const Pagination = ({
	items,
	currentItems,
	itemOffset,
	pageCount,
	handlePaginationClick,
	handlePageClick,
}: PaginationProps) => {
	return (
		<div className="flex justify-between items-center sm:flex-col gap-6">
			<p>
				Showing from <span className="font-bold">{itemOffset + 1}</span> to{' '}
				<span className="font-bold">{currentItems && items.indexOf(currentItems[currentItems?.length - 1]) + 1}</span>{' '}
				of <span className="font-bold">{items.length} </span>results
			</p>
			<ReactPaginate
				onClick={handlePaginationClick}
				className="pagination"
				breakLabel="..."
				nextLabel=">"
				onPageChange={handlePageClick}
				pageRangeDisplayed={3}
				pageCount={pageCount}
				previousLabel="<"
				renderOnZeroPageCount={null!}
			/>{' '}
		</div>
	);
};

export default Pagination;
