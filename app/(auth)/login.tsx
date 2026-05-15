import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
        YAiFinanzas
      </Text>
      <Text className="text-base text-center text-gray-500 mb-8">
        Inicia sesión para continuar
      </Text>

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`rounded-xl py-3 mb-4 ${loading ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text className="text-indigo-600 text-center text-sm">
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}
