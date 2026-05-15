import { useState } from "react";
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
import { useUpsertSavingsGoal } from "@/hooks/useLocalData";
import { generateId } from "@/lib/utils";

export default function NewGoalScreen() {
  const coupleId = useAuthStore((s) => s.coupleId);
  const { mutateAsync, isPending } = useUpsertSavingsGoal();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert("Error", "Ingresa un nombre para la meta");
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert("Error", "Ingresa un monto objetivo válido");
      return;
    }

    await mutateAsync({
      id: generateId(),
      couple_id: coupleId!,
      name: name.trim(),
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      deadline: deadline || null,
      created_at: new Date().toISOString(),
    });

    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-white px-6">
      <Text className="text-gray-700 text-sm font-medium mt-6 mb-1">
        Nombre de la meta
      </Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Ej: Viaje a Europa"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-gray-700 text-sm font-medium mb-1">
        Monto objetivo
      </Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-lg"
        placeholder="0.00"
        value={targetAmount}
        onChangeText={setTargetAmount}
        keyboardType="decimal-pad"
      />

      <Text className="text-gray-700 text-sm font-medium mb-1">
        Fecha límite (opcional)
      </Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-8 text-base"
        placeholder="AAAA-MM-DD"
        value={deadline}
        onChangeText={setDeadline}
        maxLength={10}
      />

      <TouchableOpacity
        className={`rounded-xl py-3 mb-8 ${isPending ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleSubmit}
        disabled={isPending}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isPending ? "Guardando..." : "Crear meta"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
