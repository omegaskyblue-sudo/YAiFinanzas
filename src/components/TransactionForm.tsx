import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalCategories } from "@/hooks/useLocalData";
import type { TransactionType } from "@/types";

interface FormData {
  amount: string;
  type: TransactionType;
  category_id: string | null;
  description: string;
  date: string;
}

interface Props {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

const MONTHS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];

export default function TransactionForm({ initial, onSubmit, loading }: Props) {
  const today = new Date();
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.category_id ?? null,
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [year, setYear] = useState(String(today.getFullYear()));
  const [month, setMonth] = useState(
    String(today.getMonth() + 1).padStart(2, "0"),
  );
  const [day, setDay] = useState(String(today.getDate()).padStart(2, "0"));

  const { data: categories } = useLocalCategories();
  const filteredCategories =
    categories?.filter((c) => c.type === type) ?? [];

  async function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    const date = `${year}-${month}-${day}`;

    await onSubmit({
      amount,
      type,
      category_id: categoryId,
      description,
      date,
    });
  }

  return (
    <ScrollView className="flex-1 bg-white px-6">
      {/* Type toggle */}
      <View className="flex-row mb-6 mt-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-l-xl ${type === "expense" ? "bg-red-500" : "bg-gray-200"}`}
          onPress={() => {
            setType("expense");
            setCategoryId(null);
          }}
        >
          <Text
            className={`text-center font-semibold ${type === "expense" ? "text-white" : "text-gray-600"}`}
          >
            Gasto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-r-xl ${type === "income" ? "bg-green-500" : "bg-gray-200"}`}
          onPress={() => {
            setType("income");
            setCategoryId(null);
          }}
        >
          <Text
            className={`text-center font-semibold ${type === "income" ? "text-white" : "text-gray-600"}`}
          >
            Ingreso
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text className="text-gray-600 text-sm font-medium mb-1">Monto</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-lg"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      {/* Date */}
      <Text className="text-gray-600 text-sm font-medium mb-1">Fecha</Text>
      <View className="flex-row mb-4 gap-2">
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 flex-1 text-center"
          placeholder="AAAA"
          value={year}
          onChangeText={setYear}
          keyboardType="number-pad"
          maxLength={4}
        />
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 w-20 text-center"
          placeholder="MM"
          value={month}
          onChangeText={setMonth}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 w-20 text-center"
          placeholder="DD"
          value={day}
          onChangeText={setDay}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      {/* Categories */}
      <Text className="text-gray-600 text-sm font-medium mb-1">Categoría</Text>
      <View className="flex-row flex-wrap mb-4">
        {filteredCategories.map((cat) => (
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

      {/* Description */}
      <Text className="text-gray-600 text-sm font-medium mb-1">
        Descripción (opcional)
      </Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-8"
        placeholder="Agrega una descripción..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Submit */}
      <TouchableOpacity
        className={`rounded-xl py-3 mb-8 ${loading ? "bg-indigo-300" : "bg-indigo-600"}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Guardando..." : "Guardar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
