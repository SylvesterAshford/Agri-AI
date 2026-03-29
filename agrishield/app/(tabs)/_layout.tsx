import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, useColorScheme } from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isDark ? "#000" : "#fff",
          borderTopWidth: 0.5,
          borderTopColor: C.border,
          elevation: 0,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "မူလ",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="climate"
        options={{
          title: "ရာသီဥတု",
          tabBarIcon: ({ color }) => (
            <Feather name="cloud-rain" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "ဈေးနှုန်း",
          tabBarIcon: ({ color }) => (
            <Feather name="trending-up" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{
          title: "အသိုင်းအဝိုင်း",
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "ပရိုဖိုင်း",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kyc"
        options={{
          href: null,
          title: "KYC",
        }}
      />
      <Tabs.Screen
        name="verify-kyc"
        options={{
          href: null,
          title: "Verify KYC",
        }}
      />
    </Tabs>
  );
}
