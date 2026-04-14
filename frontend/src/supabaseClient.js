import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iowkoadohcfxpnnuyebm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvd2tvYWRvaGNmeHBubnV5ZWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDc2MjUsImV4cCI6MjA5MTcyMzYyNX0.pq4EbRy8WMIEVSZBUPbqIMorMtGVjCR-hZY5d-msk10";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);