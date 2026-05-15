import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalTransactions, useLocalCategories, useDeleteCategory } from "@/hooks/useLocalData";
import { useAuthStore } from "@/stores/authStore";
import BalanceSummary from "@/components/BalanceSummary";

export default function TransactionsListScreen() {
  const insets = useSafeAreaInsets();
  const coupleId = useAuthStore((s) => s.coupleId);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const { data: transactions = [] } = useLocalTransactions({
    type: typeFilter ?? undefined,
    categoryId: categoryFilter ?? undefined,
    month: currentMonth,
  });
  const { data: categories = [] } = useLocalCategories();

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const monthName = today.toLocaleString("es-AR", { month: "long", year: "numeric" });

  const categoryMap = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string }> = {};
    for (const c of categories) {
      map[c.id] = { name: c.name, icon: c.icon, color: c.color };
    }
    return map;
  }, [categories]);

  function renderItem({ item }: { item: any }) {
    const cat = categoryMap[item.category_id ?? ""];

    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-3 border-b border-gray-100"
        onPress={() => router.push(`/(tabs)/transactions/${item.id}`)}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: cat?.color ?? "#9CA3AF" + "20" }}
        >
          <Text className="text-lg">{cat?.icon ?? "📄"}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-800 font-medium">
            {item.description || cat?.name || "Sin categoría"}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {cat?.name ?? ""}{item.description ? " · " : ""}
            {new Date(item.date).toLocaleDateString("es-AR")}
          </Text>
        </View>

        <Text
          className={`font-bold text-base ${
            item.type === "income" ? "text-green-600" : "text-red-500"
          }`}
        >
          {item.type === "income" ? "+" : "-"}$
          {item.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <BalanceSummary
              income={income}
              expense={expense}
              month={monthName}
            />

            {/* Type filter */}
            <View className="flex-row px-4 mb-3 gap-2">
              {["expense", "income"].map((t) => (
                <TouchableOpacity
                  key={t}
                  className={`px-4 py-2 rounded-full ${
                    typeFilter === t ? "bg-indigo-600" : "bg-gray-100"
                  }`}
                  onPress={() =>
                    setTypeFilter(typeFilter === t ? null : t)
                  }
                >
                  <Text
                    className={`text-sm font-medium ${
                      typeFilter === t ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {t === "expense" ? "💸 Gastos" : "💰 Ingresos"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category filter */}
            <View className="px-4 mb-2">
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`mr-2 px-3 py-1.5 rounded-full border ${
                      categoryFilter === item.id
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-200"
                    }`}
                    onPress={() =>
                      setCategoryFilter(
                        categoryFilter === item.id ? null : item.id,
                      )
                    }
                  >
                    <Text
                      className={`text-sm ${
                        categoryFilter === item.id
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {item.icon} {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {transactions.length === 0 && (
              <View className="py-12 items-center">
                <Text className="text-4xl mb-2">💳</Text>
                <Text className="text-gray-400 text-base">
                  No hay movimientos este mes
                </Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/(tabs)/transactions/new")}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>
    </View>
  );
}
