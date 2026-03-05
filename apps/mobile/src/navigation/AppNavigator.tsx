/* ============================
   BARBERPRO — Navegação Principal
   ============================ */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import TabIcon from '../components/TabIcon';
import type {
  RootStackParamList,
  AuthStackParamList,
  CustomerTabParamList,
  OwnerTabParamList,
  StaffTabParamList,
} from '../types/navigation';

// ─── Telas ──────────────────────────────────────────────
import LoginScreen from '../screens/auth/LoginScreen';
import OwnerSetupScreen from '../screens/owner/OwnerSetupScreen';
import HomeCustomerScreen from '../screens/customer/HomeCustomerScreen';
import MyAppointmentsScreen from '../screens/customer/MyAppointmentsScreen';
import HistoryScreen from '../screens/customer/HistoryScreen';
import LoyaltyScreen from '../screens/customer/LoyaltyScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import DashboardOwnerScreen from '../screens/owner/DashboardOwnerScreen';
import ServicesManagementScreen from '../screens/owner/ServicesManagementScreen';
import ScheduleManagementScreen from '../screens/owner/ScheduleManagementScreen';
import PromotionsManagementScreen from '../screens/owner/PromotionsManagementScreen';
import InventoryManagementScreen from '../screens/owner/InventoryManagementScreen';
import StoriesManagementScreen from '../screens/owner/StoriesManagementScreen';
import TeamScreen from '../screens/owner/TeamScreen';
import ReportsScreen from '../screens/owner/ReportsScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import StaffAreaScreen from '../screens/staff/StaffAreaScreen';
import StaffClientsScreen from '../screens/staff/StaffClientsScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import BookingScreen from '../screens/appointments/BookingScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import RateAppointmentScreen from '../screens/common/RateAppointmentScreen';
import ReviewsListScreen from '../screens/common/ReviewsListScreen';
import OwnerPaywallScreen from '../screens/owner/OwnerPaywallScreen';
import OwnerOnboardingScreen from '../screens/owner/OwnerOnboardingScreen';

// ─── Tab Screens ────────────────────────────────────────
const tabBarStyle = {
  backgroundColor: colors.bg,
  borderTopColor: colors.borderLight,
  borderTopWidth: 1,
  paddingBottom: 4,
  height: 60,
};

// --- Customer Tabs ---
const CTab = createBottomTabNavigator<CustomerTabParamList>();
function CustomerTabNavigator() {
  return (
    <CTab.Navigator screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}>
      <CTab.Screen name="HomeCustomer" component={HomeCustomerScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Início" focused={focused} /> }} />
      <CTab.Screen name="MyAppointments" component={MyAppointmentsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📅" label="Agenda" focused={focused} /> }} />
      <CTab.Screen name="History" component={HistoryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📜" label="Histórico" focused={focused} /> }} />
      <CTab.Screen name="Loyalty" component={LoyaltyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⭐" label="Fidelidade" focused={focused} /> }} />
      <CTab.Screen name="ProfileCustomer" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Perfil" focused={focused} /> }} />
    </CTab.Navigator>
  );
}

// --- Owner Tabs ---
const OTab = createBottomTabNavigator<OwnerTabParamList>();
function OwnerTabNavigator() {
  return (
    <OTab.Navigator screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}>
      <OTab.Screen name="DashboardOwner" component={DashboardOwnerScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Dashboard" focused={focused} /> }} />
      <OTab.Screen name="ServicesManagement" component={ServicesManagementScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✂️" label="Serviços" focused={focused} /> }} />
      <OTab.Screen name="TeamManagement" component={TeamScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👥" label="Equipe" focused={focused} /> }} />
      <OTab.Screen name="Reports" component={ReportsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💰" label="Relatórios" focused={focused} /> }} />
      <OTab.Screen name="SettingsOwner" component={SettingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Config" focused={focused} /> }} />
    </OTab.Navigator>
  );
}

// --- Staff Tabs ---
const STab = createBottomTabNavigator<StaffTabParamList>();
function StaffTabNavigator() {
  return (
    <STab.Navigator screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}>
      <STab.Screen name="StaffCalendar" component={StaffAreaScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Agenda" focused={focused} /> }} />
      <STab.Screen name="StaffClients" component={StaffClientsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Clientes" focused={focused} /> }} />
      <STab.Screen name="StaffChat" component={ChatListScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💬" label="Chat" focused={focused} /> }} />
      <STab.Screen name="StaffProfile" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Perfil" focused={focused} /> }} />
    </STab.Navigator>
  );
}

// ─── Auth Stack ─────────────────────────────────────────
const AStack = createNativeStackNavigator<AuthStackParamList>();
function AuthNavigator() {
  return (
    <AStack.Navigator screenOptions={{ headerShown: false }}>
      <AStack.Screen name="Login" component={LoginScreen} />
      <AStack.Screen name="OwnerSetup" component={OwnerSetupScreen} />
      <AStack.Screen name="OwnerOnboarding" component={OwnerOnboardingScreen} />
    </AStack.Navigator>
  );
}

// ─── Root Stack ─────────────────────────────────────────
const RStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ isAuthenticated, role }: { isAuthenticated: boolean; role: string | null }) {
  return (
    <RStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RStack.Screen name="Auth" component={AuthNavigator} />
      ) : role === 'dono' ? (
        <>
          <RStack.Screen name="OwnerTabs" component={OwnerTabNavigator} />
          <RStack.Screen name="Booking" component={BookingScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="ScheduleManagement" component={ScheduleManagementScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="PromotionsManagement" component={PromotionsManagementScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="InventoryManagement" component={InventoryManagementScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="StoriesManagement" component={StoriesManagementScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="RateAppointment" component={RateAppointmentScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="ReviewsList" component={ReviewsListScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="ChatList" component={ChatListScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="OwnerPaywall" component={OwnerPaywallScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="OwnerOnboarding" component={OwnerOnboardingScreen} />
          <RStack.Screen name="EditProfile" component={ProfileScreen} options={{ presentation: 'modal' }} />
        </>
      ) : role === 'funcionario' ? (
        <>
          <RStack.Screen name="StaffTabs" component={StaffTabNavigator} />
          <RStack.Screen name="RateAppointment" component={RateAppointmentScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="ReviewsList" component={ReviewsListScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="EditProfile" component={ProfileScreen} options={{ presentation: 'modal' }} />
        </>
      ) : (
        <>
          <RStack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
          <RStack.Screen name="Booking" component={BookingScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="RateAppointment" component={RateAppointmentScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="ReviewsList" component={ReviewsListScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
          <RStack.Screen name="EditProfile" component={ProfileScreen} options={{ presentation: 'modal' }} />
        </>
      )}
    </RStack.Navigator>
  );
}
