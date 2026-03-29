import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const C = Colors.light;

export interface Comment {
  id: string;
  authorName: string;
  authorBadge?: string;
  authorBadgeBg?: string;
  authorBadgeColor?: string;
  avatarText: string;
  avatarColor: string;
  avatarTextColor: string;
  body: string;
  timestamp: string;
  isAI?: boolean;
  confidence?: number;
  sources?: number;
}

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
  comments?: Comment[];
  images?: { uri: string; type: string }[];
}

interface FeedCardProps {
  post: FeedPost;
  onHelpful?: () => void;
  onComment?: (comment: string) => void;
  onShare?: () => void;
}

export function FeedCard({ post, onHelpful, onComment, onShare }: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHelpfulSelected, setIsHelpfulSelected] = useState(false);

  const handleHelpful = () => {
    setIsHelpfulSelected(!isHelpfulSelected);
    onHelpful?.();
  };

  const handleAddComment = () => {
    if (commentText.trim().length > 0) {
      onComment?.(commentText);
      setCommentText("");
      setShowComments(true);
    }
  };

  const commentsCount = post.comments?.length || 0;

  return (
    <View style={styles.container}>
      {post.isPinned && (
        <View style={styles.pinnedBar}>
          <Text style={styles.pinnedText}>ကျွမ်းကျင်သူ အဖြေ — Pin ထားသည်</Text>
        </View>
      )}

      {/* Main Post */}
      <View style={styles.postContent}>
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

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesRow}>
                {post.images.map((img, index) => (
                  <Image key={index} source={{ uri: img.uri }} style={styles.postImage} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

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

        {post.loopBar && (
          <View style={styles.loopBar}>
            <View style={styles.loopDot} />
            <Text style={styles.loopText}>{post.loopBar}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, isHelpfulSelected && styles.actionBtnActive]}
            onPress={handleHelpful}
          >
            <Feather
              name="thumbs-up"
              size={14}
              color={isHelpfulSelected ? C.primary : C.textSecondary}
            />
            <Text style={[styles.actionText, isHelpfulSelected && { color: C.primary, fontWeight: "700" }]}>
              အသုံးဝင် {post.helpful ? `(${post.helpful})` : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowComments(!showComments)}
          >
            <Feather name="message-circle" size={14} color={C.textSecondary} />
            <Text style={styles.actionText}>
              မှတ်ချက် {commentsCount > 0 ? `(${commentsCount})` : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
            <Feather name="share" size={14} color={C.textSecondary} />
            <Text style={styles.actionText}>မျှဝေ</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Input - Shows when comments are expanded */}
        {showComments && (
          <View style={styles.commentInputContainer}>
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="မှတ်ချက် ရေးသားပါ..."
                placeholderTextColor={C.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.commentSubmitBtn, commentText.trim().length === 0 && { opacity: 0.5 }]}
                onPress={handleAddComment}
                disabled={commentText.trim().length === 0}
              >
                <Feather name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Comments Section */}
      {showComments && post.comments && post.comments.length > 0 && (
        <View style={styles.commentsSection}>
          {post.comments.map((comment, index) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentLine} />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <View style={[
                    styles.commentAvatar,
                    { backgroundColor: comment.avatarColor },
                    comment.isAI && styles.aiCommentAvatar
                  ]}>
                    {comment.isAI ? (
                      <Text style={styles.aiCommentAvatarText}>AI</Text>
                    ) : (
                      <Text style={styles.commentAvatarText}>{comment.avatarText}</Text>
                    )}
                  </View>
                  <View style={styles.commentInfo}>
                    <View style={styles.commentNameRow}>
                      <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                      {comment.authorBadge && (
                        <View style={[
                          styles.commentBadge,
                          { backgroundColor: comment.authorBadgeBg }
                        ]}>
                          <Text style={[styles.commentBadgeText, { color: comment.authorBadgeColor }]}>
                            {comment.authorBadge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                  </View>
                  {comment.isAI && comment.confidence && (
                    <View style={styles.aiConfidenceBadge}>
                      <Text style={styles.aiConfidenceText}>
                        ယုံကြည်မှု {comment.confidence}%
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.commentBody}>{comment.body}</Text>

                {comment.isAI && comment.sources !== undefined && comment.sources > 0 && (
                  <View style={styles.aiSources}>
                    <Feather name="book-open" size={12} color={C.primary} />
                    <Text style={styles.aiSourcesText}>
                      ဗဟုသုတ အခြေပြုပြီး {comment.sources} ရင်းမြစ်မှ ကောက်ယူဖြေကြားထားသည်
                    </Text>
                  </View>
                )}

                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.commentActionBtn}>
                    <Feather name="thumbs-up" size={11} color={C.textSecondary} />
                    <Text style={styles.commentActionText}>အသုံးဝင်သည်</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.commentActionBtn}>
                    <Feather name="share" size={11} color={C.textSecondary} />
                    <Text style={styles.commentActionText}>မျှဝေ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
    marginBottom: 10,
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
  postContent: {
    padding: 14,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    lineHeight: 30,
    paddingVertical: 5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "600",
    paddingTop: 1,
  },
  authorMeta: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 1,
    lineHeight: 22,
    paddingVertical: 3,
  },
  body: {
    fontSize: 13,
    color: C.text,
    lineHeight: 28,
    paddingVertical: 5,
    marginBottom: 10,
  },
  imagesContainer: {
    marginBottom: 10,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 8,
  },
  postImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 8,
  },
  tagRow: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 20,
    paddingVertical: 3,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    lineHeight: 20,
    paddingVertical: 3,
  },
  loopBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0EEE8",
    borderRadius: 8,
    padding: 8,
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
    lineHeight: 20,
    paddingVertical: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionBtnActive: {
    backgroundColor: C.primaryLight,
  },
  actionText: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "500",
  },
  // Comment Input
  commentInputContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: C.text,
    minHeight: 36,
    maxHeight: 80,
  },
  commentSubmitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  // Comments Section
  commentsSection: {
    backgroundColor: C.surface,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  commentItem: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  commentLine: {
    width: 3,
    backgroundColor: C.primary,
    marginLeft: 14,
    marginRight: 8,
    flexShrink: 0,
  },
  commentContent: {
    flex: 1,
    paddingRight: 14,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    fontSize: 10,
    fontWeight: "700",
  },
  aiCommentAvatar: {
    backgroundColor: C.primaryLight,
  },
  aiCommentAvatarText: {
    fontSize: 9,
    fontWeight: "700",
    color: C.primary,
  },
  commentInfo: {
    flex: 1,
  },
  commentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
    lineHeight: 26,
    paddingVertical: 4,
  },
  commentBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  commentBadgeText: {
    fontSize: 8,
    fontWeight: "600",
  },
  commentTimestamp: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 1,
  },
  aiConfidenceBadge: {
    backgroundColor: C.greenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiConfidenceText: {
    fontSize: 9,
    fontWeight: "700",
    color: C.greenDark,
    paddingTop: 2,
  },
  commentBody: {
    fontSize: 12,
    color: C.text,
    lineHeight: 26,
    paddingVertical: 4,
    marginBottom: 6,
  },
  aiSources: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primaryLight,
    borderRadius: 6,
    padding: 5,
    marginBottom: 6,
  },
  aiSourcesText: {
    fontSize: 9,
    color: C.primaryDark,
    flex: 1,
    lineHeight: 14,
  },
  commentActions: {
    flexDirection: "row",
    gap: 10,
  },
  commentActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  commentActionText: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: "500",
  },
});
