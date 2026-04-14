const addTransaction = async () => {
  if (!form.description || !form.amount) return;

  const payload = {
    description: form.description,
    amount: Number(form.amount),
    category: form.category,
    type: form.type,
    date: form.date
  };

  console.log("SENDING:", payload); // 🔍 DEBUG

  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select();

  if (error) {
    console.log("INSERT ERROR:", error);
    return;
  }

  console.log("INSERTED:", data);

  setTransactions(prev => [data[0], ...prev]);

  setForm({
    description: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: ""
  });
};