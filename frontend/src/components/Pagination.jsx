import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>
      
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-xl font-bold transition-colors border cursor-pointer ${
            currentPage === i + 1 
              ? 'bg-primary border-primary text-white shadow-md' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
