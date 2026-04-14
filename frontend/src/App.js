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

    else {
      reply = "🤖 Ask: most, least, income, expense, balance, character";
    }

    setChat([...chat, msg, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div style={styles.page}>
      <h1>💸 EXPENSE TRACKER</h1>

      {/* VIEW BUTTON */}
      <div style={styles.centerBtn}>
        <button onClick={() => setView("summary")} style={styles.bigBtn}>
          📊 Monthly Summary
        </button>
      </div>

      {/* SUMMARY */}
      <div style={styles.summary}>
        <div>💚 Income ₹{income}</div>
        <div>❤️ Expense ₹{expense}</div>
        <div>💙 Balance ₹{balance}</div>
      </div>

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
                margin:5
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
          />
          <button onClick={startVoice}>🎤</button>
          <button onClick={handleChat}>Send</button>
        </div>
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  page:{ background:"#0f172a", color:"#fff", minHeight:"100vh", padding:20, textAlign:"center" },

  centerBtn:{ display:"flex", justifyContent:"center", margin:"20px 0" },

  bigBtn:{ padding:"18px 50px", fontSize:18, fontWeight:"bold", borderRadius:18, border:"none",
    background:"linear-gradient(135deg,#6366f1,#22c55e)", color:"#fff", cursor:"pointer" },

  summary:{ display:"flex", justifyContent:"center", gap:20 },

  form:{ maxWidth:500, margin:"auto", background:"#1e293b", padding:20, borderRadius:20 },

  input:{ width:"100%", padding:12, marginBottom:10, borderRadius:10, border:"none" },

  addBtn:{ width:"100%", padding:14, background:"#22c55e", border:"none", borderRadius:10, fontWeight:"bold" },

  chartBox:{ maxWidth:500, margin:"auto" },

  chatBox:{ position:"fixed", right:20, bottom:20, width:320, background:"#111827" },

  chatHeader:{ background:"#6366f1", padding:10 },

  chatBody:{ height:150, overflowY:"auto", padding:10 },

  chatInput:{ display:"flex", gap:5, padding:10 },

  chatInputBox:{ flex:1, padding:8 },

  characterBox:{
    maxWidth:500,
    margin:"20px auto",
    padding:20,
    borderRadius:20,
    background:"#1e293b",
    textAlign:"center"
  }
};