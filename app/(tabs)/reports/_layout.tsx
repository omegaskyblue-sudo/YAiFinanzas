import { Stack } from "expo-router";

export default function ReportsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Reportes" }} />
    </Stack>
  );
}
