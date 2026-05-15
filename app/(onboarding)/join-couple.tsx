import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function JoinCoupleScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { joinCouple } = useAuth();

  async function handleJoin() {
    if (!code.trim()) {
      Alert.alert("Error", "Ingresa un código de invitación");
      return;
    }
    setLoading(true);
    const ok = await joinCouple(code.trim().toUpperCase());
    setLoading(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "Código inválido. Verifica e intenta de nuevo.");
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
        Unirse a pareja
      </Text>
      <Text className="text-base text-center text-gray-500 mb-8">
        Ingresa el código que te compartió tu pareja
      </Text>

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base text-center text-2xl tracking-widest uppercase"
        placeholder="CÓDIGO"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        maxLength={10}
      />

      <TouchableOpacity
        className={`rounded-xl py-3 mb-4 ${loading ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleJoin}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Uniendo..." : "Unirse"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(onboarding)/create-couple")}>
        <Text className="text-indigo-600 text-center text-sm">
          Crear una pareja nueva
        </Text>
      </TouchableOpacity>
    </View>
  );
}
