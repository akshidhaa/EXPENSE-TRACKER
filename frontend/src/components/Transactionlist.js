import React from "react";

const TransactionList = ({ transactions }) => {
  return (
    <div>
      <h3>Transactions</h3>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.text} - ₹{t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;