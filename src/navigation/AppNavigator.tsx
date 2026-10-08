import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { colors } from "../theme";

import BrowseScreen from "../screens/BrowseScreen";
import ListingDetailScreen from "../screens/ListingDetailScreen";
import OrdersScreen from "../screens/OrdersScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import NewListingScreen from "../screens/NewListingScreen";
import MyListingsScreen from "../screens/MyListingsScreen";
import EditListingScreen from "../screens/EditListingScreen";

export type RootStackParamList = {
  Tabs: undefined;
  ListingDetail: { id: string };
  Login: undefined;
  Signup: undefined;
  NewListing: undefined;
  MyListings: undefined;
  EditListing: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.verified,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading } = useAuth();
  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink }}>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: "Listing" }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign in" }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create account" }} />
      <Stack.Screen
        name="NewListing"
        component={NewListingScreen}
        options={{ title: "List something new" }}
      />
    <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: "My listings" }} />
      <Stack.Screen name="EditListing" component={EditListingScreen} options={{ title: "Edit listing" }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
