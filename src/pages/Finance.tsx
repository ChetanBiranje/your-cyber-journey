import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Award,
  Home,
  Coffee,
  Trash2
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { format, subDays } from "date-fns";

interface FinanceEntry {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  type: "income" | "expense";
  entry_date: string;
}

const categories = [
  { value: "courses", label: "Courses & Learning", icon: BookOpen },
  { value: "certifications", label: "Certifications", icon: Award },
  { value: "books", label: "Books & Materials", icon: BookOpen },
  { value: "living", label: "Living Expenses", icon: Home },
  { value: "food", label: "Food & Beverages", icon: Coffee },
  { value: "other", label: "Other", icon: Wallet },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--accent))",
];

export default function Finance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "courses",
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
  });

  useEffect(() => {
    fetchEntries();
  }, [user]);

  async function fetchEntries() {
    if (!user) return;

    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("finance_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("entry_date", thirtyDaysAgo)
      .order("entry_date", { ascending: false });

    if (data) {
      setEntries(data as FinanceEntry[]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !formData.amount) return;

    const { error } = await supabase.from("finance_entries").insert({
      user_id: user.id,
      category: formData.category,
      description: formData.description || null,
      amount: parseFloat(formData.amount),
      type: formData.type,
      entry_date: format(new Date(), "yyyy-MM-dd"),
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry Added!",
        description: `₹${formData.amount} ${formData.type} recorded`,
      });
      setFormData({ category: "courses", description: "", amount: "", type: "expense" });
      setShowForm(false);
      fetchEntries();
    }
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from("finance_entries").delete().eq("id", id);
    if (!error) {
      toast({ title: "Entry deleted" });
      fetchEntries();
    }
  }

  const totalIncome = entries.filter(e => e.type === "income").reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = entries.filter(e => e.type === "expense").reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  const expenseByCategory = entries
    .filter(e => e.type === "expense")
    .reduce((acc, entry) => {
      const cat = entry.category;
      acc[cat] = (acc[cat] || 0) + Number(entry.amount);
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name: categories.find(c => c.value === name)?.label || name,
    value,
  }));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse-scale" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold">Finance Tracker</h1>
            <p className="text-muted-foreground mt-1">Manage your education expenses</p>
          </div>
          <Button 
            className="gradient-primary text-primary-foreground gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
        </div>

        {/* Add Entry Form */}
        {showForm && (
          <Card3D variant="glass" className="animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense") => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional note"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">
                  Save Entry
                </Button>
              </div>
            </form>
          </Card3D>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card3D gradient="success" className="animate-slide-up stagger-1 opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Income</p>
                <p className="text-3xl font-bold font-mono mt-1">₹{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </Card3D>
          
          <Card3D gradient="warm" className="animate-slide-up stagger-2 opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Expenses</p>
                <p className="text-3xl font-bold font-mono mt-1">₹{totalExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 opacity-80" />
            </div>
          </Card3D>
          
          <Card3D gradient={balance >= 0 ? "cyber" : "primary"} className="animate-slide-up stagger-3 opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Balance</p>
                <p className="text-3xl font-bold font-mono mt-1">
                  {balance >= 0 ? "+" : ""}₹{balance.toLocaleString()}
                </p>
              </div>
              <Wallet className="w-8 h-8 opacity-80" />
            </div>
          </Card3D>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Chart */}
          <Card3D className="animate-slide-up stagger-4 opacity-0">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            {pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No expenses recorded yet</p>
              </div>
            )}
          </Card3D>

          {/* Recent Transactions */}
          <Card3D className="animate-slide-up stagger-5 opacity-0">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {entries.length > 0 ? (
                entries.slice(0, 10).map((entry) => {
                  const CategoryIcon = categories.find(c => c.value === entry.category)?.icon || Wallet;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.type === "income" ? "bg-success/20" : "bg-warning/20"
                      }`}>
                        <CategoryIcon className={`w-5 h-5 ${
                          entry.type === "income" ? "text-success" : "text-warning"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {categories.find(c => c.value === entry.category)?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.description || format(new Date(entry.entry_date), "MMM d")}
                        </p>
                      </div>
                      <p className={`font-mono font-bold ${
                        entry.type === "income" ? "text-success" : "text-foreground"
                      }`}>
                        {entry.type === "income" ? "+" : "-"}₹{Number(entry.amount).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No transactions yet
                </p>
              )}
            </div>
          </Card3D>
        </div>
      </div>
    </Layout>
  );
}
