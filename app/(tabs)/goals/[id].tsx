import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useLocalSavingsGoals, useContributeToGoal } from "@/hooks/useLocalData";
import { formatCurrency } from "@/lib/utils";

export default function ContributeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: goals = [] } = useLocalSavingsGoals();
  const { mutateAsync, isPending } = useContributeToGoal();

  const [amount, setAmount] = useState("");

  const goal = goals.find((g) => g.id === id);
  if (!goal) return null;
  const g = goal;

  const remaining = Math.max(g.target_amount - g.current_amount, 0);
  const pct = Math.round((g.current_amount / g.target_amount) * 100);

  async function handleContribute() {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    const val = parseFloat(amount);
    if (val > remaining) {
      Alert.alert(
        "Atención",
        `El monto excede lo que falta (${formatCurrency(remaining)}). Se ajustará automáticamente.`,
      );
    }

    await mutateAsync({ goal: g, amount: val });
    router.back();
  }

  return (
    <View className="flex-1 bg-white px-6">
      <View className="items-center mt-8 mb-8">
        <Text className="text-4xl mb-2">🎯</Text>
        <Text className="text-gray-800 text-xl font-bold">{g.name}</Text>
      </View>

      <View className="bg-indigo-50 rounded-xl p-4 mb-6">
        <View className="flex-row justify-between mb-1">
          <Text className="text-indigo-800 font-medium">
            {formatCurrency(g.current_amount)}
          </Text>
          <Text className="text-indigo-800 font-medium">
            {formatCurrency(g.target_amount)}
          </Text>
        </View>
        <View className="h-3 bg-indigo-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </View>
        <Text className="text-indigo-600 text-center text-sm mt-2 font-medium">
          {pct}% completado — faltan {formatCurrency(remaining)}
        </Text>
      </View>

      <Text className="text-gray-700 text-sm font-medium mb-1">
        ¿Cuánto quieres aportar?
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
        onPress={handleContribute}
        disabled={isPending}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isPending ? "Guardando..." : "Aportar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
