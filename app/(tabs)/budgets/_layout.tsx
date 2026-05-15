import { Stack } from "expo-router";

export default function BudgetsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Presupuestos" }} />
      <Stack.Screen
        name="new"
        options={{ title: "Nuevo presupuesto", presentation: "modal" }}
      />
      <Stack.Screen
        name="categories"
        options={{ title: "Categorías", presentation: "modal" }}
      />
    </Stack>
  );
}
