'use client';

interface Props {
  currentPage: number;
  itemsCount: number;
  max: number;
  setMax: any;
  // eslint-disable-next-line no-unused-vars
  pageChanged: (page: number) => unknown;
}

export default function RemotePagination({
  currentPage,
  itemsCount,
  max,
  setMax,
  pageChanged,
}: Props) {
  const totalPages = Math.floor(itemsCount / max);

  return (
    <div className="mt-5 flex flex-row justify-between justify-items-center gap-5">
      <div className="flex items-center gap-2">
        <div className="w-24">
          <label className="relative block">
            <select
              name="max"
              defaultValue={max}
              onChange={(e) => setMax(e.target.value)}
              className="form-input"
            >
              {/* <option value={2}>2</option> */}
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
        <p className="text-sm text-gray-800">
          {currentPage + 1} of {totalPages + 1} ({itemsCount} results)
        </p>
      </div>
      <nav className="btn-flex relative z-0" aria-label="Pagination Buttons">
        <button
          type="button"
          onClick={() => pageChanged(currentPage - 1)}
          className="btn btn-primary rounded-full px-4 py-3"
          disabled={!(currentPage >= 1)}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <button
          type="button"
          onClick={() => pageChanged(currentPage + 1)}
          className="btn btn-primary rounded-full px-4 py-3"
          disabled={!(currentPage < totalPages)}
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </nav>
    </div>
  );
}
