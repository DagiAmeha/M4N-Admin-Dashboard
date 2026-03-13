import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export type PaymentSummaryData = {
  month: string;
  tithe: number;
  gift: number;
  offering: number;
  other: number;
};

interface PaymentSummaryChartProps {
  data: PaymentSummaryData[];
}

const COLORS = {
  tithe: "#14b8a6", // teal
  gift: "#6366f1", // indigo
  offering: "#f59e42", // orange
  other: "#a3a3a3", // gray
};

export const PaymentSummaryChart: React.FC<PaymentSummaryChartProps> = ({
  data,
}) => {
  return (
    <div style={{ width: "100%", height: 320, padding: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 24, right: 24, left: 24, bottom: 32 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 14 }} />
          <YAxis tick={{ fontSize: 14 }} />
          <Tooltip
            formatter={(value, name) => {
              const normalizedValue = Number(value ?? 0);
              const normalizedName = String(name);

              return [
                normalizedValue,
                normalizedName.charAt(0).toUpperCase() +
                  normalizedName.slice(1),
              ];
            }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 16 }}
            iconType="circle"
          />
          <Bar
            dataKey="tithe"
            stackId="payments"
            fill={COLORS.tithe}
            name="Tithe"
          />
          <Bar
            dataKey="gift"
            stackId="payments"
            fill={COLORS.gift}
            name="Gift"
          />
          <Bar
            dataKey="offering"
            stackId="payments"
            fill={COLORS.offering}
            name="Offering"
          />
          <Bar
            dataKey="other"
            stackId="payments"
            fill={COLORS.other}
            name="Other"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentSummaryChart;
