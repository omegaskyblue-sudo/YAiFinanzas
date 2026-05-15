import { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalTransactions, useLocalCategories } from "@/hooks/useLocalData";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { exportTransactionsToCSV } from "@/lib/exportData";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function getLast6Months() {
  const result: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return result;
}

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const months = useMemo(() => getLast6Months(), []);
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);

  const { data: allTransactions = [] } = useLocalTransactions();
  const { data: categories = [] } = useLocalCategories();

  const filtered = useMemo(
    () => allTransactions.filter((t) => t.date.startsWith(selectedMonth)),
    [allTransactions, selectedMonth],
  );

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of filtered) {
      if (tx.type !== "expense") continue;
      const key = tx.category_id ?? "sin-categoria";
      map[key] = (map[key] || 0) + tx.amount;
    }

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return Object.entries(map)
      .map(([catId, value]) => {
        const cat = catId === "sin-categoria" ? null : categoryMap.get(catId);
        return {
          label: cat?.name ?? "Sin categoría",
          value,
          color: cat?.color ?? "#9CA3AF",
          icon: cat?.icon ?? "📄",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filtered, categories]);

  const totalExpense = expensesByCategory.reduce((s, d) => s + d.value, 0);
  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const monthlyData = useMemo(() => {
    return months.map((m) => {
      const monthTxs = allTransactions.filter((t) => t.date.startsWith(m));
      const income = monthTxs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const monthIndex = parseInt(m.split("-")[1]) - 1;
      return {
        label: MONTHS[monthIndex],
        income,
        expense,
        balance: income - expense,
      };
    });
  }, [allTransactions, months]);

  const monthLabel = new Date(selectedMonth + "-01").toLocaleDateString(
    "es-AR",
    { month: "long", year: "numeric" },
  );

  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const [year, month] = selectedMonth.split("-");
    const startDate = `${selectedMonth}-01`;
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
    ).toISOString()
      .split("T")[0];
    await exportTransactionsToCSV(startDate, endDate);
    setExporting(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
    >
      {/* Month selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
      >
        <View className="flex-row gap-2">
          {months.map((m) => {
            const idx = parseInt(m.split("-")[1]) - 1;
            const active = m === selectedMonth;
            return (
              <TouchableOpacity
                key={m}
                className={`px-4 py-2 rounded-full ${active ? "bg-indigo-600" : "bg-white border border-gray-200"}`}
                onPress={() => setSelectedMonth(m)}
              >
                <Text
                  className={`text-sm font-medium ${active ? "text-white" : "text-gray-600"}`}
                >
                  {MONTHS[idx]} {m.split("-")[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Summary cards */}
      <View className="flex-row px-4 mb-5 gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-400 text-xs">Ingresos</Text>
          <Text className="text-green-600 font-bold text-lg mt-1">
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-400 text-xs">Gastos</Text>
          <Text className="text-red-500 font-bold text-lg mt-1">
            {formatCurrency(totalExpense)}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-400 text-xs">Balance</Text>
          <Text
            className={`font-bold text-lg mt-1 ${
              totalIncome - totalExpense >= 0
                ? "text-indigo-600"
                : "text-red-500"
            }`}
          >
            {formatCurrency(totalIncome - totalExpense)}
          </Text>
        </View>
      </View>

      {/* Pie chart */}
      <View className="bg-white rounded-2xl mx-4 p-5 mb-5 shadow-sm">
        <Text className="text-gray-800 font-bold text-lg mb-4">
          Gastos por categoría — {monthLabel}
        </Text>
        {expensesByCategory.length > 0 ? (
          <PieChart
            data={expensesByCategory}
            size={200}
            innerRadius={50}
          />
        ) : (
          <View className="py-8 items-center">
            <Text className="text-gray-400 text-sm">
              Sin gastos este mes
            </Text>
          </View>
        )}
      </View>

      {/* Monthly evolution */}
      <View className="bg-white rounded-2xl mx-4 p-5 mb-8 shadow-sm">
        <Text className="text-gray-800 font-bold text-lg mb-4">
          Evolución mensual
        </Text>
        <BarChart
          data={monthlyData.map((m) => ({
            label: m.label,
            value: m.expense,
            color: "#EF4444",
          }))}
          formatValue={(v) => formatCurrency(v)}
        />
        <View className="flex-row justify-center mt-4 gap-6">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded bg-red-500 mr-1.5" />
            <Text className="text-gray-500 text-xs">Gastos</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded bg-green-500 mr-1.5" />
            <Text className="text-gray-500 text-xs">Ingresos</Text>
          </View>
        </View>

        {/* Income bars overlay */}
        <View className="mt-2">
          <BarChart
            data={monthlyData.map((m) => ({
              label: "",
              value: m.income,
              color: "#22C55E",
            }))}
            formatValue={(v) => formatCurrency(v)}
          />
        </View>
      </View>

      {/* Export button */}
      <View className="px-4 mb-8">
        <TouchableOpacity
          onPress={handleExport}
          disabled={exporting}
          className="bg-indigo-600 py-3.5 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-base">
            {exporting ? "Exportando..." : "Exportar mes a CSV"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
