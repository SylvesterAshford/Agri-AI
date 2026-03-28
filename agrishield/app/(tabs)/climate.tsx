import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { RiskBar } from "@/components/RiskBar";
import { ActionCard } from "@/components/ActionCard";

const C = Colors.light;

const FORECAST = [
  { day: "ယနေ့", color: C.red, pct: "78%", isToday: true },
  { day: "မနက်ဖြန်", color: C.amber, pct: "65%", isToday: false },
  { day: "ကြာသပ", color: C.amber, pct: "58%", isToday: false },
  { day: "သောကြာ", color: C.greenMedium, pct: "30%", isToday: false },
  { day: "စနေ", color: C.greenMedium, pct: "22%", isToday: false },
  { day: "တနင်္ဂနွေ", color: C.greenMedium, pct: "18%", isToday: false },
];

export default function ClimateScreen() {
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ရာသီဥတု ကာကွယ်မှု</Text>
          <Text style={styles.headerSub}>ညောင်ဦးမြို့နယ် · ၁၄ ရက် ခန့်မှန်းချက်</Text>
        </View>
        <Text style={styles.headerDate}>ယနေ့</Text>
      </View>

      <RiskBar
        score={78}
        label="ပဲ သီးနှံ · ပင်ပြင်ဆင်ချိန်"
        sublabel="ပိုးကျနိုင်ချေ ၅ ရက်အတွင်း မြင့်မားလာမည်"
        badge="ရေကြီး — မြင့်"
        badgeNote="ယုံကြည်မှု 78%"
      />

      <Text style={styles.sectionLabel}>၁၄ ရက် ခန့်မှန်းချက်</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
        {FORECAST.map((item, i) => (
          <View key={i} style={[styles.dayPill, item.isToday && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={[styles.dayName, item.isToday && { color: C.primaryMedium }]}>{item.day}</Text>
            <View style={[styles.dayDot, { backgroundColor: item.color }]} />
            <Text style={[styles.dayTemp, item.isToday && { color: C.primaryLight }]}>{item.pct}</Text>
          </View>
        ))}
      </ScrollView>

      <ActionCard
        title="အခုလုပ်ရမည့် ၃ ဆင့်"
        steps={[
          { num: "၁", text: "ယာခင်းရေ ၃၀% ဆင်းအောင် ဖွင့်ပေးပါ — ယနေ့ပင်" },
          { num: "၂", text: "ပိုတက်စီယမ် ဓာတ်မြေဩဇာ လောင်းပေးပါ" },
          { num: "၃", text: "မြောက်ကွက် ကို ၄၈ နာရီအတွင်း ရိတ်သိမ်းပါ" },
        ]}
      />

      <View style={styles.otherRisks}>
        <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>အခြားအန္တရာယ်များ</Text>
        <View style={styles.riskRow}>
          <View style={[styles.riskMini, { backgroundColor: C.greenLight }]}>
            <Text style={[styles.riskMiniVal, { color: C.greenDark }]}>22%</Text>
            <Text style={[styles.riskMiniLabel, { color: C.greenDeep }]}>မိုးခေါင်</Text>
          </View>
          <View style={[styles.riskMini, { backgroundColor: C.amberLight }]}>
            <Text style={[styles.riskMiniVal, { color: C.amberDark }]}>54%</Text>
            <Text style={[styles.riskMiniLabel, { color: C.amberDeep }]}>ပိုးကျ</Text>
          </View>
          <View style={[styles.riskMini, { backgroundColor: C.greenLight }]}>
            <Text style={[styles.riskMiniVal, { color: C.greenDark }]}>15%</Text>
            <Text style={[styles.riskMiniLabel, { color: C.greenDeep }]}>အပူ</Text>
          </View>
        </View>
      </View>
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
  header: {
    backgroundColor: C.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  headerSub: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 1,
  },
  headerDate: {
    fontSize: 11,
    color: C.textSecondary,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  forecastScroll: {
    flexGrow: 0,
  },
  dayPill: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: C.card,
    borderWidth: 0.5,
    borderColor: C.border,
    minWidth: 52,
    marginRight: 6,
  },
  dayName: {
    fontSize: 9,
    color: C.textSecondary,
    marginBottom: 4,
  },
  dayDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  dayTemp: {
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  otherRisks: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  riskRow: {
    flexDirection: "row",
    gap: 6,
  },
  riskMini: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  riskMiniVal: {
    fontSize: 18,
    fontWeight: "700",
  },
  riskMiniLabel: {
    fontSize: 9,
    marginTop: 2,
  },
});
