import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { RiskBar } from "@/components/RiskBar";
import { ActionCard } from "@/components/ActionCard";

const C = Colors.light;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.greeting,
          { paddingTop: Math.max(insets.top, 20) + 10 },
        ]}
      >
        <Text style={styles.greetingSub}>မင်္ဂလာနံနက်ခင်း</Text>
        <Text style={styles.greetingName}>ဦးအောင်လွင်</Text>
        <Text style={styles.greetingFarm}>ပဲ သီးနှံ · ညောင်ဦးမြို့နယ် · ပင်ပြင်ဆင်ချိန်</Text>
      </View>

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
          <Text style={[styles.modVal, { color: C.blue }]}>9,200</Text>
          <Text style={styles.modSub}>မန္တလေး · ပိဿာ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modCard}
          onPress={() => router.push("/(tabs)/knowledge")}
          activeOpacity={0.8}
        >
          <View style={[styles.modDot, { backgroundColor: C.purple }]} />
          <Text style={styles.modLabel}>ညောင်ဦး Feed</Text>
          <Text style={[styles.modVal, { color: C.purple, fontSize: 13 }]}>မေးခွန်း ၃ ခု</Text>
          <Text style={styles.modSub}>ဖြေကြားမည်</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modCard}
          onPress={() => router.push("/(tabs)/knowledge")}
          activeOpacity={0.8}
        >
          <View style={[styles.modDot, { backgroundColor: C.amberDark }]} />
          <Text style={styles.modLabel}>ပိုးမွှား ID</Text>
          <Text style={[styles.modVal, { color: C.amberDark, fontSize: 13 }]}>ဓာတ်ပုံ ရိုက်ပါ</Text>
          <Text style={styles.modSub}>AI စစ်ဆေး</Text>
        </TouchableOpacity>
      </View>

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
  scroll: {
    flex: 1,
    backgroundColor: C.background,
  },
  greeting: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  greetingSub: {
    fontSize: 11,
    color: C.primaryMedium,
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  greetingFarm: {
    fontSize: 11,
    color: C.primaryMedium,
    marginTop: 2,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    marginTop: -8,
    position: "relative",
    zIndex: 1,
  },
  modCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 10,
    width: "47%",
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
});
