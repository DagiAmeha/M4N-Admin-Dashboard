import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../api/axios";
import type { Purchase, Book, Subscription, Donation } from "../../types";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

type PaymentType = "books" | "subscriptions" | "donations";
type SortOption = "newest" | "oldest" | "amount_desc" | "amount_asc";

const PAGE_SIZE = 20;
const FETCH_LIMIT = 100;

interface ListResponse<T> {
  data?: T[];
  pagination?: {
    page?: number;
    limit?: number;
    pages?: number;
    total?: number;
  };
}

const HIGH_VALUE_DEFAULT: Record<PaymentType, string> = {
  books: "1000",
  subscriptions: "1500",
  donations: "5000",
};

function bookTitle(b: Book | string): string {
  return typeof b === "string" ? b : (b?.title ?? "Prayer Book");
}

function planName(p: Subscription["plan"]): string {
  return typeof p === "string" ? p : (p?.name ?? "Plan");
}

function getRecordStatus(record: any): string {
  return (record.status ?? record.paymentStatus ?? "").toString().toLowerCase();
}

function getRecordAmount(record: any): number {
  return Number(record.amount ?? 0);
}

function getRecordTimestamp(record: any): number {
  const rawDate = record.paidAt ?? record.paid_at ?? record.createdAt;
  const value = rawDate ? new Date(rawDate).getTime() : NaN;
  return Number.isNaN(value) ? 0 : value;
}

function getRecordUserName(record: any): string {
  const donationName = [record.firstName, record.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return record.user?.username ?? donationName ?? "Unknown";
}

function getRecordSearchText(record: any, selectedType: PaymentType): string {
  const typeText =
    selectedType === "books"
      ? bookTitle(record.book)
      : selectedType === "subscriptions"
        ? planName(record.plan)
        : (record.reason ?? "Donation").toString();

  return [
    getRecordUserName(record),
    record.paymentRef ?? "",
    record.email ?? "",
    typeText,
  ]
    .join(" ")
    .toLowerCase();
}

function getFriendlyFetchError(error: any, fallback: string): string {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  }

  return error.response?.data?.message ?? fallback;
}

async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const rows: T[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const res = await api.get<ListResponse<T>>(endpoint, {
      params: { page: currentPage, limit: FETCH_LIMIT },
    });

    const pageRows = Array.isArray(res.data?.data) ? res.data.data : [];
    rows.push(...pageRows);

    const pagesFromApi = Number(res.data?.pagination?.pages ?? 1);
    totalPages =
      Number.isFinite(pagesFromApi) && pagesFromApi > 0 ? pagesFromApi : 1;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return rows;
}

export default function PaymentsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<PaymentType>("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [highValueThreshold, setHighValueThreshold] = useState(
    HIGH_VALUE_DEFAULT.books,
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  async function fetchPurchases() {
    setLoading(true);
    try {
      const records = await fetchAllPages<Purchase>("/api/purchase/all");
      setPurchases(records);
    } catch (error: any) {
      toast.error(getFriendlyFetchError(error, "Failed to load purchases."));
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubscriptions() {
    setLoading(true);
    try {
      const records = await fetchAllPages<Subscription>(
        "/api/subscription/all",
      );
      setSubscriptions(records);
    } catch (error: any) {
      toast.error(
        getFriendlyFetchError(error, "Failed to load subscriptions."),
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchDonations() {
    setLoading(true);
    try {
      const records = await fetchAllPages<Donation>("/api/donations/all");
      setDonations(records);
    } catch (error: any) {
      toast.error(getFriendlyFetchError(error, "Failed to load donations."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    setHighValueThreshold(HIGH_VALUE_DEFAULT[selectedType]);

    if (selectedType === "books") fetchPurchases();
    else if (selectedType === "subscriptions") fetchSubscriptions();
    else fetchDonations();
  }, [selectedType]);

  const activeRecords = useMemo<any[]>(() => {
    if (selectedType === "books") return purchases;
    if (selectedType === "subscriptions") return subscriptions;
    return donations;
  }, [selectedType, purchases, subscriptions, donations]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const parsedThreshold = highValueThreshold.trim()
      ? Number(highValueThreshold)
      : 0;

    const results = activeRecords.filter((record) => {
      const amount = getRecordAmount(record);
      const status = getRecordStatus(record);
      const searchable = getRecordSearchText(record, selectedType);

      if (query && !searchable.includes(query)) return false;

      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (
        highValueOnly &&
        !Number.isNaN(parsedThreshold) &&
        amount < parsedThreshold
      ) {
        return false;
      }

      return true;
    });

    results.sort((a, b) => {
      if (sortBy === "amount_desc") {
        return getRecordAmount(b) - getRecordAmount(a);
      }
      if (sortBy === "amount_asc") {
        return getRecordAmount(a) - getRecordAmount(b);
      }
      if (sortBy === "oldest") {
        return getRecordTimestamp(a) - getRecordTimestamp(b);
      }
      return getRecordTimestamp(b) - getRecordTimestamp(a);
    });

    return results;
  }, [
    activeRecords,
    highValueOnly,
    highValueThreshold,
    searchQuery,
    selectedType,
    sortBy,
    statusFilter,
  ]);

  const pages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  useEffect(() => {
    if (page > pages) {
      setPage(pages);
    }
  }, [page, pages]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, highValueOnly, highValueThreshold, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "all" || highValueOnly;

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setHighValueOnly(false);
    setHighValueThreshold(HIGH_VALUE_DEFAULT[selectedType]);
    setSortBy("newest");
    setPage(1);
  }

  const columns: any[] = [
    ...(selectedType === "books"
      ? [
          {
            header: "Book",
            cell: (p: any) => (
              <div className="flex items-center gap-2">
                {typeof p.book !== "string" && p.book?.coverImage && (
                  <img
                    src={(p.book as Book).coverImage}
                    alt=""
                    className="w-8 h-10 rounded object-cover"
                  />
                )}
                <span className="font-medium">{bookTitle(p.book)}</span>
              </div>
            ),
          },
        ]
      : selectedType === "subscriptions"
        ? [
            {
              header: "Plan",
              cell: (s: any) =>
                typeof s.plan === "string" ? s.plan : (s.plan as any).name,
            },
          ]
        : [
            {
              header: "Type",
              cell: (d: any) => d.reason ?? "Donation",
            },
          ]),
    {
      header: "User",
      cell: (r: any) => (
        <span className="font-medium text-gray-700 truncate max-w-[150px] block">
          {getRecordUserName(r)}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (r: any) => (
        <span className="font-semibold text-gray-900">
          ETB {Number(r.amount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (r: any) => {
        const status = (r.status ?? r.paymentStatus ?? "")
          .toString()
          .toLowerCase();
        const v: Record<string, "green" | "yellow" | "red" | "gray"> = {
          completed: "green",
          success: "green",
          pending: "yellow",
          failed: "red",
          active: "green",
          cancelled: "gray",
          expired: "gray",
        };
        return (
          <Badge variant={v[status] ?? "gray"}>
            {r.status ?? r.paymentStatus ?? "—"}
          </Badge>
        );
      },
    },
    {
      header: "Payment Ref",
      cell: (r: any) => (
        <span className="font-mono text-xs text-gray-400">
          {r.paymentRef ?? "—"}
        </span>
      ),
    },
    {
      header: "Paid At",
      cell: (r: any) =>
        (r.paidAt ?? r.paid_at) ? (
          new Date(r.paidAt ?? r.paid_at).toLocaleString()
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      header: "Created",
      cell: (p: any) =>
        p.createdAt ? (
          new Date(p.createdAt).toLocaleDateString()
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payments & Purchases"
        subtitle="All book purchase, subscription, and donation transactions"
        icon={ShoppingBag}
        color="bg-teal-600"
        count={filteredRecords.length}
      />

      <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PaymentType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="books">Books</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="donations">Donations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name, Email, Reference, or Type
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name or payment reference"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="high-value-only"
              type="checkbox"
              checked={highValueOnly}
              onChange={(e) => setHighValueOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="high-value-only"
              className="text-sm font-medium text-gray-700"
            >
              {selectedType === "donations"
                ? "High Donations Only"
                : "High Value Only"}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              High Value Threshold (ETB)
            </label>
            <input
              type="number"
              min="0"
              value={highValueThreshold}
              onChange={(e) => setHighValueThreshold(e.target.value)}
              disabled={!highValueOnly}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Showing {pagedRecords.length} of {filteredRecords.length} matching
            transactions
          </p>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <Table
        keyExtractor={(p) => p._id}
        loading={loading}
        data={pagedRecords}
        emptyMessage={
          hasActiveFilters
            ? "No transactions matched your current filters"
            : "No transactions found"
        }
        columns={columns}
      />
      <Pagination
        page={page}
        pages={pages}
        total={filteredRecords.length}
        onChange={setPage}
      />
    </div>
  );
}
