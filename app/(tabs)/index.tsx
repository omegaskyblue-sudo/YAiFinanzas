import { useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { useLocalTransactions, useLocalCategories } from "@/hooks/useLocalData";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 bg-gray-50 rounded-xl p-4 mx-1">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-lg font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const now = useMemo(() => new Date(), []);
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { data: transactions = [] } = useLocalTransactions({ month: currentMonth });
  const { data: categories = [] } = useLocalCategories();

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const fmt = (n: number) =>
    `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const categoryMap = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string }> =
      {};
    for (const c of categories) {
      map[c.id] = { name: c.name, icon: c.icon, color: c.color };
    }
    return map;
  }, [categories]);

  return (
    <ScrollView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-indigo-600">
        <Text className="text-white text-2xl font-bold">YAiFinanzas</Text>
        <Text className="text-indigo-200 text-sm mt-1">
          {user?.user_metadata?.name ?? "Usuario"}
        </Text>
      </View>

      {/* Balance hero */}
      <View className="-mt-5 mx-4 bg-white rounded-2xl shadow-md p-5 border border-gray-100">
        <Text className="text-gray-500 text-sm font-medium">
          Balance del mes
        </Text>
        <Text
          className={`text-4xl font-bold mt-1 ${
            balance >= 0 ? "text-gray-900" : "text-red-500"
          }`}
        >
          {balance < 0 ? "-" : ""}
          {fmt(Math.abs(balance))}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row mx-3 mt-5 mb-4">
        <StatCard label="Ingresos" value={fmt(income)} color="#059669" />
        <StatCard label="Gastos" value={fmt(expense)} color="#DC2626" />
        <StatCard
          label="Ahorro"
          value={`${savingsRate.toFixed(0)}%`}
          color={savingsRate >= 0 ? "#2563EB" : "#DC2626"}
        />
      </View>

      {/* Quick actions */}
      <View className="flex-row px-4 mb-5 gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-green-50 rounded-xl py-3 border border-green-200"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/transactions/new",
              params: { type: "income" },
            })
          }
        >
          <Text className="text-green-700 font-semibold">+ Ingreso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-red-50 rounded-xl py-3 border border-red-200"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/transactions/new",
              params: { type: "expense" },
            })
          }
        >
          <Text className="text-red-700 font-semibold">- Gasto</Text>
        </TouchableOpacity>
      </View>

      {/* Recent transactions */}
      <View className="px-4 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-800 text-lg font-bold">
            Últimos movimientos
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
            <Text className="text-indigo-600 text-sm font-medium">
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-3xl mb-2">📭</Text>
            <Text className="text-gray-400 text-sm">
              No hay movimientos este mes
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              Registra tu primer ingreso o gasto
            </Text>
          </View>
        ) : (
          recentTransactions.map((tx) => {
            const cat = categoryMap[tx.category_id ?? ""];
            return (
              <TouchableOpacity
                key={tx.id}
                className="flex-row items-center py-3 border-b border-gray-50"
                onPress={() =>
                  router.push(`/(tabs)/transactions/${tx.id}`)
                }
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor:
                      tx.type === "income" ? "#D1FAE5" : "#FEE2E2",
                  }}
                >
                  <Text className="text-base">
                    {cat?.icon ?? (tx.type === "income" ? "💰" : "💸")}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 text-sm font-medium">
                    {tx.description || cat?.name || "Sin categoría"}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {new Date(tx.date).toLocaleDateString("es-AR")}
                  </Text>
                </View>
                <Text
                  className={`font-semibold ${
                    tx.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {tx.amount.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
