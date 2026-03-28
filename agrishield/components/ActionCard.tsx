import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

interface Step {
  num: string;
  text: string;
}

interface ActionCardProps {
  title: string;
  steps: Step[];
}

export function ActionCard({ title, steps }: ActionCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.dot} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {steps.map((step, i) => (
        <View key={i} style={[styles.step, i === steps.length - 1 && { marginBottom: 0 }]}>
          <View style={styles.numBadge}>
            <Text style={styles.numText}>{step.num}</Text>
          </View>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
  },
  step: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  numBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  numText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.greenDark,
  },
  stepText: {
    fontSize: 12,
    color: C.text,
    lineHeight: 22,
    paddingTop: 2,
    flex: 1,
  },
});
