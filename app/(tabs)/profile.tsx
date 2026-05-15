import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const { user, coupleId, signOut } = useAuth();

  return (
    <View className="flex-1 bg-white px-6">
      <View className="pt-16 pb-8">
        <Text className="text-2xl font-bold text-gray-800">Perfil</Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-gray-500 text-sm">Nombre</Text>
        <Text className="text-gray-800 text-base font-medium">
          {user?.user_metadata?.name ?? "—"}
        </Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-gray-500 text-sm">Correo</Text>
        <Text className="text-gray-800 text-base font-medium">
          {user?.email ?? "—"}
        </Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-4 mb-8">
        <Text className="text-gray-500 text-sm">ID de pareja</Text>
        <Text className="text-gray-800 text-base font-medium">
          {coupleId ?? "Sin pareja"}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-red-500 rounded-xl py-3"
        onPress={signOut}
      >
        <Text className="text-white text-center font-semibold text-base">
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
