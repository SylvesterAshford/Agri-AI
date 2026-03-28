import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function ProfileScreen() {
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifMarket, setNotifMarket] = useState(true);
  const [notifPest, setNotifPest] = useState(true);
  const [langMm, setLangMm] = useState(true);
  const [shareData, setShareData] = useState(true);

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + 10 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>ဦအ</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>ဦးအောင်လွင်</Text>
          <View style={styles.verifiedRow}>
            <Feather name="check-circle" size={12} color={C.primary} />
            <Text style={styles.verifiedText}>တောင်သူ စစ် · OTP အတည်ပြုပြီး</Text>
          </View>
          <Text style={styles.profileMeta}>ညောင်ဦးမြို့နယ် · ရာသီ ၇ ကြာ</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>ကျွန်ုပ် ခြံမြေ</Text>
      <View style={styles.card}>
        {[
          { icon: "layers" as const, label: "သီးနှံ", value: "ပဲ (Groundnut)" },
          { icon: "map-pin" as const, label: "မြို့နယ်", value: "ညောင်ဦး" },
          { icon: "maximize-2" as const, label: "ဧကကျယ်ဝန်း", value: "၁၂ ဧက" },
          { icon: "calendar" as const, label: "စိုက်ချိန်", value: "ဇန်နဝါရီ ၁၅ (၇ ဆင့်ပြီး)" },
        ].map((item, i) => (
          <View key={i} style={[styles.farmRow, i < 3 && styles.farmRowBorder]}>
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
        <TouchableOpacity style={styles.editFarmBtn} activeOpacity={0.8}>
          <Text style={styles.editFarmText}>ခြံမြေ ပြင်ဆင်မည်</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>AI ရဲ့ ဆောင်ရွက်ချက်</Text>
      <View style={styles.card}>
        <View style={styles.aiStatsRow}>
          <View style={styles.aiStat}>
            <Text style={styles.aiStatVal}>ဆင့် ၇</Text>
            <Text style={styles.aiStatLabel}>သီးနှံ ကြီးထွားမှု</Text>
          </View>
          <View style={styles.aiStatDivider} />
          <View style={styles.aiStat}>
            <Text style={styles.aiStatVal}>၈၃%</Text>
            <Text style={styles.aiStatLabel}>ခန့်မှန်း တိကျမှု</Text>
          </View>
          <View style={styles.aiStatDivider} />
          <View style={styles.aiStat}>
            <Text style={styles.aiStatVal}>ရက် ၄၅</Text>
            <Text style={styles.aiStatLabel}>ရိတ်သိမ်းချိန်</Text>
          </View>
        </View>
      </View>

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

      <Text style={styles.sectionLabel}>ဘာသာစကား</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>မြန်မာဘာသာ</Text>
            <Text style={styles.toggleSub}>Zawgyi / Unicode ရွေးချယ်မှု</Text>
          </View>
          <Switch
            value={langMm}
            onValueChange={setLangMm}
            trackColor={{ false: "#E0DED8", true: C.primaryLight }}
            thumbColor={langMm ? C.primary : "#f4f3f4"}
            ios_backgroundColor="#E0DED8"
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>ဒေတာ မျှဝေမှု</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>မသိမသာ မျှဝေမည်</Text>
            <Text style={styles.toggleSub}>AI မော်ဒယ် ပိုမိုတိကျစေရန် ကူညီသည် · ကိုယ်ရေး အချက်အလက် မပါ</Text>
          </View>
          <Switch
            value={shareData}
            onValueChange={setShareData}
            trackColor={{ false: "#E0DED8", true: C.primaryLight }}
            thumbColor={shareData ? C.primary : "#f4f3f4"}
            ios_backgroundColor="#E0DED8"
          />
        </View>
        {shareData && (
          <View style={styles.dataShareInfo}>
            <Feather name="shield" size={12} color={C.primary} />
            <Text style={styles.dataShareText}>
              ယာခင်းကျယ်ဝန်း၊ ရာသီဥတု ဖြစ်ရပ်၊ ဈေးနှုန်း သာ မျှဝေသည် — နာမည်မပါ
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
        <Feather name="log-out" size={15} color={C.textSecondary} />
        <Text style={styles.logoutText}>ထွက်မည်</Text>
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.primary,
  },
  avatarLargeText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: C.primary,
    fontWeight: "500",
  },
  profileMeta: {
    fontSize: 11,
    color: C.textSecondary,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
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
    letterSpacing: 0.3,
  },
  farmValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: "600",
    marginTop: 1,
  },
  editFarmBtn: {
    margin: 12,
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    alignItems: "center",
  },
  editFarmText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
  },
  aiStatsRow: {
    flexDirection: "row",
    padding: 16,
  },
  aiStat: {
    flex: 1,
    alignItems: "center",
  },
  aiStatVal: {
    fontSize: 18,
    fontWeight: "700",
    color: C.primary,
  },
  aiStatLabel: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 3,
    textAlign: "center",
  },
  aiStatDivider: {
    width: 0.5,
    backgroundColor: C.border,
    marginVertical: 4,
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
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 15,
  },
  dataShareInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: C.primaryLight,
    margin: 12,
    marginTop: 0,
    borderRadius: 8,
    padding: 10,
  },
  dataShareText: {
    fontSize: 11,
    color: C.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    backgroundColor: C.card,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
