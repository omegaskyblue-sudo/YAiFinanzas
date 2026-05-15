import { View, Text } from "react-native";

interface Props {
  income: number;
  expense: number;
  month: string;
}

export default function BalanceSummary({ income, expense, month }: Props) {
  const balance = income - expense;

  return (
    <View className="bg-indigo-600 rounded-2xl p-5 mx-4 mb-4">
      <Text className="text-indigo-200 text-sm font-medium mb-1">
        Balance {month}
      </Text>
      <Text
        className={`text-3xl font-bold mb-3 ${balance >= 0 ? "text-white" : "text-red-300"}`}
      >
        ${Math.abs(balance).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        {balance < 0 ? " negativo" : ""}
      </Text>

      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-green-400 mr-2" />
          <View>
            <Text className="text-indigo-200 text-xs">Ingresos</Text>
            <Text className="text-white font-semibold">
              ${income.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-red-400 mr-2" />
          <View>
            <Text className="text-indigo-200 text-xs">Gastos</Text>
            <Text className="text-white font-semibold">
              ${expense.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
