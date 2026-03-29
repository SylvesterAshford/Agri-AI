import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { RiskBar } from "@/components/RiskBar";
import { ActionCard } from "@/components/ActionCard";
import { MARKET_DATA, getLatestPrice, formatPrice } from "@/data/marketData";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTier, TIER_CONFIG } from "@/types/auth";

const C = Colors.light;

function getMarketPrice() {
  const item = MARKET_DATA.find((m) => m.prices.length > 0);
  if (!item) return { price: "9,200", sub: "မန္တလေး · ပိဿာ" };

  const latest = getLatestPrice(item);
  if (!latest || !latest.high) return { price: "9,200", sub: "မန္တလေး · ပိဿာ" };

  const priceStr = formatPrice(latest.high);
  const details = item.item_details.split("-")[0]?.trim() || item.item_category || "ဈေးနှုန်း";

  return { price: priceStr, sub: details };
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isExpert, isValidator, isAdmin } = useAuth();
  const marketInfo = getMarketPrice();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const tier = getUserTier(user.score || 0);
  const isExpertUser = isExpert();
  const isValidatorUser = isValidator();
  const isAdminUser = isAdmin();

  // Handle KYC verification (for validators)
  const handleKYCVerification = () => {
    Alert.alert('KYC Verification', 'Review pending applications', [
      { text: 'Cancel' },
      { text: 'Review', onPress: () => Alert.alert('KYC Queue', '3 applications pending') },
    ]);
  };

  // Handle user management (for admins)
  const handleUserManagement = () => {
    Alert.alert('User Management', 'Manage system users', [
      { text: 'Cancel' },
      { text: 'View Users', onPress: () => Alert.alert('Users', '1,247 total users') },
    ]);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Role-specific Header */}
      <View
        style={[
          styles.greeting,
          { backgroundColor: isAdminUser ? C.purple : isValidatorUser ? C.blue : isExpertUser ? C.greenDark : C.primary },
          { paddingTop: Math.max(insets.top, 20) + 10 },
        ]}
      >
        <Text style={styles.greetingSub}>
          {isAdminUser ? 'Administrator' : isValidatorUser ? 'KYC Validator' : isExpertUser ? 'Expert Farmer' : 'မင်္ဂလာနံနက်ခင်း'}
        </Text>
        <Text style={styles.greetingName}>{user.name}</Text>
        <Text style={styles.greetingMeta}>
          {user.township} · {tier === 'bronze' ? 'Bronze' : tier === 'silver' ? 'Silver' : tier === 'gold' ? 'Gold' : 'Platinum'} Tier
        </Text>
        <Text style={styles.greetingFarm}>
          Score: {user.score} · KYC: {user.kycStatus === 'approved' ? '✓ Approved' : '○ Pending'}
        </Text>
      </View>

      {/* Role-Specific Action Cards */}
      {(isValidatorUser || isAdminUser) && (
        <>
          <Text style={styles.sectionLabel}>
            {isAdminUser ? 'Administration' : isValidatorUser ? 'KYC Verification' : 'Quick Actions'}
          </Text>

          <View style={styles.roleCard}>
            {isValidatorUser && (
              <>
                <TouchableOpacity style={styles.roleAction} onPress={() => router.push('/(tabs)/verify-kyc')}>
                  <View style={[styles.roleIcon, { backgroundColor: C.blueLight }]}>
                    <Feather name="check-square" size={22} color={C.blue} />
                  </View>
                  <View style={styles.roleTextWrap}>
                    <Text style={styles.roleActionTitle}>KYC Applications</Text>
                    <Text style={styles.roleActionSub}>3 pending review</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.roleAction} onPress={() => router.push('/(tabs)/verify-kyc')}>
                  <View style={[styles.roleIcon, { backgroundColor: C.greenLight }]}>
                    <Feather name="file-text" size={22} color={C.greenDark} />
                  </View>
                  <View style={styles.roleTextWrap}>
                    <Text style={styles.roleActionTitle}>Verified Today</Text>
                    <Text style={styles.roleActionSub}>12 applications</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {isAdminUser && (
              <>
                <TouchableOpacity style={styles.roleAction} onPress={handleUserManagement}>
                  <View style={[styles.roleIcon, { backgroundColor: C.purpleLight }]}>
                    <Feather name="users" size={22} color={C.purple} />
                  </View>
                  <View style={styles.roleTextWrap}>
                    <Text style={styles.roleActionTitle}>User Management</Text>
                    <Text style={styles.roleActionSub}>1,247 total users</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.roleAction}>
                  <View style={[styles.roleIcon, { backgroundColor: C.amberLight }]}>
                    <Feather name="shield" size={22} color={C.amberDark} />
                  </View>
                  <View style={styles.roleTextWrap}>
                    <Text style={styles.roleActionTitle}>System Status</Text>
                    <Text style={styles.roleActionSub}>95% uptime</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: C.greenLight }]}>
                    <Text style={[styles.badgeText, { color: C.greenDark }]}>✓</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.roleAction}>
                  <View style={[styles.roleIcon, { backgroundColor: C.blueLight }]}>
                    <Feather name="activity" size={22} color={C.blue} />
                  </View>
                  <View style={styles.roleTextWrap}>
                    <Text style={styles.roleActionTitle}>Permissions</Text>
                    <Text style={styles.roleActionSub}>Manage access</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/knowledge')}>
          <View style={[styles.statIcon, { backgroundColor: C.redLight }]}>
            <Feather name="message-circle" size={20} color={C.red} />
          </View>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/market')}>
          <View style={[styles.statIcon, { backgroundColor: C.blueLight }]}>
            <Feather name="trending-up" size={20} color={C.blue} />
          </View>
          <Text style={styles.statValue}>{marketInfo.price}</Text>
          <Text style={styles.statLabel}>Price</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/climate')}>
          <View style={[styles.statIcon, { backgroundColor: C.amberLight }]}>
            <Feather name="cloud" size={20} color={C.amberDark} />
          </View>
          <Text style={styles.statValue}>78%</Text>
          <Text style={styles.statLabel}>Rain</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/profile')}>
          <View style={[styles.statIcon, { backgroundColor: C.purpleLight }]}>
            <Feather name="award" size={20} color={C.purple} />
          </View>
          <Text style={styles.statValue}>{user.score || 0}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </TouchableOpacity>
      </View>

      {/* Main Action Cards */}
      <View style={styles.cardGrid}>
        <TouchableOpacity
          style={styles.modCard}
          onPress={() => router.push("/(tabs)/climate")}
          activeOpacity={0.8}
        >
          <View style={[styles.modDot, { backgroundColor: C.red }]} />
          <Text style={styles.modLabel}>ရာသီဥတု</Text>
          <Text style={[styles.modVal, { color: C.red }]}>78%</Text>
          <Text style={styles.modSub}>ရေကြီးနိုင်ချေ မြင့်</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modCard}
          onPress={() => router.push("/(tabs)/market")}
          activeOpacity={0.8}
        >
          <View style={[styles.modDot, { backgroundColor: C.blue }]} />
          <Text style={styles.modLabel}>ဈေးနှုန်း</Text>
          <Text style={[styles.modVal, { color: C.blue }]}>{marketInfo.price}</Text>
          <Text style={styles.modSub}>{marketInfo.sub}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modCard}
          onPress={() => router.push("/(tabs)/knowledge")}
          activeOpacity={0.8}
        >
          <View style={[styles.modDot, { backgroundColor: C.purple }]} />
          <Text style={styles.modLabel}>Community</Text>
          <Text style={[styles.modVal, { color: C.purple, fontSize: 13 }]}>24 Posts</Text>
          <Text style={styles.modSub}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modCard}
          onPress={() => router.push("/(tabs)/knowledge")}
          activeOpacity={0.8}
        >
          <View style={[styles.modDot, { backgroundColor: C.amberDark }]} />
          <Text style={styles.modLabel}>ပိုးမွှား</Text>
          <Text style={[styles.modVal, { color: C.amberDark, fontSize: 13 }]}>ID</Text>
          <Text style={styles.modSub}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ယနေ့ အရေးပေါ် သတိပေးချက်</Text>
        <RiskBar
          score={78}
          label="ရေကြီးနိုင်ချေ မြင့်မား"
          sublabel="ပင်ပြင်ဆင်ချိန် · ပိုးကျနိုင်ချေ ပါ မြင့်သည်"
          badge="အရေးပေါ်"
          badgeNote="ယနေ့ ၅:၃၀ မနက်"
        />
        <ActionCard
          title="ဘာလုပ်မလဲ"
          steps={[
            { num: "၁", text: "ယာခင်းရေ ၃၀% ဆင်းအောင် ဖွင့်ပေးပါ" },
            { num: "၂", text: "မြောက်ကွက် ကို ဦးဆုံး ရိတ်သိမ်းပါ" },
            { num: "၃", text: "ပူးတွဲ ဆက်သွယ်ပြီး သယ်ယူပြောင်းရွှေ့ပါ" },
          ]}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: C.background,
  },
  greeting: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  greetingSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  greetingMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  greetingFarm: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  roleCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  roleAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  roleTextWrap: {
    flex: 1,
  },
  roleActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
  roleActionSub: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: C.redLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.red,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
  },
  statLabel: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    marginTop: -8,
  },
  modCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 14,
    minHeight: 80,
  },
  modDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  modLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: C.textSecondary,
    marginBottom: 4,
  },
  modVal: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 1,
  },
  modSub: {
    fontSize: 10,
    color: C.textSecondary,
  },
  section: {
    padding: 12,
    gap: 10,
  },
  loadingText: {
    color: C.textSecondary,
  },
});
