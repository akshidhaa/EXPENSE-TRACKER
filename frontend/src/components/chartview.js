import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const ChartView = ({ transactions }) => {

  const data = transactions.map((t, index) => ({
    name: `T${index + 1}`,
    amount: t.amount
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Expense Chart</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartView;