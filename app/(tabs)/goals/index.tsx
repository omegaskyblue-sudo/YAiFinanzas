import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useLocalSavingsGoals,
  useDeleteSavingsGoal,
} from "@/hooks/useLocalData";
import { formatCurrency } from "@/lib/utils";

function GoalCard({
  goal,
  onPress,
  onDelete,
}: {
  goal: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const progress = Math.min(goal.current_amount / goal.target_amount, 1);
  const pct = Math.round(progress * 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  return (
    <TouchableOpacity
      className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
      onPress={onPress}
      onLongPress={onDelete}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-800 text-lg font-bold">{goal.name}</Text>
        <Text className="text-indigo-600 font-bold text-lg">{pct}%</Text>
      </View>

      {/* Progress bar */}
      <View className="h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
        <View
          className="h-full bg-indigo-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-gray-400 text-xs">Ahorrado</Text>
          <Text className="text-gray-800 font-semibold">
            {formatCurrency(goal.current_amount)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-400 text-xs">Meta</Text>
          <Text className="text-gray-800 font-semibold">
            {formatCurrency(goal.target_amount)}
          </Text>
        </View>
      </View>

      {remaining > 0 && (
        <Text className="text-gray-400 text-xs mt-3 text-center">
          Faltan {formatCurrency(remaining)} para alcanzar la meta
        </Text>
      )}
      {pct >= 100 && (
        <View className="bg-green-100 rounded-full px-3 py-1 mt-3 self-center">
          <Text className="text-green-700 text-xs font-semibold">
            Meta alcanzada
          </Text>
        </View>
      )}

      {goal.deadline && (
        <Text className="text-gray-400 text-xs mt-2">
          Fecha límite: {new Date(goal.deadline).toLocaleDateString("es-AR")}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function GoalsListScreen() {
  const insets = useSafeAreaInsets();
  const { data: goals = [] } = useLocalSavingsGoals();
  const { mutateAsync: deleteGoal } = useDeleteSavingsGoal();

  function handleDelete(id: string) {
    Alert.alert("Eliminar meta", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteGoal(id),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          goals.length === 0 ? (
            <View className="py-16 items-center">
              <Text className="text-5xl mb-3">🎯</Text>
              <Text className="text-gray-400 text-base">
                No tienes metas de ahorro
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Crea una para empezar a ahorrar
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onPress={() => router.push(`/(tabs)/goals/${item.id}`)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/(tabs)/goals/new")}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>
    </View>
  );
}
