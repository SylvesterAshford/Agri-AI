import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { FeedCard, FeedPost } from "@/components/FeedCard";

const C = Colors.light;

const FILTERS = ["အားလုံး", "ပိုးမွှား", "ရေကြီး", "ဈေးနှုန်း", "အကြံပြု", "မေးခွန်း", "မျိုးစေ့"];

const POSTS: FeedPost[] = [
  {
    id: "1",
    avatarText: "DR",
    avatarColor: C.purpleLight,
    avatarTextColor: C.purpleDark,
    authorName: "ဒေါ်သိဒ္ဓာ",
    authorBadge: "ဦးစီးဌာန စစ်",
    authorBadgeBg: C.purpleLight,
    authorBadgeColor: C.purple,
    authorMeta: "စိုက်ပျိုးရေး ဦးစီးဌာန · ၁ နာရီ",
    body: "မ ကိုကိုထံ ဖြေကြားချက် — မြောက်ဒေသတွင် ရေကြီးနိုင်ချေ ရှိပါက ရင့်မှည့်ချိန် ၇ ရက်ကျော် ကျန်သေးသောအခါ ပိုတက်စီယမ် ဓာတ်မြေဩဇာ လောင်းပေးပါ",
    tags: [
      { label: "ကျွမ်းကျင်သူ", bg: C.purpleLight, color: C.purple },
      { label: "ရေကြီး", bg: C.blueLight, color: C.blue },
      { label: "စပါး", bg: C.surface, color: "#5F5E5A" },
    ],
    isPinned: true,
    helpful: 61,
    aiChip: {
      label: "AI ဗဟုသုတ Loop",
      text: "ဤအကြံပြုချက်သည် ၂၀ ရာသီ ဒေတာမှ သင်ယူပြီး တောင်သူ ၁၂ ဦး၏ ဖြေကြားချက် အတည်ပြုမှုနှင့် ကိုက်ညီသည်",
      conf: "ယုံကြည်မှု 94%",
    },
    loopBar: "တောင်သူ ၆၁ ဦး 'အသုံးဝင်' — Model ပြန်သင်ယူမှုတွင် ထည့်သွင်းမည်",
  },
  {
    id: "2",
    avatarText: "ဦအ",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးအောင်လွင်",
    authorBadge: "တောင်သူ စစ်",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "မြောက်ဘက် · ၂ နာရီ",
    body: "ပဲခင်းမှာ မွှားပင့်ကူ တွေ့ပါသည် — တစ်ခင်းလုံး ပျံ့နှံ့နေပြီ။ ဘာဆေးပတ်ဖျန်းရမလဲ?",
    tags: [
      { label: "ပိုးမွှား အတည်", bg: C.redLight, color: C.redDark },
      { label: "ပဲ", bg: C.amberLight, color: C.amberDark },
    ],
    alertText: "ညောင်ဦး ပဲတောင်သူ ၃၄၀ ဦးကို သတိပေးချက် ပေးပို့ပြီး",
    helpful: 24,
    leftBorderColor: C.red,
  },
  {
    id: "3",
    avatarText: "ဒလ",
    avatarColor: C.purpleLight,
    avatarTextColor: C.purple,
    authorName: "ဒေါ်လင်းဇာနီ",
    authorBadge: "ဦးစီးဌာန",
    authorBadgeBg: C.purpleLight,
    authorBadgeColor: C.purple,
    authorMeta: "စိုက်ပျိုးရေး ဦးစီးဌာန · ၁ နာရီ",
    body: "မွှားပင့်ကူ နိုင်မယ်! နေမဆေးရည် + ဆပ်ပြာရည် ၁:၁ ရောပြီး မနက်ဖြန် မနက်ဖျန်းပါ",
    tags: [
      { label: "ကျွမ်းကျင်သူ အဖြေ", bg: C.purpleLight, color: C.purple },
      { label: "စစ်ဆေးပြီး", bg: C.greenLight, color: C.greenDark },
    ],
    helpful: 61,
  },
  {
    id: "4",
    avatarText: "စဝ",
    avatarColor: C.greenLight,
    avatarTextColor: C.greenDark,
    authorName: "စုဝေး",
    authorMeta: "တောင်ဘက် · ၅ နာရီ",
    body: "ငရုတ်ကောင်းမျိုး အရွက်တွေ ဝါလာနေတယ် — မဘာကြောင့်လဲ?",
    tags: [
      { label: "မေးခွန်း", bg: C.amberLight, color: C.amberDeep },
      { label: "ငရုတ်", bg: C.amberLight, color: C.amberDark },
    ],
  },
  {
    id: "5",
    avatarText: "AI",
    avatarColor: C.primaryLight,
    avatarTextColor: C.primaryDark,
    authorName: "AgriShield AI",
    authorBadge: "Auto Digest",
    authorBadgeBg: C.primaryLight,
    authorBadgeColor: C.primaryDark,
    authorMeta: "ဒေသ ဗဟုသုတ အချုပ် · နေ့စဉ် ည ၉ နာရီ",
    body: "ညောင်ဦး · ယနေ့ ဗဟုသုတ အချုပ် — ရေကြီးမှု အတည်ပြုချက် ၃ ဦး · မေးခွန်း ၅ ခု AI ဖြေကြားပြီး · ဗဟုသုတ Record ၃ ခု ထပ်တိုး",
    tags: [
      { label: "AI Digest", bg: C.purpleLight, color: C.purple },
      { label: "ဗဟုသုတ Pool", bg: C.primaryLight, color: C.primaryDark },
    ],
    helpful: 47,
    loopBar: "ဤ Digest သည် ဗဟုသုတ Pool မှ auto-generate ဖြစ်သည် · Model တွင် ထည့်သွင်းပြီ",
  },
];

interface PestResultProps {
  onDismiss: () => void;
}

function PestResult({ onDismiss }: PestResultProps) {
  return (
    <View style={styles.pestOverlay}>
      <View style={styles.pestCard}>
        <View style={styles.pestPhotoArea}>
          <Text style={styles.pestPhotoLabel}>ပဲ အရွက် — AI စစ်ဆေးပြီး</Text>
          <View style={styles.pestConf}>
            <Text style={styles.pestConfText}>ယုံကြည်မှု 91%</Text>
          </View>
          <TouchableOpacity style={styles.pestClose} onPress={onDismiss}>
            <Feather name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.pestBody}>
          <Text style={styles.pestName}>မွှားပင့်ကူ</Text>
          <Text style={styles.pestSci}>Tetranychus urticae · Spider mite</Text>
          <Text style={styles.pestDesc}>
            မိုးခေါင်ချိန် ပင်ပြင်ဆင်ချိန်မှာ ဖြစ်တတ်သည်။ မြန်မြန် ကုသမှုမရှိပါက တစ်ခင်းလုံး ပြန့်နှံ့မည်။
          </Text>
          <View style={styles.treatment}>
            <Text style={styles.treatLabel}>ကုသနည်း (ဆိုင်မဆိုင် မမေးဘဲ)</Text>
            {[
              "နေမဆေးရည် ၃ မီလီ + ရေ ၁ လီတာ ရောပါ",
              "မနက် ၆–၈ နာရီ ကြားတွင် ဖျန်းပါ",
              "ရက် ၃ ကြာ ပြန်စစ်ဆေးပါ",
            ].map((step, i) => (
              <View key={i} style={styles.treatStep}>
                <Text style={styles.treatArrow}>→</Text>
                <Text style={styles.treatText}>{step}</Text>
              </View>
            ))}
          </View>
          <View style={styles.pestActions}>
            <TouchableOpacity style={styles.pestActionPrimary} onPress={onDismiss}>
              <Text style={styles.pestActionPrimaryText}>Feed မှာ မျှဝေမည်</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pestActionSecondary} onPress={onDismiss}>
              <Text style={styles.pestActionSecondaryText}>ကျွမ်းကျင်သူ မေးမည်</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function KnowledgeScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [showPestResult, setShowPestResult] = useState(false);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.topbar, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.topTitle}>ညောင်ဦး ဗဟုသုတ Feed</Text>
            <Text style={styles.topMeta}>ပဲတောင်သူ · ၃၄၀ ဦး · AI + ကျွမ်းကျင်သူ + တောင်သူ</Text>
          </View>
          <TouchableOpacity
            style={styles.cameraFab}
            onPress={() => setShowPestResult(true)}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.cameraFabLabel}>ပိုးမွှား ID</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.filterPill, activeFilter === i && { backgroundColor: "#1A1917" }]}
              onPress={() => setActiveFilter(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === i && { color: "#fff" }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.pestIdBanner}
          onPress={() => setShowPestResult(true)}
          activeOpacity={0.85}
        >
          <View style={styles.pestIdLeft}>
            <View style={styles.pestIdIconWrap}>
              <Feather name="camera" size={20} color={C.primary} />
            </View>
            <View>
              <Text style={styles.pestIdTitle}>ပိုးမွှား စစ်ဆေးမည်</Text>
              <Text style={styles.pestIdSub}>ဓာတ်ပုံ ရိုက်ပြီး AI ချက်ချင်း စစ်ဆေးမည်</Text>
            </View>
          </View>
          <View style={styles.pestIdRight}>
            <View style={[styles.corner, { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 }]} />
            <Feather name="chevron-right" size={16} color={C.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primary }]} />
            <Text style={styles.legendText}>AI ဖြေ</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.greenLight, borderWidth: 1, borderColor: C.greenMedium }]} />
            <Text style={styles.legendText}>တောင်သူ စစ်</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.purpleLight, borderWidth: 1, borderColor: C.purple }]} />
            <Text style={styles.legendText}>ဦးစီးဌာန</Text>
          </View>
        </View>

        {POSTS.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </ScrollView>

      {showPestResult && <PestResult onDismiss={() => setShowPestResult(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    backgroundColor: C.card,
    paddingTop: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  topMeta: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 1,
  },
  cameraFab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cameraFabLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8E4DC",
    backgroundColor: C.card,
    marginRight: 4,
  },
  filterText: {
    fontSize: 11,
    fontWeight: "500",
    color: C.textSecondary,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: 12,
    gap: 10,
    paddingBottom: 100,
  },
  pestIdBanner: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pestIdLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pestIdIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  pestIdTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },
  pestIdSub: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 1,
  },
  pestIdRight: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 10,
    height: 10,
    borderColor: C.primary,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  pestOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  pestCard: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  pestPhotoArea: {
    height: 120,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pestPhotoLabel: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pestConf: {
    position: "absolute",
    top: 10,
    right: 12,
    backgroundColor: C.greenLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pestConfText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.greenDark,
  },
  pestClose: {
    position: "absolute",
    top: 10,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  pestBody: {
    padding: 16,
    paddingBottom: 32,
  },
  pestName: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    color: C.text,
  },
  pestSci: {
    fontSize: 11,
    color: C.textSecondary,
    fontStyle: "italic",
    marginBottom: 8,
  },
  pestDesc: {
    fontSize: 12,
    color: "#555",
    lineHeight: 22,
    paddingTop: 2,
    marginBottom: 12,
  },
  treatment: {
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  treatLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5F5E5A",
    marginBottom: 8,
  },
  treatStep: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 5,
  },
  treatArrow: {
    fontSize: 12,
    color: C.primary,
    fontWeight: "700",
  },
  treatText: {
    fontSize: 12,
    color: C.text,
    flex: 1,
    lineHeight: 22,
    paddingTop: 2,
  },
  pestActions: {
    flexDirection: "row",
    gap: 10,
  },
  pestActionPrimary: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  pestActionPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  pestActionSecondary: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: C.border,
  },
  pestActionSecondaryText: {
    fontSize: 13,
    color: "#555",
  },
});
