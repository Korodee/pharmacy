"use client";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

export default function SearchAndFilter({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}: SearchAndFilterProps) {
  return (
    <div className="grid grid-cols-1 px-6 py-3 md:grid-cols-3 gap-3">
      <div>
        <input
          type="text"
          placeholder="Search by phone or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-[#0A438C] bg-white text-black placeholder:text-gray-500 text-sm"
        />
      </div>

      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-[#0A438C] bg-white text-black appearance-none cursor-pointer hover:border-gray-400 transition-colors text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <div className="relative">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-[#0A438C] bg-white text-black appearance-none cursor-pointer hover:border-gray-400 transition-colors text-sm"
        >
          <option value="all">All Types</option>
          <option value="refill">Refill Requests</option>
          <option value="consultation">Consultations</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
