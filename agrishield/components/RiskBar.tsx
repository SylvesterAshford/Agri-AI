import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

interface RiskBarProps {
  score: number;
  label: string;
  sublabel: string;
  badge: string;
  badgeNote?: string;
}

export function RiskBar({ score, label, sublabel, badge, badgeNote }: RiskBarProps) {
  const isHigh = score >= 70;
  const isMed = score >= 40 && score < 70;
  const color = isHigh ? C.red : isMed ? C.amber : C.primary;
  const bgColor = isHigh ? C.redLight : isMed ? C.amberLight : C.greenLight;
  const textColor = isHigh ? C.redDark : isMed ? C.amberDark : C.greenDark;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: bgColor }]}>
          <Text style={[styles.badgeText, { color: textColor }]}>{badge}</Text>
        </View>
        {badgeNote && <Text style={styles.badgeNote}>{badgeNote}</Text>}
      </View>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreNum, { color }]}>{score}</Text>
        <Text style={[styles.scorePct, { color }]}>%</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sublabel}>{sublabel}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgeNote: {
    fontSize: 10,
    color: C.textSecondary,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 6,
  },
  scoreNum: {
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 44,
  },
  scorePct: {
    fontSize: 16,
    fontWeight: "600",
    paddingBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 8,
  },
  track: {
    height: 5,
    backgroundColor: C.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: 5,
    borderRadius: 3,
  },
});
