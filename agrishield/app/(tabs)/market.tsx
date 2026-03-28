import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const C = Colors.light;

const CROPS = ["ပဲ", "စပါး", "နှမ်း", "ပြောင်း"];

const MARKETS = [
  { name: "မန္တလေး", dist: "ကီလိုမီတာ ၁၈၀ · ★★★★★", price: "9,200", trend: "↑ 8%", trendColor: C.greenDark, isBest: true, dotColor: C.blue },
  { name: "မကွေး", dist: "ကီလိုမီတာ ၉၀ · ★★★★", price: "8,500", trend: "↑ 3%", trendColor: C.greenDark, isBest: false, dotColor: "#639922" },
  { name: "မုံရွာ", dist: "ကီလိုမီတာ ၁၂၀ · ★★★", price: "8,100", trend: "↓ 1%", trendColor: C.redDark, isBest: false, dotColor: "#888" },
  { name: "ညောင်ဦး (ဒေသ)", dist: "ကီလိုမီတာ ၀ · ★★★", price: "6,800", trend: "↓ 2%", trendColor: C.redDark, isBest: false, isLocal: true, dotColor: C.red },
];

const CHART_BARS = [40, 50, 60, 65, 72, 82, 88, 90];

export default function MarketScreen() {
  const [activeCrop, setActiveCrop] = useState(0);
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
        <Text style={styles.headerTitle}>ဈေးကွက် မျက်မှန်</Text>
        <Text style={styles.headerSub}>မြို့ပေါင်းစုံ ဈေးနှုန်း နှိုင်းယှဉ်</Text>
      </View>

      <View style={styles.priceHero}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropTabsScroll}>
          {CROPS.map((crop, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.cropTab, activeCrop === i && { backgroundColor: C.blue, borderColor: C.blue }]}
              onPress={() => setActiveCrop(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cropTabText, activeCrop === i && { color: "#E6F1FB" }]}>{crop}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bestPriceRow}>
          <View>
            <Text style={styles.bestLabel}>အကောင်းဆုံး ဈေးနှုန်း</Text>
            <View style={styles.bestNumRow}>
              <Text style={styles.bestNum}>9,200</Text>
              <Text style={styles.bestUnit}>ကျပ်/ပိဿာ</Text>
            </View>
            <Text style={styles.bestMarket}>မန္တလေး ပွဲရုံ · ကြာသပတေး</Text>
            <View style={styles.priceUpBadge}>
              <Text style={styles.priceUpText}>↑ မနေ့ထက် 8% မြင့်</Text>
            </View>
          </View>
          <Text style={styles.crown}>👑</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>မြို့အားလုံး နှိုင်းယှဉ်ချက်</Text>

      {MARKETS.map((market, i) => (
        <View key={i} style={[styles.marketRow, market.isLocal && { borderColor: C.amberLight, borderWidth: 0.5 }]}>
          <View style={styles.marketLeft}>
            <View style={styles.marketNameRow}>
              <View style={[styles.marketDot, { backgroundColor: market.dotColor }]} />
              <Text style={styles.marketName}>{market.name}</Text>
              {market.isBest && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>အကောင်းဆုံး</Text>
                </View>
              )}
              {market.isLocal && (
                <View style={[styles.bestBadge, { backgroundColor: C.amberLight }]}>
                  <Text style={[styles.bestBadgeText, { color: C.amberDark }]}>ငါ့ဈေး</Text>
                </View>
              )}
            </View>
            <Text style={styles.marketDist}>{market.dist}</Text>
          </View>
          <View style={styles.marketRight}>
            <Text style={[styles.marketPrice, market.isLocal && { color: C.red }]}>{market.price}</Text>
            <Text style={[styles.marketTrend, { color: market.trendColor }]}>{market.trend}</Text>
          </View>
        </View>
      ))}

      <View style={styles.forecastCard}>
        <Text style={styles.forecastTitle}>၁၀ ရက် ဈေးနှုန်း ခန့်မှန်း</Text>
        <View style={styles.chartRow}>
          {CHART_BARS.map((h, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { height: (h / 100) * 50 },
                i === 2 && { backgroundColor: C.blueMedium },
                i >= 5 && { backgroundColor: C.blue },
              ]}
            />
          ))}
        </View>
        <View style={styles.forecastRec}>
          <Text style={styles.forecastRecTitle}>ကြံပြုချက်: ၇ ရက် စောင့်ပါ</Text>
          <Text style={styles.forecastRecSub}>ဈေးနှုန်း 10,500 ရောက်ဖွယ် ရှိသည်</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>ကုန်ကျစရိတ် တွက်ချက်မှု</Text>
      <View style={styles.costsCard}>
        {[
          { label: "မျိုးစေ့", value: "45,000 ကျပ်" },
          { label: "စက်ငှားခ", value: "80,000 ကျပ်" },
          { label: "ပိုးဆေး", value: "25,000 ကျပ်" },
        ].map((item, i) => (
          <View key={i} style={styles.costRow}>
            <Text style={styles.costLabel}>{item.label}</Text>
            <Text style={styles.costValue}>{item.value}</Text>
          </View>
        ))}
        <View style={styles.breakevenBar}>
          <Text style={styles.beLabel}>ပြန်ကုန်ကျ vs အကောင်းဆုံး ဈေး</Text>
          <View style={styles.beTrack}>
            <View style={styles.beFill} />
            <View style={styles.beMarker} />
          </View>
          <View style={styles.beNums}>
            <Text style={styles.beNum}>0</Text>
            <Text style={[styles.beNum, { color: C.redDark }]}>ပြန်ကုန် 5,200</Text>
            <Text style={[styles.beNum, { color: C.primary }]}>9,200</Text>
          </View>
        </View>
        <View style={styles.profitBadge}>
          <Text style={styles.profitText}>အမြတ် 77% · +370,000 ကျပ် ရနိုင်</Text>
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
  priceHero: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 14,
  },
  cropTabsScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  cropTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.border,
    marginRight: 4,
    backgroundColor: C.card,
  },
  cropTabText: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "500",
  },
  bestPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bestLabel: {
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 2,
  },
  bestNumRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bestNum: {
    fontSize: 34,
    fontWeight: "700",
    color: C.blue,
    lineHeight: 38,
  },
  bestUnit: {
    fontSize: 12,
    color: C.textSecondary,
  },
  bestMarket: {
    fontSize: 11,
    color: C.primary,
    fontWeight: "500",
    marginTop: 2,
  },
  priceUpBadge: {
    backgroundColor: C.greenLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  priceUpText: {
    fontSize: 11,
    color: C.greenDark,
    fontWeight: "500",
  },
  crown: {
    fontSize: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  marketRow: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  marketLeft: {
    flex: 1,
  },
  marketNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  marketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  marketName: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },
  bestBadge: {
    backgroundColor: C.blueLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  bestBadgeText: {
    fontSize: 9,
    color: C.blue,
    fontWeight: "600",
  },
  marketDist: {
    fontSize: 10,
    color: C.textSecondary,
    paddingLeft: 14,
  },
  marketRight: {
    alignItems: "flex-end",
  },
  marketPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  marketTrend: {
    fontSize: 10,
    fontWeight: "500",
  },
  forecastCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  forecastTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 50,
    marginBottom: 8,
  },
  bar: {
    flex: 1,
    backgroundColor: "#B5D4F4",
    borderRadius: 3,
  },
  forecastRec: {
    backgroundColor: C.greenLight,
    borderRadius: 8,
    padding: 8,
  },
  forecastRecTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.greenDark,
  },
  forecastRecSub: {
    fontSize: 11,
    color: C.greenDeep,
    marginTop: 1,
  },
  costsCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  costLabel: {
    fontSize: 11,
    color: C.textSecondary,
  },
  costValue: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text,
  },
  breakevenBar: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  beLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5F5E5A",
    marginBottom: 6,
  },
  beTrack: {
    height: 8,
    backgroundColor: "#E0DED8",
    borderRadius: 4,
    overflow: "visible",
    position: "relative",
    marginBottom: 4,
  },
  beFill: {
    height: 8,
    width: "66%",
    backgroundColor: C.primary,
    borderRadius: 4,
  },
  beMarker: {
    position: "absolute",
    top: -3,
    left: "40%",
    width: 2,
    height: 14,
    backgroundColor: C.redDark,
    borderRadius: 1,
  },
  beNums: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  beNum: {
    fontSize: 9,
    color: C.textSecondary,
  },
  profitBadge: {
    backgroundColor: C.greenLight,
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
  },
  profitText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.greenDark,
  },
});
