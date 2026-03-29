import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

export interface FeedPost {
  id: string;
  avatarText: string;
  avatarColor: string;
  avatarTextColor: string;
  authorName: string;
  authorBadge?: string;
  authorBadgeBg?: string;
  authorBadgeColor?: string;
  authorMeta: string;
  body: string;
  tags: { label: string; bg: string; color: string }[];
  alertText?: string;
  helpful?: number;
  isPinned?: boolean;
  leftBorderColor?: string;
  aiChip?: { label: string; text: string; conf: string };
  loopBar?: string;
}

interface FeedCardProps {
  post: FeedPost;
  onHelpful?: () => void;
}

export function FeedCard({ post, onHelpful }: FeedCardProps) {
  return (
    <View
      style={[
        styles.container,
        post.leftBorderColor && {
          borderLeftWidth: 3,
          borderLeftColor: post.leftBorderColor,
          borderRadius: 0,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
        },
      ]}
    >
      {post.isPinned && (
        <View style={styles.pinnedBar}>
          <Text style={styles.pinnedText}>ကျွမ်းကျင်သူ အဖြေ — Pin ထားသည်</Text>
        </View>
      )}
      <View style={styles.head}>
        <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
          <Text style={[styles.avatarText, { color: post.avatarTextColor }]}>{post.avatarText}</Text>
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            {post.authorBadge && (
              <View style={[styles.badge, { backgroundColor: post.authorBadgeBg }]}>
                <Text style={[styles.badgeText, { color: post.authorBadgeColor }]}>{post.authorBadge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.authorMeta}>{post.authorMeta}</Text>
        </View>
      </View>
      <Text style={styles.body}>{post.body}</Text>
      <View style={styles.tagRow}>
        {post.tags.map((tag, i) => (
          <View key={i} style={[styles.tag, { backgroundColor: tag.bg }]}>
            <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
          </View>
        ))}
      </View>
      {post.alertText && (
        <View style={styles.alertBanner}>
          <View style={styles.alertDot} />
          <Text style={styles.alertText}>{post.alertText}</Text>
        </View>
      )}
      {post.aiChip && (
        <View style={styles.aiChip}>
          <Text style={styles.aiChipLabel}>{post.aiChip.label}</Text>
          <Text style={styles.aiChipText}>{post.aiChip.text}</Text>
          <View style={styles.aiConf}>
            <Text style={styles.aiConfText}>{post.aiChip.conf}</Text>
          </View>
        </View>
      )}
      {post.loopBar && (
        <View style={styles.loopBar}>
          <View style={styles.loopDot} />
          <Text style={styles.loopText}>{post.loopBar}</Text>
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onHelpful}>
          <Text style={styles.actionText}>အသုံးဝင် {post.helpful ? `(${post.helpful})` : ""}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>ဖြေကြားရန်</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>မျှဝေ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    overflow: "hidden",
  },
  pinnedBar: {
    backgroundColor: C.purpleLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#AFA9EC",
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.purple,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    paddingBottom: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    lineHeight: 20,
    paddingTop: 2,
    fontWeight: "700",
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  authorName: {
    fontSize: 13,
    lineHeight: 28,
    paddingTop: 4,
    fontWeight: "600",
    color: C.text,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 16,
    paddingTop: 2,
    fontWeight: "600",
  },
  authorMeta: {
    fontSize: 10,
    lineHeight: 18,
    paddingTop: 2,
    color: C.textSecondary,
    marginTop: 1,
  },
  body: {
    fontSize: 12,
    color: "#333",
    lineHeight: 24,
    paddingTop: 2,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  tagRow: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 10,
    backgroundColor: C.redLight,
    borderRadius: 8,
    padding: 8,
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.red,
  },
  alertText: {
    fontSize: 10,
    color: C.redDark,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
    paddingTop: 2,
  },
  aiChip: {
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 14,
    marginBottom: 8,
  },
  aiChipLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: C.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  aiChipText: {
    fontSize: 11,
    color: C.primary,
    lineHeight: 20,
    paddingTop: 2,
  },
  aiConf: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  aiConfText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "600",
  },
  loopBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0EEE8",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 14,
    marginBottom: 8,
  },
  loopDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.purple,
  },
  loopText: {
    fontSize: 10,
    color: C.purple,
    flex: 1,
    lineHeight: 18,
    paddingTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#F0EDE8",
    padding: 10,
    paddingHorizontal: 14,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  actionText: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: "500",
  },
});
