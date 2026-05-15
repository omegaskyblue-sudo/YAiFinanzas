import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function CreateCoupleScreen() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const { createCouple } = useAuth();

  async function handleCreate() {
    setLoading(true);
    const inviteCode = await createCouple();
    setLoading(false);
    if (inviteCode) {
      setCode(inviteCode);
    } else {
      Alert.alert("Error", "No se pudo crear la pareja. Intenta de nuevo.");
    }
  }

  if (code) {
    return (
      <View className="flex-1 justify-center px-6 bg-white">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
          Pareja creada
        </Text>
        <Text className="text-base text-center text-gray-500 mb-6">
          Comparte este código con tu pareja para que se una:
        </Text>
        <View className="bg-indigo-50 rounded-xl py-6 px-4 mb-8">
          <Text className="text-4xl font-bold text-center text-indigo-700 tracking-widest">
            {code}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl py-3"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-white text-center font-semibold text-base">
            Ir al inicio
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
        Crear pareja
      </Text>
      <Text className="text-base text-center text-gray-500 mb-8">
        Vas a crear una nueva pareja financiera. Luego podrás invitar a tu
        pareja con un código.
      </Text>

      <TouchableOpacity
        className={`rounded-xl py-3 mb-4 ${loading ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Creando..." : "Crear pareja"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(onboarding)/join-couple")}>
        <Text className="text-indigo-600 text-center text-sm">
          ¿Tienes un código? Únete a una pareja
        </Text>
      </TouchableOpacity>
    </View>
  );
}
