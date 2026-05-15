import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import {
  useLocalCategories,
  useUpsertBudget,
} from "@/hooks/useLocalData";
import { generateId, formatMonth } from "@/lib/utils";

export default function NewBudgetScreen() {
  const coupleId = useAuthStore((s) => s.coupleId);
  const { data: categories = [] } = useLocalCategories();
  const { mutateAsync, isPending } = useUpsertBudget();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense" && c.couple_id),
    [categories],
  );

  async function handleSubmit() {
    if (!categoryId) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }

    const now = new Date();
    const month = formatMonth(now);

    await mutateAsync({
      id: generateId(),
      couple_id: coupleId!,
      category_id: categoryId,
      month: month + "-01",
      amount: parseFloat(amount),
      spent: 0,
    });

    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-white px-6">
      <Text className="text-gray-700 text-sm font-medium mt-6 mb-3">
        Categoría
      </Text>
      <View className="flex-row flex-wrap mb-6">
        {expenseCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
              categoryId === cat.id
                ? "bg-indigo-600 border-indigo-600"
                : "border-gray-300"
            }`}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text
              className={`text-sm ${
                categoryId === cat.id ? "text-white" : "text-gray-700"
              }`}
            >
              {cat.icon} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-gray-700 text-sm font-medium mb-1">
        Presupuesto mensual
      </Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-8 text-lg"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        className={`rounded-xl py-3 mb-8 ${isPending ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleSubmit}
        disabled={isPending}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isPending ? "Guardando..." : "Guardar presupuesto"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
