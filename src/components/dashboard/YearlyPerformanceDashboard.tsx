import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../api/axios";
import LoadingSpinner from "../ui/LoadingSpinner";

interface GraphSeries {
  counts: number[];
  amounts: number[];
  total_count: number;
  total_amount: number;
}

interface GraphApiData {
  year: number;
  months: string[];
  series: {
    subscriptions: GraphSeries;
    book_purchases: GraphSeries;
    donations: GraphSeries;
  };
}

interface GraphApiResponse {
  success: boolean;
  data: GraphApiData;
}

interface MonthlyData {
  month: string;
  subscriptionCount: number;
  donationAmount: number;
  booksPurchased: number;
}

const numberFormatter = new Intl.NumberFormat("en-US");

function formatAmountValue(value: number) {
  return numberFormatter.format(value);
}

interface SummaryCard {
  label: string;
  value: number;
  isCurrency: boolean;
}

const chartColors = {
  subscription: "#0f766e",
  donation: "#f59e0b",
  books: "#2563eb",
};

function formatSummaryValue(value: number) {
  return numberFormatter.format(value);
}

export default function YearlyPerformanceDashboard() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [graphData, setGraphData] = useState<GraphApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, index) => currentYear - index);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadGraphData() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<GraphApiResponse>(
          "/api/dashboard/graph",
          {
            params: { year: selectedYear },
          },
        );

        console.log("Graph API response:", response.data);
        if (!isMounted) return;

        if (response.data?.success && response.data?.data) {
          setGraphData(response.data.data);
        } else {
          setGraphData(null);
          setError("Unable to load yearly graph data.");
        }
      } catch {
        if (!isMounted) return;
        setGraphData(null);
        setError("Unable to load yearly graph data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadGraphData();

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    if (!graphData) return [];

    return [
      {
        label: "Total Subscriptions",
        value: graphData.series.subscriptions.total_count,
        isCurrency: false,
      },
      {
        label: "Subscription Revenue",
        value: graphData.series.subscriptions.total_amount,
        isCurrency: true,
      },
      {
        label: "Book Purchases",
        value: graphData.series.book_purchases.total_count,
        isCurrency: false,
      },
      {
        label: "Total Donations",
        value: graphData.series.donations.total_amount,
        isCurrency: true,
      },
    ];
  }, [graphData]);

  const monthlyData = useMemo<MonthlyData[]>(() => {
    if (!graphData) return [];

    return graphData.months.map((month, index) => ({
      month,
      subscriptionCount: graphData.series.subscriptions.counts[index] ?? 0,
      donationAmount: graphData.series.donations.amounts[index] ?? 0,
      booksPurchased: graphData.series.book_purchases.counts[index] ?? 0,
    }));
  }, [graphData]);

  const isEmptyState = !loading && !error && monthlyData.length === 0;

  return (
    <section className="bg-gray-50 rounded-2xl border border-teal-100 p-5 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-teal-900">
            Annual Revenue Performance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track subscriptions, book purchases, and total payment activity by
            year.
          </p>
        </div>

        <label className="text-sm font-medium text-gray-700 w-full md:w-auto">
          Year
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="mt-1.5 block w-full md:w-40 rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-teal-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {loading ? (
            <p className="mt-1 text-xs text-teal-700/80">Updating chart...</p>
          ) : null}
        </label>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : null}

      {isEmptyState ? (
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 text-sm text-gray-600">
          No graph data available for {selectedYear}.
        </div>
      ) : null}

      {summaryCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatSummaryValue(card.value)}{" "}
                {card.isCurrency ? (
                  <span className="text-sm font-medium text-gray-500">
                    Birr
                  </span>
                ) : null}
              </p>
              {/* <p className="mt-2 inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                Live Data
              </p> */}
            </article>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 h-85 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : null}

      {!loading && monthlyData.length > 0 ? (
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Monthly Comparison
          </h3>
          <div className="h-85">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                {/* <YAxis
                  yAxisId="count"
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                  tickFormatter={(value) =>
                    compactFormatter.format(Number(value))
                  }
                /> */}
                <YAxis
                  yAxisId="amount"
                  orientation="left"
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                  tickFormatter={(value) => formatAmountValue(Number(value))}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const numericValue = Number(value ?? 0);
                    const seriesName = String(name);

                    if (seriesName === "Donation Amount") {
                      return [formatAmountValue(numericValue), seriesName];
                    }

                    return [numberFormatter.format(numericValue), seriesName];
                  }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    borderColor: "#d1d5db",
                    boxShadow:
                      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend iconType="circle" />
                <Bar
                  yAxisId="count"
                  dataKey="subscriptionCount"
                  name="Subscription Count"
                  fill={chartColors.subscription}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="amount"
                  dataKey="donationAmount"
                  name="Donation Amount"
                  fill={chartColors.donation}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="count"
                  dataKey="booksPurchased"
                  name="Book Purchases"
                  fill={chartColors.books}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
