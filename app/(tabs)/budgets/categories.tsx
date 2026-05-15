import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useLocalCategories,
  useUpsertCategory,
  useDeleteCategory,
} from "@/hooks/useLocalData";
import { useAuthStore } from "@/stores/authStore";
import { generateId } from "@/lib/utils";

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const coupleId = useAuthStore((s) => s.coupleId);
  const { data: categories = [] } = useLocalCategories();
  const { mutateAsync: upsertCategory } = useUpsertCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [saving, setSaving] = useState(false);

  const customCategories = useMemo(
    () => categories.filter((c) => c.couple_id),
    [categories],
  );

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert("Error", "Ingresa un nombre");
      return;
    }
    setSaving(true);
    await upsertCategory({
      id: generateId(),
      couple_id: coupleId!,
      name: name.trim(),
      icon: icon.trim() || "receipt",
      type,
      color: "#6B7280",
    });
    setSaving(false);
    setName("");
    setIcon("");
  }

  async function handleDelete(id: string) {
    Alert.alert("Eliminar categoría", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteCategory(id),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <FlatList
        data={customCategories}
        keyExtractor={(item) => item.id}
        className="px-4"
        ListHeaderComponent={
          <View className="pt-4 pb-2">
            <Text className="text-gray-500 text-sm font-medium mb-4">
              Tus categorías personalizadas
            </Text>

            {/* Add form */}
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-gray-700 font-medium mb-3">
                Nueva categoría
              </Text>

              <View className="flex-row mb-3">
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-l-lg ${type === "expense" ? "bg-red-500" : "bg-gray-200"}`}
                  onPress={() => setType("expense")}
                >
                  <Text
                    className={`text-center text-sm font-medium ${type === "expense" ? "text-white" : "text-gray-600"}`}
                  >
                    Gasto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-r-lg ${type === "income" ? "bg-green-500" : "bg-gray-200"}`}
                  onPress={() => setType("income")}
                >
                  <Text
                    className={`text-center text-sm font-medium ${type === "income" ? "text-white" : "text-gray-600"}`}
                  >
                    Ingreso
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-2 mb-2 text-sm"
                placeholder="Nombre (ej: Gym)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-2 mb-3 text-sm"
                placeholder="Icono (ej: dumbbell, coffee, car...)"
                value={icon}
                onChangeText={setIcon}
              />

              <TouchableOpacity
                className={`rounded-xl py-2 ${saving ? "bg-indigo-300" : "bg-indigo-600"}`}
                onPress={handleCreate}
                disabled={saving}
              >
                <Text className="text-white text-center font-medium text-sm">
                  {saving ? "Guardando..." : "Agregar"}
                </Text>
              </TouchableOpacity>
            </View>

            {customCategories.length === 0 && (
              <View className="py-6 items-center">
                <Text className="text-gray-400 text-sm">
                  No creaste categorías personalizadas aún
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onLongPress={() => handleDelete(item.id)}
          >
            <View className="w-9 h-9 rounded-full bg-indigo-100 items-center justify-center mr-3">
              <Text>{item.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">{item.name}</Text>
              <Text className="text-gray-400 text-xs">
                {item.type === "expense" ? "Gasto" : "Ingreso"}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs">
              Mantén presionado para eliminar
            </Text>
          </TouchableOpacity>
        )}
      />

      <View className="px-4 pb-8">
        <TouchableOpacity
          className="border border-gray-300 rounded-xl py-3"
          onPress={() => router.back()}
        >
          <Text className="text-gray-700 text-center font-medium">
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
