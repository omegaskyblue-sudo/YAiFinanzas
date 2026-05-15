import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: { borderTopWidth: 1, borderTopColor: "#E5E7EB" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Movimientos",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💳</Text>,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Presupuestos",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text>,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Metas",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
