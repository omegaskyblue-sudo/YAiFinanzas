import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
        Crear cuenta
      </Text>
      <Text className="text-base text-center text-gray-500 mb-8">
        Regístrate para empezar
      </Text>

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

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
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`rounded-xl py-3 mb-4 ${loading ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Creando..." : "Crear cuenta"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text className="text-indigo-600 text-center text-sm">
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
