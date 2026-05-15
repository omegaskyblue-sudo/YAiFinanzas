import { Stack } from "expo-router";

export default function GoalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Metas de ahorro" }} />
      <Stack.Screen
        name="new"
        options={{ title: "Nueva meta", presentation: "modal" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Aportar", presentation: "modal" }}
      />
    </Stack>
  );
}
