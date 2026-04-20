import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// 🔥 SUPABASE
const supabase = createClient(
  "https://iowkoadohcfxpnnuyebm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvd2tvYWRvaGNmeHBubnV5ZWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDc2MjUsImV4cCI6MjA5MTcyMzYyNX0.pq4EbRy8WMIEVSZBUPbqIMorMtGVjCR-hZY5d-msk10"
);

const CATEGORIES = ["Personal","Food","Shopping","Household","Transport","Other"];

const SMART_MESSAGES = [
  "Small savings today = big wealth tomorrow 💡",
  "Avoid impulse buying today! 🛑",
  "Track every penny, watch your wealth grow! 🌱",
  "Pay yourself first before spending! 💰"
];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState("add");

  const [chat, setChat] = useState([
    { role: "bot", text: "👋 Smart Finance AI Ready!" }
  ]);

  const [input, setInput] = useState("");

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: "",
  });

  const [messageOfTheDay, setMessageOfTheDay] = useState("");

  useEffect(() => {
    setMessageOfTheDay(SMART_MESSAGES[Math.floor(Math.random() * SMART_MESSAGES.length)]);
  }, []);

  // 🎭 FINANCIAL CHARACTER SYSTEM
  const getFinancialCharacter = (income, expense) => {
    if (!income || income === 0) return "🐢 Saver Turtle";

    const ratio = expense / income;

    if (ratio < 0.4) return "🧠 Finance Master";
    if (ratio < 0.5) return "🐢 Saver Turtle";
    if (ratio < 0.8) return "🦅 Smart Eagle";
    return "🔥 Risk Tiger";
  };

  const getCharacterMessage = (character) => {
    switch (character) {
      case "🧠 Finance Master":
        return "Excellent control! You are managing money like a pro investor.";

      case "🐢 Saver Turtle":
        return "Good saver! Keep steady and grow your savings.";

      case "🦅 Smart Eagle":
        return "Balanced spending. Try reducing small unnecessary expenses.";

      case "🔥 Risk Tiger":
        return "Warning! You are spending too much compared to income.";

      default:
        return "Keep tracking your finances!";
    }
  };

  // 🎤 VOICE
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.lang = "en-US";
    recognition.continuous = false;
  }

  const startVoice = () => {
    if (!recognition) return alert("Voice not supported");

    recognition.start();
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript.toLowerCase());
    };
  };

  // 🔄 FETCH DATA
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setTransactions(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ➕ ADD TRANSACTION
  const addTransaction = async () => {
    if (!form.description || !form.amount) return;

    await supabase.from("transactions").insert([{
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      type: form.type.toLowerCase(),
      date: form.date,
    }]);

    setForm({
      description: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: "",
    });

    fetchData();
  };

  // 💰 SAFE CALCULATION
  const safeTransactions = transactions || [];

  const income = safeTransactions.reduce(
    (s,t)=> t.type==="income" ? s + Number(t.amount||0) : s, 0
  );

  const expense = safeTransactions.reduce(
    (s,t)=> t.type==="expense" ? s + Number(t.amount||0) : s, 0
  );

  const balance = income - expense;

  // 🚨 DANGER ZONE
  let dangerStatus = { text: "Safe ✅", color: "#22c55e", bg: "rgba(34, 197, 94, 0.2)" };
  if (income > 0) {
    if (expense > income) {
      dangerStatus = { text: "Danger! Expenses exceed income 🔴", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" };
    } else if (expense > income * 0.8) {
      dangerStatus = { text: "Warning! Nearing limit 🟡", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" };
    }
  }

  // 📆 MONTH COMPARISON
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthCategoryMap = {};
  const lastMonthCategoryMap = {};

  safeTransactions.forEach(t => {
    if (t.type === "expense" && t.date) {
      const tDate = new Date(t.date);
      const tMonth = tDate.getMonth();
      const tYear = tDate.getFullYear();
      const amt = Number(t.amount || 0);

      if (tYear === currentYear && tMonth === currentMonth) {
        currentMonthCategoryMap[t.category] = (currentMonthCategoryMap[t.category] || 0) + amt;
      } else if ((tYear === currentYear && tMonth === currentMonth - 1) || (currentMonth === 0 && tYear === currentYear - 1 && tMonth === 11)) {
        lastMonthCategoryMap[t.category] = (lastMonthCategoryMap[t.category] || 0) + amt;
      }
    }
  });

  const getMonthComparison = () => {
    let comparisons = [];
    CATEGORIES.forEach(c => {
      const curr = currentMonthCategoryMap[c] || 0;
      const last = lastMonthCategoryMap[c] || 0;
      if (curr > 0 || last > 0) {
        if (last === 0) {
          // No previous data
        } else {
          const diff = curr - last;
          const pct = Math.round(Math.abs(diff) / last * 100);
          if (diff > 0) comparisons.push(`↑ ${c} spending increased by ${pct}%`);
          if (diff < 0) comparisons.push(`↓ ${c} spending decreased by ${pct}%`);
        }
      }
    });
    return comparisons;
  };

  const monthComparisons = getMonthComparison();

  // 🎭 CHARACTER (LIVE)
  const character = getFinancialCharacter(income, expense);
  const characterMsg = getCharacterMessage(character);

  // 📊 CATEGORY MAP
  const categoryMap = {};

  safeTransactions.forEach(t => {
    if (t.type === "expense") {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + Number(t.amount || 0);
    }
  });

  // 📊 CHART DATA
  const pieData = {
    labels: CATEGORIES,
    datasets: [{
      data: CATEGORIES.map(c => categoryMap[c] || 0),
      backgroundColor: [
        "#6366f1","#22c55e","#f59e0b",
        "#ef4444","#06b6d4","#a855f7"
      ]
    }]
  };

  const barData = {
    labels: CATEGORIES,
    datasets: [{
      label: "Monthly Expense",
      data: CATEGORIES.map(c => categoryMap[c] || 0),
      backgroundColor: "#22c55e"
    }]
  };

  // 🤖 AI ENGINE
  const handleChat = () => {
    if (!input.trim()) return;

    const text = input.toLowerCase();
    const msg = { role: "user", text: input };

    let reply = "";

    if (text.includes("most")) {
      const sorted = Object.entries(categoryMap).sort((a,b)=>b[1]-a[1]);
      reply = sorted[0]
        ? `🔥 Most spent on ${sorted[0][0]} → ₹${sorted[0][1]}`
        : "No data";
    }

    else if (text.includes("least")) {
      const sorted = Object.entries(categoryMap).sort((a,b)=>a[1]-b[1]);
      reply = sorted[0]
        ? `❄ Least spent on ${sorted[0][0]} → ₹${sorted[0][1]}`
        : "No data";
    }

    else if (text.includes("income")) {
      reply = `💰 Income ₹${income}`;
    }

    else if (text.includes("expense")) {
      reply = `💸 Expense ₹${expense}`;
    }

    else if (text.includes("balance")) {
      reply = `📊 Balance ₹${balance}`;
    }

    else if (text.includes("tip") || text.includes("save")) {
      reply = `💡 Reduce top category spending & track daily expenses.`;
    }

    else if (text.includes("character")) {
      reply = `🎭 You are: ${character} — ${characterMsg}`;
    }
    
    else if (text.includes("plan") || text.includes("budget")) {
      if (income === 0) {
        reply = "⚠️ I need to know your income first to plan a budget!";
      } else {
        const essentials = Math.round(income * 0.50);
        const wants = Math.round(income * 0.30);
        const savings = Math.round(income * 0.20);
        reply = `📊 AI Budget Plan based on your ₹${income} income:\nEssentials → ₹${essentials}\nWants → ₹${wants}\nSavings → ₹${savings}`;
      }
    }

    else {
      reply = "🤖 Ask: most, least, income, expense, balance, character, plan my budget";
    }

    setChat([...chat, msg, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div style={styles.page}>
      <h1>💸 EXPENSE TRACKER</h1>
      <h3 style={styles.smartMessage}>🌙 {messageOfTheDay}</h3>

      {/* DANGER ZONE INDICATOR */}
      <div style={{...styles.dangerZone, borderColor: dangerStatus.color, backgroundColor: dangerStatus.bg, color: dangerStatus.color}}>
        {dangerStatus.text}
      </div>

      {/* VIEW BUTTON */}
      <div style={styles.centerBtn}>
        <button onClick={() => setView("summary")} style={styles.bigBtn}>
          📊 Monthly Summary
        </button>
      </div>

      {/* SUMMARY */}
      <div style={styles.summary}>
        <div style={styles.summaryCard}>💚 Income <br/> <span style={{fontSize: 20}}>₹{income}</span></div>
        <div style={styles.summaryCard}>❤️ Expense <br/> <span style={{fontSize: 20}}>₹{expense}</span></div>
        <div style={styles.summaryCard}>💙 Balance <br/> <span style={{fontSize: 20}}>₹{balance}</span></div>
      </div>
      
      {monthComparisons.length > 0 && (
        <div style={styles.comparisonBox}>
          <h3>📈 Month vs Month</h3>
          {monthComparisons.map((msg, idx) => (
            <p key={idx} style={{ color: msg.includes("↑") ? "#ef4444" : "#22c55e", margin: "8px 0", fontWeight: "bold" }}>
              {msg}
            </p>
          ))}
        </div>
      )}

      {/* 🎭 FINANCIAL CHARACTER */}
      <div style={styles.characterBox}>
        <h2>🎭 Financial Character</h2>
        <h1>{character}</h1>
        <p>{characterMsg}</p>
      </div>

      {/* FORM */}
      {view === "add" && (
        <div style={styles.form}>
          <input style={styles.input}
            placeholder="Description"
            value={form.description}
            onChange={e=>setForm({...form,description:e.target.value})}
          />

          <input style={styles.input}
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={e=>setForm({...form,amount:e.target.value})}
          />

          <input style={styles.input}
            type="date"
            value={form.date}
            onChange={e=>setForm({...form,date:e.target.value})}
          />

          <select style={styles.input}
            value={form.category}
            onChange={e=>setForm({...form,category:e.target.value})}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>

          <select style={styles.input}
            value={form.type}
            onChange={e=>setForm({...form,type:e.target.value})}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <button style={styles.addBtn} onClick={addTransaction}>
            ➕ Save Transaction
          </button>
        </div>
      )}

      {/* CHART */}
      {view === "summary" && (
        <div style={styles.chartBox}>
          <Bar data={barData} />
          <Pie data={pieData} />
        </div>
      )}

      {/* CHAT */}
      <div style={styles.chatBox}>
        <div style={styles.chatHeader}>🤖 AI Assistant</div>

        <div style={styles.chatBody}>
          {chat.map((c,i)=>(
            <div key={i}>
              <span style={{
                background:c.role==="user"?"#22c55e":"#1e293b",
                padding:8,
                borderRadius:10,
                display:"inline-block",
                margin:5,
                whiteSpace: "pre-line",
                textAlign: "left"
              }}>
                {c.text}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.chatInput}>
          <input
            style={styles.chatInputBox}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
          />
          <button style={styles.chatBtn} onClick={startVoice}>🎤</button>
          <button style={styles.chatBtn} onClick={handleChat}>Send</button>
        </div>
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  page:{ background:"#0f172a", color:"#fff", minHeight:"100vh", padding:20, textAlign:"center", fontFamily: "system-ui, sans-serif" },

  smartMessage:{ fontStyle: "italic", color: "#cbd5e1", margin: "10px 0 25px 0" },

  dangerZone:{ maxWidth: 350, margin: "20px auto", padding: "12px 20px", borderRadius: "12px", border: "2px solid", fontWeight: "bold", fontSize: 16 },

  comparisonBox:{ maxWidth:500, margin:"25px auto", padding:20, borderRadius:20, background:"#1e293b", textAlign:"center", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" },

  centerBtn:{ display:"flex", justifyContent:"center", margin:"25px 0" },

  bigBtn:{ padding:"16px 40px", fontSize:18, fontWeight:"bold", borderRadius:18, border:"none",
    background:"linear-gradient(135deg,#6366f1,#22c55e)", color:"#fff", cursor:"pointer", boxShadow: "0 4px 10px rgba(99, 102, 241, 0.4)" },

  summary:{ display:"flex", justifyContent:"center", gap:15, flexWrap:"wrap" },
  
  summaryCard: { background: "#1e293b", padding: "15px 25px", borderRadius: "12px", fontSize: "16px", color: "#cbd5e1", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" },

  form:{ maxWidth:500, margin:"20px auto", background:"#1e293b", padding:25, borderRadius:20, boxShadow: "0 4px 6px rgba(0,0,0,0.3)" },

  input:{ width:"100%", padding:"12px 15px", marginBottom:15, borderRadius:12, border:"none", background:"#0f172a", color:"#fff", boxSizing:"border-box" },

  addBtn:{ width:"100%", padding:"14px", background:"#22c55e", color:"#fff", border:"none", borderRadius:12, fontWeight:"bold", fontSize: 16, cursor: "pointer" },

  chartBox:{ maxWidth:500, margin:"20px auto", background:"#1e293b", padding:20, borderRadius:20 },

  chatBox:{ position:"fixed", right:20, bottom:20, width:320, background:"#111827", borderRadius:15, overflow:"hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" },

  chatHeader:{ background:"#6366f1", padding:15, fontWeight: "bold", fontSize: 16 },

  chatBody:{ height:200, overflowY:"auto", padding:15, display: "flex", flexDirection: "column" },

  chatInput:{ display:"flex", gap:8, padding:15, background: "#1e293b" },

  chatInputBox:{ flex:1, padding:"10px 12px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff" },
  
  chatBtn: { padding: "10px 15px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },

  characterBox:{
    maxWidth:500,
    margin:"25px auto",
    padding:25,
    borderRadius:20,
    background:"#1e293b",
    textAlign:"center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
  }
};