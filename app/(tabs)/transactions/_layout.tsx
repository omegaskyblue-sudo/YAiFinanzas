import { Stack } from "expo-router";

export default function TransactionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Movimientos", headerShown: true }}
      />
      <Stack.Screen
        name="new"
        options={{ title: "Nuevo movimiento", presentation: "modal" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Editar movimiento", presentation: "modal" }}
      />
    </Stack>
  );
}
