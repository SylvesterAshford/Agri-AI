import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTier, TIER_CONFIG, getMaxLoanAmount } from "@/types/auth";

const C = Colors.light;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isExpert, isValidator, isAdmin } = useAuth();

  const [notifWeather, setNotifWeather] = React.useState(true);
  const [notifMarket, setNotifMarket] = React.useState(true);
  const [notifPest, setNotifPest] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  const tier = getUserTier(user.score);
  const tierConfig = TIER_CONFIG[tier];
  const maxLoan = getMaxLoanAmount(user.score);

  // Get role badge
  const getRoleBadge = () => {
    if (isAdmin()) {
      return { label: 'Admin', color: C.purple, bg: C.purpleLight, icon: 'shield' as const };
    }
    if (isValidator()) {
      return { label: 'Validator', color: C.blue, bg: C.blueLight, icon: 'check-square' as const };
    }
    if (isExpert()) {
      return { label: 'Expert', color: C.greenDark, bg: C.greenLight, icon: 'award' as const };
    }
    return { label: 'Farmer', color: C.amberDark, bg: C.amberLight, icon: 'user' as const };
  };

  const roleBadge = getRoleBadge();

  // Get KYC status badge
  const getKYCStatusBadge = () => {
    switch (user.kycStatus) {
      case 'approved':
        return { label: 'KYC Approved', color: C.greenDark, bg: C.greenLight };
      case 'pending':
        return { label: 'KYC Pending', color: C.amberDark, bg: C.amberLight };
      case 'rejected':
        return { label: 'KYC Rejected', color: C.red, bg: C.redLight };
      default:
        return { label: 'KYC Not Submitted', color: C.textSecondary, bg: C.surface };
    }
  };

  const kycBadge = getKYCStatusBadge();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + 10 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Profile Header with Role Badge */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatarLarge, { borderColor: roleBadge.color }]}>
          <Text style={[styles.avatarLargeText, { color: roleBadge.color }]}>{user.name.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{user.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
              <Feather name={roleBadge.icon} size={10} color={roleBadge.color} />
              <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
            </View>
          </View>
          <View style={styles.verifiedRow}>
            <Feather name="check-circle" size={12} color={C.primary} />
            <Text style={styles.verifiedText}>
              {user.township} · {user.role === 'farmer' ? 'တောင်သူ' : user.role === 'expert' ? 'ကျွမ်းကျင်သူ' : user.role === 'validator' ? 'စိစစ်ရေး' : 'အက်ဒမင်'}
            </Text>
          </View>
          <View style={styles.kycRow}>
            <View style={[styles.kycBadge, { backgroundColor: kycBadge.bg }]}>
              <Text style={[styles.kycBadgeText, { color: kycBadge.color }]}>{kycBadge.label}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Score and Tier Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreLabel}>Credit Score</Text>
          <View style={[styles.tierBadge, { backgroundColor: tier === 'gold' || tier === 'platinum' ? C.amberLight : C.surface }]}>
            <Text style={[styles.tierText, { color: tier === 'gold' || tier === 'platinum' ? C.amberDark : C.textSecondary }]}>
              {tierConfig.label} Tier
            </Text>
          </View>
        </View>

        <Text style={styles.scoreValue}>{user.score}</Text>
        <View style={styles.scoreTrack}>
          <View
            style={[
              styles.scoreFill,
              {
                width: `${(user.score / 1000) * 100}%`,
                backgroundColor: user.score >= 300 ? C.amber : C.textSecondary,
              },
            ]}
          />
        </View>
        <View style={styles.scoreRange}>
          <Text style={styles.scoreRangeText}>0</Text>
          <Text style={styles.scoreRangeText}>1000</Text>
        </View>

        {/* Requirements */}
        {user.score < 300 && user.role === 'farmer' && (
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Expert အတွက် လိုအပ်ချက်များ:</Text>
            <View style={styles.requirementItem}>
              <Feather name={user.score >= 0 ? "check-circle" : "circle"} size={14} color={C.greenDark} />
              <Text style={styles.requirementText}>Score ≥ 300 points</Text>
            </View>
            <View style={styles.requirementItem}>
              <Feather name={user.kycStatus === 'approved' ? "check-circle" : "circle"} size={14} color={C.greenDark} />
              <Text style={styles.requirementText}>KYC Approved</Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.score}</Text>
          <Text style={styles.statLabel}>Credit Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{(maxLoan / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Max Loan</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tierConfig.label}</Text>
          <Text style={styles.statLabel}>Tier</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.kycStatus === 'approved' ? '✓' : '○'}</Text>
          <Text style={styles.statLabel}>KYC</Text>
        </View>
      </View>

      {/* KYC Action Button (Only for Farmers and Experts) */}
      {(user.role === 'farmer' || user.role === 'expert') && (
        <TouchableOpacity
          style={styles.kycButton}
          onPress={() => router.push('/(tabs)/kyc')}
        >
          <View style={styles.kycButtonContent}>
            <Feather name="file-text" size={20} color={C.primary} />
            <View style={styles.kycButtonText}>
              <Text style={styles.kycButtonTitle}>KYC စီမံခန့်ခွဲမှု</Text>
              <Text style={styles.kycButtonSubtitle}>Credit Score တွက်ချက်ရန်</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={C.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Farm Info Card */}
      <Text style={styles.sectionLabel}>ခြံမြေ အချက်အလက်</Text>
      <View style={styles.card}>
        {[
          { icon: "layers" as const, label: "သီးနှံ", value: "ပဲ (Groundnut)" },
          { icon: "map-pin" as const, label: "မြို့နယ်", value: user.township },
          { icon: "maximize-2" as const, label: "ဧကကျယ်ဝန်း", value: "၁၂ ဧက" },
        ].map((item, i) => (
          <View key={i} style={[styles.farmRow, i < 2 && styles.farmRowBorder]}>
            <View style={styles.farmIconWrap}>
              <Feather name={item.icon} size={15} color={C.primary} />
            </View>
            <View style={styles.farmRowText}>
              <Text style={styles.farmLabel}>{item.label}</Text>
              <Text style={styles.farmValue}>{item.value}</Text>
            </View>
            <Feather name="chevron-right" size={14} color={C.textSecondary} />
          </View>
        ))}
      </View>

      {/* Notifications */}
      <Text style={styles.sectionLabel}>သတိပေးချက် ထိန်းချုပ်မှု</Text>
      <View style={styles.card}>
        {[
          { label: "ရာသီဥတု သတိပေးချက်", sub: "မနက် ၅:၃၀ SMS + App", value: notifWeather, onChange: setNotifWeather },
          { label: "ဈေးနှုန်း အပ်ဒိတ်", sub: "နေ့စဉ် မနက် ၈ နာရီ", value: notifMarket, onChange: setNotifMarket },
          { label: "ပိုးမွှား သတိပေးချက်", sub: "ဒေသ တောင်သူ မျှဝေမှု", value: notifPest, onChange: setNotifPest },
        ].map((item, i) => (
          <View key={i} style={[styles.toggleRow, i < 2 && styles.toggleRowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>{item.label}</Text>
              <Text style={styles.toggleSub}>{item.sub}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onChange}
              trackColor={{ false: "#E0DED8", true: C.primaryLight }}
              thumbColor={item.value ? C.primary : "#f4f3f4"}
              ios_backgroundColor="#E0DED8"
            />
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
        <Feather name="log-out" size={15} color={C.red} />
        <Text style={[styles.logoutText, { color: C.red }]}>ထွက်မည်</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 12,
    gap: 10,
    paddingBottom: 100,
  },
  profileHeader: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    lineHeight: 34,
    paddingVertical: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dataShareText: {
    fontSize: 12,
    color: C.primaryDark,
    flex: 1,
    lineHeight: 26,
    paddingVertical: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: C.primary,
    fontWeight: "500",
  },
  kycRow: {
    marginTop: 6,
  },
  kycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  kycBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  scoreCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 16,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 10,
    fontWeight: "700",
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "700",
    color: C.text,
    marginTop: 8,
  },
  scoreTrack: {
    height: 8,
    backgroundColor: C.surface,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 12,
  },
  scoreFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  scoreRangeText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  requirementsCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  requirementsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: C.text,
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 11,
    color: C.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: C.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
  },
  statLabel: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 8,
    lineHeight: 24,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    overflow: "hidden",
  },
  farmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  farmRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  farmIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  farmRowText: {
    flex: 1,
  },
  farmLabel: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  farmValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: "600",
    marginTop: 2,
  },
  kycButton: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kycButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kycButtonText: {
    flexDirection: "column",
  },
  kycButtonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
  kycButtonSubtitle: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  toggleRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    lineHeight: 30,
    paddingVertical: 6,
  },
  toggleSub: {
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 24,
    paddingVertical: 4,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.red,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
