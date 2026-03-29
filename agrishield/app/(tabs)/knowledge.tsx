import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { FeedCard, FeedPost, Comment } from "@/components/FeedCard";
import { queryRagCorpus, RagQuery } from "@/services/vertexRagAI";

const C = Colors.light;

// Filter types matching the spec
type PostType = "all" | "pest" | "fertilizer" | "disaster" | "seed" | "soil";
type PostTypeFilter = "all-types" | "report" | "question" | "tip";
type SortType = "latest" | "helpful" | "urgent" | "unanswered" | "my-crop";
type ScopeType = "township" | "region" | "national";

const FILTERS: { key: PostType; label: string; color: string; bg: string }[] = [
  { key: "fertilizer", label: "ဓာတ်မြေဩဇာ", color: C.greenDark, bg: C.greenLight },
  { key: "disaster", label: "ဘေးအန္တရာယ်", color: C.blue, bg: C.blueLight },
  { key: "seed", label: "မျိုးစေ့", color: "#5F5E5A", bg: C.surface },
  { key: "soil", label: "မြေဆီလွှာ", color: C.amberDark, bg: C.amberLight },
];

const POST_TYPE_FILTERS: { key: PostTypeFilter; label: string; icon: string; color: string; bg: string }[] = [
  { key: "all-types", label: "အားလုံး", icon: "grid", color: C.text, bg: C.surface },
  { key: "report", label: "Report", icon: "alert-triangle", color: C.red, bg: C.redLight },
  { key: "question", label: "Question", icon: "help-circle", color: C.amberDark, bg: C.amberLight },
  { key: "tip", label: "Tip", icon: "check-circle", color: C.greenDark, bg: C.greenLight },
];

const INITIAL_POSTS: FeedPost[] = [
  {
    id: "f1",
    avatarText: "ဦစော",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးစောလှိုင်",
    authorBadge: "တောင်သူ · ၅ ရာသီ",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "ညောင်ဦး · မြောက်ဘက် · ၁ နာရီ",
    body: "ပဲခင်းမှာ အရွက်တွေ ဝါနေပါတယ်။ ဘယ်ဓာတ်မြေဩဇာ အမျိုးအစားကို အသုံးပြုသင့်ပါသလဲ?",
    tags: [
      { label: "မေးခွန်း", bg: C.amberLight, color: C.amberDeep },
      { label: "ဓာတ်မြေဩဇာ", bg: C.greenLight, color: C.greenDark },
    ],
    helpful: 12,
  },
  {
    id: "f2",
    avatarText: "ဒေါ်",
    avatarColor: C.purpleLight,
    avatarTextColor: C.purpleDark,
    authorName: "ဒေါ်သိဒ္ဓာ",
    authorBadge: "ဦးစီးဌာန စစ်",
    authorBadgeBg: C.purpleLight,
    authorBadgeColor: C.purple,
    authorMeta: "စိုက်ပျိုးရေး ဦးစီးဌာန · ၂ နာရီ",
    body: "ရေကြီးပြီးနောက် စပါးခင်းများတွင် ပိုတက်စီယမ် ဓာတ်မြေဩဇာ အသုံးပြုပါက အထွက်နှုန်း ၂၀% တိုးတက်သည်",
    tags: [
      { label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark },
      { label: "ဓာတ်မြေဩဇာ", bg: C.greenLight, color: C.greenDark },
    ],
    helpful: 61,
  },
  {
    id: "f3",
    avatarText: "ဦမောင်",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးမောင်မောင်",
    authorBadge: "တောင်သူ",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "ညောင်ဦး · တောင်ဘက် · ၃ နာရီ",
    body: "NPK ၁၅:၁၅:၁၅ ဓာတ်မြေဩဇာကို ဘယ်အချိန်မှာ အသုံးပြုရမလဲ? စိုက်ပြီး ဘယ်လောက်ကြာမှ လောင်းရမလဲ?",
    tags: [
      { label: "မေးခွန်း", bg: C.amberLight, color: C.amberDeep },
      { label: "ဓာတ်မြေဩဇာ", bg: C.greenLight, color: C.greenDark },
    ],
    helpful: 28,
  },
  {
    id: "d1",
    avatarText: "ဦအ",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးအောင်လွင်",
    authorBadge: "တောင်သူ စစ်",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "ညောင်ဦး · မြောက်ဘက် · ၄ နာရီ",
    body: "⚠️ သတိပေးချက် — ပဲခင်းမှာ မွှားပင့်ကူ တွေ့ပါသည် — တစ်ခင်းလုံး ပျံ့နှံ့နေပြီ။ အမြန်ဆုံး ကုသမှုခံယူပါ။",
    tags: [
      { label: "အတည်ပြု", bg: C.redLight, color: C.red },
      { label: "ဘေးအန္တရာယ်", bg: C.blueLight, color: C.blue },
    ],
    alertText: "ညောင်ဦး ပဲတောင်သူ ၃၄၀ ဦးကို သတိပေးချက် ပေးပို့ပြီး",
    helpful: 48,
    leftBorderColor: C.red,
  },
  {
    id: "d2",
    avatarText: "ဒလ",
    avatarColor: C.purpleLight,
    avatarTextColor: C.purple,
    authorName: "ဒေါ်လင်းဇာနီ",
    authorBadge: "ဦးစီးဌာန",
    authorBadgeBg: C.purpleLight,
    authorBadgeColor: C.purple,
    authorMeta: "စိုက်ပျိုးရေး ဦးစီးဌာန · ၅ နာရီ",
    body: "မုန်တိုင်းကြောင့် ပျက်စီးသော စပါးခင်းများအတွက် အစိုးရထံမှ လျော်ကြေး လျှောက်ထားနိုင်ပါပြီ။",
    tags: [
      { label: "အတည်ပြု", bg: C.redLight, color: C.red },
      { label: "ဘေးအန္တရာယ်", bg: C.blueLight, color: C.blue },
    ],
    helpful: 89,
  },
  {
    id: "d3",
    avatarText: "ဦရ",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးရဲမြင့်",
    authorBadge: "တောင်သူ · ၈ ရာသီ",
    authorBadgeBg: C.amberLight,
    authorBadgeColor: C.amberDark,
    authorMeta: "ညောင်ဦး · အနောက်ဘက် · ၆ နာရီ",
    body: "ရေကြီးပြီးနောက် ပြန်လည်စိုက်ပျိုးနည်း — ရေဆင်းကောင်းအောင် လုပ်ပါ၊ မြေဩဇာ ထည့်ပါ၊ ၃ ရက်နေပါ",
    tags: [
      { label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark },
      { label: "ဘေးအန္တရာယ်", bg: C.blueLight, color: C.blue },
    ],
    helpful: 124,
  },
  {
    id: "s1",
    avatarText: "ဒေါ်မြ",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဒေါ်မြမြ",
    authorBadge: "တောင်သူ",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "ညောင်ဦး · အရှေ့ဘက် · ၇ နာရီ",
    body: "မျိုးစေ့ဝယ်ဖို့ အကြံဉာဏ်လိုပါတယ်။ ညောင်ဦးမှာ ဘယ်ဆိုင်က ဝယ်ရင် အကောင်းဆုံးလဲခင်ဗျာ?",
    tags: [
      { label: "မေးခွန်း", bg: C.amberLight, color: C.amberDeep },
      { label: "မျိုးစေ့", bg: C.surface, color: "#5F5E5A" },
    ],
    helpful: 15,
  },
  {
    id: "s2",
    avatarText: "ဦကျော်",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးကျော်စွာ",
    authorBadge: "တောင်သူ · ၁၂ ရာသီ",
    authorBadgeBg: C.amberLight,
    authorBadgeColor: C.amberDark,
    authorMeta: "ညောင်ဦး · မြောက်ဘက် · ၈ နာရီ",
    body: "ပဲမျိုးစေ့ ရွေးချယ်နည်း — အစေ့အိမ်၍ အလေးချိန်ရှိ၊ အရောင်ညီ၊ ပျက်စီးမှုကင်းသော မျိုးစေ့ကို ရွေးပါ",
    tags: [
      { label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark },
      { label: "မျိုးစေ့", bg: C.surface, color: "#5F5E5A" },
    ],
    helpful: 42,
  },
  {
    id: "s3",
    avatarText: "ဒေါ်နှင်း",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဒေါ်နှင်းဝါ",
    authorBadge: "တောင်သူ",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "ညောင်ဦး · တောင်ဘက် · ၉ နာရီ",
    body: "မျိုးစေ့ သိုလှောင်နည်း — လေဝင်လေထွက်ကောင်းသော အိတ်ဖြင့် ထည့်ပါ၊ ခြောက်သွေ့သော နေရာတွင်ထားပါ",
    tags: [
      { label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark },
      { label: "မျိုးစေ့", bg: C.surface, color: "#5F5E5A" },
    ],
    helpful: 31,
  },
  {
    id: "o1",
    avatarText: "ဦတင်",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးတင်ဦး",
    authorBadge: "တောင်သူ · ၁၀ ရာသီ",
    authorBadgeBg: C.amberLight,
    authorBadgeColor: C.amberDark,
    authorMeta: "ညောင်ဦး · တောင်ဘက် · ၁၀ နာရီ",
    body: "မြေဆီလွှာ ကောင်းမွန်စေဖို့ ဘယ်လို ဂရုစိုက်ရမလဲ? သဘာဝ နည်းလမ်းတွေ သိချင်ပါတယ်။",
    tags: [
      { label: "မေးခွန်း", bg: C.amberLight, color: C.amberDeep },
      { label: "မြေဆီလွှာ", bg: C.amberLight, color: C.amberDark },
    ],
    helpful: 22,
  },
  {
    id: "o2",
    avatarText: "ဒေါ်ယု",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဒေါ်ယုယု",
    authorBadge: "တောင်သူ · ၆ ရာသီ",
    authorBadgeBg: C.amberLight,
    authorBadgeColor: C.amberDark,
    authorMeta: "ညောင်ဦး · အရှေ့ဘက် · ၁၁ နာရီ",
    body: "သဘာဝ မြေဩဇာ ပြုလုပ်နည်း — စွန့်ပစ်အော်ဂဲနစ်များကို မြေတွင်မြှုပ်ထားပါ၊ ၃ လကြာလျှင် အသုံးပြုနိုင်ပါပြီ",
    tags: [
      { label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark },
      { label: "မြေဆီလွှာ", bg: C.amberLight, color: C.amberDark },
    ],
    helpful: 56,
  },
  {
    id: "o3",
    avatarText: "ဦလှ",
    avatarColor: C.amberLight,
    avatarTextColor: C.amberDark,
    authorName: "ဦးလှမောင်",
    authorBadge: "တောင်သူ",
    authorBadgeBg: C.greenLight,
    authorBadgeColor: C.greenDark,
    authorMeta: "ညောင်ဦး · အနောက်ဘက် · ၁၂ နာရီ",
    body: "မြေဩဇာ စစ်ဆေးနည်း — မြေအရောင်၊ မြေသား၊ ရေဆင်းကောင်းမှုကို ကြည့်ပါ၊ ဓာတ်ခွဲစစ်ဆေးမှု အကောင်းဆုံးပါ",
    tags: [
      { label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark },
      { label: "မြေဆီလွှာ", bg: C.amberLight, color: C.amberDark },
    ],
    helpful: 38,
  },
];

interface PestResultProps {
  onDismiss: () => void;
}

function PestResult({ onDismiss }: PestResultProps) {
  return (
    <View style={styles.pestOverlayFullScreen}>
      <View style={styles.pestCardFullScreen}>
        {/* Header */}
        <View style={styles.pestHeaderFull}>
          <TouchableOpacity style={styles.pestCloseFull} onPress={onDismiss}>
            <Feather name="x" size={24} color={C.text} />
          </TouchableOpacity>
          <View style={styles.pestConfHeaderFull}>
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={styles.pestConfTextFull}>ယုံကြည်မှု 91%</Text>
          </View>
        </View>

        {/* Photo Area - Full Width */}
        <View style={styles.pestPhotoFull}>
          <Feather name="image" size={64} color={C.greenDark} />
          <Text style={styles.pestPhotoLabelFull}>ပဲ အရွက် — AI စစ်ဆေးပြီး</Text>
        </View>

        {/* Content - No Scroll Needed */}
        <View style={styles.pestContentFull}>
          <View style={styles.pestInfoFull}>
            <Text style={styles.pestNameFull}>မွှားပင့်ကူ</Text>
            <View style={styles.pestSciRow}>
              <Text style={styles.pestSciFull}>Tetranychus urticae</Text>
              <Text style={styles.pestSciDot}> · </Text>
              <Text style={styles.pestSciFull}>Spider mite</Text>
            </View>
          </View>

          {/* Treatment Box */}
          <View style={styles.treatmentFull}>
            <View style={styles.treatHeaderFull}>
              <Feather name="clipboard" size={18} color={C.greenDark} />
              <Text style={styles.treatLabelFull}>ကုသနည်း</Text>
            </View>
            <View style={styles.treatStepsFull}>
              <View style={styles.treatStepFull}>
                <Text style={styles.treatNumFull}>၁</Text>
                <Text style={styles.treatTextFull}>နေမဆေးရည် ၃ မီလီ + ရေ ၁ လီတာ ရောပါ</Text>
              </View>
              <View style={styles.treatStepFull}>
                <Text style={styles.treatNumFull}>၂</Text>
                <Text style={styles.treatTextFull}>မနက် ၆–၈ နာရီ ကြားတွင် ဖျန်းပါ</Text>
              </View>
              <View style={styles.treatStepFull}>
                <Text style={styles.treatNumFull}>၃</Text>
                <Text style={styles.treatTextFull}>ရက် ၃ ကြာ ပြန်စစ်ဆေးပါ</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.pestActionsFull}>
            <TouchableOpacity style={styles.pestActionPrimaryFull} onPress={onDismiss}>
              <Feather name="share-2" size={20} color="#fff" />
              <Text style={styles.pestActionPrimaryTextFull}>Feed မှာ မျှဝေမည်</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pestActionSecondaryFull} onPress={onDismiss}>
              <Feather name="message-circle" size={20} color={C.text} />
              <Text style={styles.pestActionSecondaryTextFull}>ကျွမ်းကျင်သူ မေးမည်</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// Compose Modal Component - Full screen like Reddit/StackOverflow
interface ComposeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<FeedPost, "id" | "avatarText" | "avatarColor" | "avatarTextColor">) => FeedPost | void;
  onAddAiReply: (postId: string, aiResponse: { answer: string; confidence: number; sources: number }) => void;
}

function ComposeModal({ visible, onClose, onSubmit, onAddAiReply }: ComposeModalProps) {
  const [postType, setPostType] = useState<PostTypeFilter>("question");
  const [category, setCategory] = useState<PostType>("fertilizer");
  const [text, setText] = useState("");
  const [autoTags, setAutoTags] = useState<{ label: string; bg: string; color: string }[]>([]);
  const [selectedImages, setSelectedImages] = useState<{ uri: string; type: string; base64?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('ခွင့်ပြုချက်လိုအပ်', 'ကင်မရာကို အသုံးပြုရန် ခွင့်ပြုချက်ပေးပါ');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('ခွင့်ပြုချက်လိုအပ်', 'ဓာတ်ပုံများကို ရယူရန် ခွင့်ပြုချက်ပေးပါ');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImages(prev => [...prev, {
          uri: asset.uri,
          type: fromCamera ? 'camera' : 'library',
          base64: asset.base64,
        }]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('အမှား', 'ဓာတ်ပုံ ရယူရာတွင် အမှားဖြစ်ပွား');
    }
  };

  const imageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Image to base64 error:', error);
      return '';
    }
  };

  const simulateAutoTag = (inputText: string) => {
    const tags: { label: string; bg: string; color: string }[] = [];
    const lower = inputText.toLowerCase();

    if (lower.includes("ပိုး") || lower.includes("မွှား") || lower.includes("ကျ")) {
      tags.push({ label: "ပိုးမွှား", bg: C.redLight, color: C.red });
    }
    if (lower.includes("ရေ") || lower.includes("ကြီး") || lower.includes("မြင့်")) {
      tags.push({ label: "ရေကြီး", bg: C.blueLight, color: C.blue });
    }
    if (lower.includes("ခေါင်") || lower.includes("မိုး")) {
      tags.push({ label: "မိုးခေါင်", bg: C.amberLight, color: C.amberDark });
    }
    if (lower.includes("ဈေး") || lower.includes("ရောင်း") || lower.includes("ဝယ်")) {
      tags.push({ label: "ဈေးနှုန်း", bg: C.greenLight, color: C.greenDark });
    }
    if (lower.includes("ပဲ")) {
      tags.push({ label: "ပဲ", bg: C.amberLight, color: C.amberDeep });
    }
    if (tags.length === 0 && inputText.length > 10) {
      tags.push({ label: "အထွေထွေ", bg: C.surface, color: C.textSecondary });
    }

    setAutoTags(tags);
  };

  const handleSubmit = async () => {
    if (text.trim().length < 5) {
      Alert.alert("စာသား အလွန်တိုသည်", "အနည်းဆုံး စာလုံး ၅ လုံး ရိုက်ထည့်ပါ");
      return;
    }

    setIsSubmitting(true);

    const tags: { label: string; bg: string; color: string }[] = [];

    // Add category tag first
    const selectedCategory = FILTERS.find((f) => f.key === category);
    if (selectedCategory) {
      tags.push({ label: selectedCategory.label, bg: selectedCategory.bg, color: selectedCategory.color });
    }

    // Add post type tag
    if (postType === "report") {
      tags.push({ label: "အတည်ပြု", bg: C.redLight, color: C.red });
    } else if (postType === "tip") {
      tags.push({ label: "အကြံပြုချက်", bg: C.greenLight, color: C.greenDark });
    } else if (postType === "question") {
      tags.push({ label: "မေးခွန်း", bg: C.amberLight, color: C.amberDeep });
    }

    // Add auto-tags
    if (autoTags.length > 0) {
      tags.push(...autoTags);
    }

    const newPost = {
      authorName: "ကျွန်တော်",
      authorBadge: "တောင်သူ",
      authorBadgeBg: C.greenLight,
      authorBadgeColor: C.greenDark,
      authorMeta: "ယခု · ညောင်ဦး",
      body: text,
      tags,
      alertText: postType === "report" ? "ညောင်ဦး တောင်သူများကို သတိပေးချက် ပေးပို့မည်" : undefined,
      images: selectedImages.length > 0 ? selectedImages : undefined,
    };

    // Submit user post first
    const submittedPost = onSubmit(newPost);

    // Query Vertex AI RAG for response with image analysis (in background)
    try {
      let imageBase64: string | undefined = undefined;

      // Convert first image to base64 for AI analysis
      if (selectedImages.length > 0 && selectedImages[0].base64) {
        // ImagePicker already provides base64, use it directly
        imageBase64 = selectedImages[0].base64;
        console.log('[DEBUG] Using base64 from ImagePicker, length:', imageBase64.length);
      } else if (selectedImages.length > 0 && selectedImages[0].uri) {
        // Fallback: convert URI to base64
        imageBase64 = await imageToBase64(selectedImages[0].uri);
        console.log('[DEBUG] Converted URI to base64, length:', imageBase64.length);
      }

      const ragQuery: RagQuery = {
        text: text,
        category: category as any,
        postType: postType as any,
        imageBase64: imageBase64,
        imageUrl: selectedImages.length > 0 ? selectedImages[0].uri : undefined,
      };

      const aiResponse = await queryRagCorpus(ragQuery);

      // Add AI reply to the post (nested comment style)
      if (submittedPost?.id) {
        onAddAiReply(submittedPost.id, {
          answer: aiResponse.answer,
          confidence: aiResponse.confidence,
          sources: aiResponse.sources?.length || 0,
        });
      }
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback AI response will be added by parent component
    } finally {
      setIsSubmitting(false);
      setText("");
      setAutoTags([]);
      setPostType("question");
      setCategory("fertilizer");
      setSelectedImages([]);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.composeOverlayFullScreen}>
        <View style={styles.composeModalFullScreen}>
          {/* Header */}
          <View style={styles.composeHeaderFull}>
            <Text style={styles.composeTitleFull}>အသစ်ရေးမည်</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonFull}>
              <Feather name="x" size={24} color={C.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.composeScrollViewFull} showsVerticalScrollIndicator={false}>
            {/* Section 1: Choose Category - Compact Grid */}
            <View style={styles.composeSection}>
              <View style={styles.composeSectionHeader}>
                <Feather name="tag" size={14} color={C.textSecondary} />
                <Text style={styles.composeSectionTitleSmall}>အကြောင်းအရာ</Text>
              </View>
              <View style={styles.categoryGridCompact}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.categoryBtnCompact,
                      category === f.key && { backgroundColor: f.bg, borderColor: f.color, borderWidth: 1.5 }
                    ]}
                    onPress={() => setCategory(f.key)}
                  >
                    <Text style={[styles.categoryBtnTextCompact, category === f.key && { color: f.color, fontWeight: "700" }]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section 2: Choose Post Type - Compact */}
            <View style={styles.composeSection}>
              <View style={styles.composeSectionHeader}>
                <Feather name="file-text" size={14} color={C.textSecondary} />
                <Text style={styles.composeSectionTitleSmall}>အမျိုးအစား</Text>
              </View>
              <View style={styles.typeSelectorCompact}>
                {POST_TYPE_FILTERS.filter((f) => f.key !== "all-types").map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.typeBtnCompact,
                      postType === f.key && { backgroundColor: f.bg, borderColor: f.color, borderWidth: 1.5 }
                    ]}
                    onPress={() => setPostType(f.key)}
                  >
                    <Feather name={f.icon as any} size={18} color={postType === f.key ? f.color : C.textSecondary} />
                    <Text style={[styles.typeBtnTextCompact, postType === f.key && { color: f.color, fontWeight: "700" }]}>
                      {f.label}
                    </Text>
                    <Text style={[styles.typeBtnSubCompact, postType === f.key && { color: f.color }]}>
                      {f.key === "report" ? "တွေ့ရှိ" : f.key === "question" ? "မေးမည်" : "မျှဝေမည်"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Text Input - Larger */}
            <View style={styles.composeSection}>
              <View style={styles.composeSectionHeader}>
                <Feather name="edit-3" size={14} color={C.textSecondary} />
                <Text style={styles.composeSectionTitleSmall}>စာသား</Text>
              </View>
              <TextInput
                style={styles.composeInputLarge}
                placeholder="ဘာတွေ့ခဲ့လဲ? ဘာကူညီရမလဲ? (Burmese)"
                placeholderTextColor={C.textSecondary}
                multiline
                maxLength={500}
                value={text}
                onChangeText={(t) => {
                  setText(t);
                  simulateAutoTag(t);
                }}
              />
              <View style={styles.charCountSmall}>
                <Text style={styles.charCountTextSmall}>{text.length}/500</Text>
              </View>
            </View>

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <View style={styles.composeSection}>
                <View style={styles.composeSectionHeader}>
                  <Feather name="image" size={14} color={C.textSecondary} />
                  <Text style={styles.composeSectionTitleSmall}>ဓာတ်ပုံများ ({selectedImages.length})</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.imagePreviewRow}>
                    {selectedImages.map((img, i) => (
                      <View key={i} style={styles.imagePreviewItem}>
                        <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                        >
                          <Feather name="x" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.composeActionsFull}>
            <View style={styles.attachRowFull}>
              <TouchableOpacity
                style={styles.attachBtnFull}
                onPress={() => {
                  Alert.alert(
                    'ဓာတ်ပုံ ရွေးမည်',
                    'အောက်ပါနည်းလမ်းများမှ ရွေးချယ်ပါ',
                    [
                      { text: 'ကင်မရာ', onPress: () => pickImage(true) },
                      { text: 'ဂယ်လရီ', onPress: () => pickImage(false) },
                      { text: 'ပယ်ဖျက်', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Feather name="camera" size={18} color={C.text} />
                <Text style={styles.attachTextFull}>ဓာတ်ပုံ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.attachBtnFull, { opacity: 0.5 }]} disabled>
                <Feather name="mic" size={18} color={C.textSecondary} />
                <Text style={[styles.attachTextFull, { color: C.textSecondary }]}>အသံ</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.submitBtnFull, (text.length < 5 || isSubmitting) && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={text.length < 5 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitTextFull}>တင်မည်</Text>
                  <Feather name="send" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function KnowledgeScreen() {
  const [activeFilter, setActiveFilter] = useState<PostType>("fertilizer");
  const [postTypeFilter, setPostTypeFilter] = useState<PostTypeFilter>("all-types");
  const [showPestResult, setShowPestResult] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [sortMode, setSortMode] = useState<SortType>("latest");
  const [scope, setScope] = useState<ScopeType>("township");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const userCrop = "ပဲ"; // From user profile

  // Filter posts based on BOTH category filter AND post type filter
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Apply BOTH filters together - posts must match BOTH criteria
    result = result.filter((post) => {
      const allTags = post.tags.map((t) => t.label);
      const body = post.body;

      // Check category filter - look for matching keywords in tags and body
      let matchesCategory = false;
      switch (activeFilter) {
        case "fertilizer":
          // Check for fertilizer-related keywords
          matchesCategory = allTags.some((t) =>
            t.includes("ဩဇာ") || t.includes("မြေဩဇာ") || t.includes("ဓာတ်မြေ")
          ) || body.includes("ဩဇာ") || body.includes("ဓာတ်မြေ");
          break;
        case "disaster":
          // Check for disaster-related keywords
          matchesCategory = allTags.some((t) =>
            t.includes("ရေ") || t.includes("မီး") || t.includes("ဘေး") || t.includes("ကြီး")
          ) || body.includes("ရေကြီး") || body.includes("မီး") || body.includes("ဘေး") || body.includes("⚠️");
          break;
        case "seed":
          // Check for seed-related keywords
          matchesCategory = allTags.some((t) =>
            t.includes("မျိုးစေ့") || t.includes("မျိုး")
          ) || body.includes("မျိုးစေ့") || (body.includes("မျိုး") && !body.includes("မျိုးကောင်း"));
          break;
        case "soil":
          // Check for soil-related keywords
          matchesCategory = allTags.some((t) =>
            t.includes("မြေ") || t.includes("မြေဆီ")
          ) || body.includes("မြေဆီ") || body.includes("မြေဩဇာ");
          break;
        default:
          matchesCategory = true;
      }

      // Check post type filter (report/question/tip)
      let matchesType = true;
      if (postTypeFilter !== "all-types") {
        const firstTag = allTags[0] || "";
        switch (postTypeFilter) {
          case "report":
            matchesType = firstTag.includes("အတည်ပြု") || firstTag.includes("သတိပေး") ||
                         body.includes("⚠️") || post.alertText !== undefined;
            break;
          case "question":
            matchesType = firstTag.includes("မေး") || body.includes("လဲ") || body.includes("နည်း") || body.includes("?");
            break;
          case "tip":
            matchesType = firstTag.includes("အကြံ") || firstTag.includes("အတွေ့အကြုံ") ||
                         body.includes("နည်းလမ်း") || body.includes("✅");
            break;
          default:
            matchesType = true;
        }
      }

      // Post must match BOTH filters
      return matchesCategory && matchesType;
    });

    // Filter by scope (township only for demo)
    if (scope === "township") {
      result = result.filter((post) => post.authorMeta?.includes("ညောင်ဦး"));
    }

    // Sort
    switch (sortMode) {
      case "helpful":
        result.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      case "urgent":
        result.sort((a, b) => (a.alertText ? -1 : 1));
        break;
      case "unanswered":
        result = result.filter((p) => !p.isPinned && p.tags.some((t) => t.label.includes("မေး")));
        break;
      case "my-crop":
        result = result.filter((p) => p.tags.some((t) => t.label.includes(userCrop)));
        break;
      case "latest":
      default:
        // Already in latest order
        break;
    }

    return result;
  }, [posts, activeFilter, postTypeFilter, sortMode, scope]);

  const handleNewPost = (newPostData: Omit<FeedPost, "id" | "avatarText" | "avatarColor" | "avatarTextColor"> & { images?: { uri: string; type: string }[] }) => {
    const newPost: FeedPost = {
      ...newPostData,
      id: Date.now().toString(),
      avatarText: "ကျ",
      avatarColor: C.amberLight,
      avatarTextColor: C.amberDark,
      images: newPostData.images,
    };

    setPosts([newPost, ...posts]);
    // AI response will be added as aiReply when received from API
    return newPost; // Return the post so ComposeModal can reference it
  };

  /**
   * Add AI reply to an existing post as a comment
   */
  const handleAddAiReply = (postId: string, aiResponse: {
    answer: string;
    confidence: number;
    sources: number;
  }) => {
    const aiComment: Comment = {
      id: `ai-${Date.now()}`,
      authorName: "AgriShield AI",
      authorBadge: "Vertex RAG",
      authorBadgeBg: C.primaryLight,
      authorBadgeColor: C.primaryDark,
      avatarText: "AI",
      avatarColor: C.primaryLight,
      avatarTextColor: C.primaryDark,
      body: aiResponse.answer,
      timestamp: "AI အဖြေ",
      isAI: true,
      confidence: aiResponse.confidence,
      sources: aiResponse.sources,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...(p.comments || []), aiComment] }
          : p
      )
    );
  };

  const handleHelpful = (postId: string) => {
    setPosts(posts.map((p) => p.id === postId ? { ...p, helpful: (p.helpful || 0) + 1 } : p));
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: "ကျွန်တော်",
      authorBadge: "တောင်သူ",
      authorBadgeBg: C.greenLight,
      authorBadgeColor: C.greenDark,
      avatarText: "ကျ",
      avatarColor: C.amberLight,
      avatarTextColor: C.amberDark,
      body: commentText,
      timestamp: "ယခု",
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      )
    );
  };

  const handleShare = (postId: string) => {
    Alert.alert("မျှဝေမည်", "ဤပို့စ်ကို မျှဝေရန် အတွက် မကြာမီ ထပ်မံထည့်သွင်းမည်");
  };

  const sortOptions: { key: SortType; label: string; desc: string; badge: string; badgeColor: string }[] = [
    { key: "latest", label: "နောက်ဆုံး", desc: "Most recent first", badge: "Default", badgeColor: C.greenLight },
    { key: "helpful", label: "အသုံးဝင်ဆုံး", desc: "Highest votes", badge: "Knowledge", badgeColor: C.purpleLight },
    { key: "urgent", label: "အရေးပေါ်", desc: "Alerts first", badge: "Safety", badgeColor: C.redLight },
    { key: "unanswered", label: "မဖြေရသေး", desc: "Needs answers", badge: "Expert", badgeColor: C.amberLight },
    { key: "my-crop", label: "ငါ့သီးနှံ", desc: `${userCrop} only`, badge: "Personal", badgeColor: C.blueLight },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Top bar */}
      <View style={[styles.topbar, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.topTitle}>ညောင်ဦး ဗဟုသုတ Feed</Text>
            <Text style={styles.topMeta}>
              {scope === "township" ? "ပဲတောင်သူ" : scope === "region" ? "မန္တလေးတိုင်း" : "တစ်နိုင်လုံး"} ·{" "}
              {posts.length} ပို့စ် · AI + ကျွမ်းကျင်သူ + တောင်သူ
            </Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.scopeBtn}
              onPress={() => setScope(scope === "township" ? "region" : scope === "region" ? "national" : "township")}
            >
              <Feather name="map-pin" size={14} color={C.text} />
              <Text style={styles.scopeBtnText}>
                {scope === "township" ? "ညောင်ဦး" : scope === "region" ? "မန္တလေး" : "မြန်မာ"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Header - Topic Categories */}
        <View style={styles.sectionHeader}>
          <Feather name="tag" size={14} color={C.textSecondary} />
          <Text style={styles.sectionHeaderText}>အကြောင်းအရာ</Text>
        </View>

        {/* Category Filter pills - First row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                activeFilter === f.key && { backgroundColor: f.bg, borderColor: f.color, borderWidth: 2 }
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === f.key && { color: f.color, fontWeight: "700" }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Header - Post Type */}
        <View style={styles.sectionHeader}>
          <Feather name="file-text" size={14} color={C.textSecondary} />
          <Text style={styles.sectionHeaderText}>အမျိုးအစား</Text>
        </View>

        {/* Post Type Filter - Report/Question/Tip - Second row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeFilterScroll}
          contentContainerStyle={styles.typeFilterContent}
        >
          {POST_TYPE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.typeFilterPill,
                postTypeFilter === f.key && { backgroundColor: f.bg, borderColor: f.color, borderWidth: 2 }
              ]}
              onPress={() => setPostTypeFilter(f.key)}
              activeOpacity={0.8}
            >
              <Feather name={f.icon as any} size={14} color={postTypeFilter === f.key ? f.color : C.textSecondary} />
              <Text style={[styles.typeFilterText, postTypeFilter === f.key && { color: f.color, fontWeight: "700" }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Legend */}
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

        {/* Posts */}
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onHelpful={() => handleHelpful(post.id)}
              onComment={(text) => handleAddComment(post.id, text)}
              onShare={() => handleShare(post.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={C.textSecondary} />
            <Text style={styles.emptyTitle}>ပို့စ် မရှိသေးပါ</Text>
            <Text style={styles.emptySub}>ဤ filter ဖြင့် ပို့စ်မရှိပါ</Text>
            <TouchableOpacity style={styles.clearFilterBtn} onPress={() => setActiveFilter("all")}>
              <Text style={styles.clearFilterText}>Filter ရှင်းမည်</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Compose FAB - Single Button */}
      <TouchableOpacity
        style={[styles.composeFab, { bottom: Math.max(insets.bottom + 80, 90) }]}
        onPress={() => setShowCompose(true)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={24} color="#fff" />
        <Text style={styles.composeFabLabel}>ရေးမည်</Text>
      </TouchableOpacity>

      {/* Modals */}
      <ComposeModal
        visible={showCompose}
        onClose={() => setShowCompose(false)}
        onSubmit={handleNewPost}
        onAddAiReply={handleAddAiReply}
      />

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
    alignItems: "flex-start",
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
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 2,
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scopeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scopeBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.text,
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
  typeFilterScroll: {
    flexGrow: 0,
  },
  typeFilterContent: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8,
  },
  typeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    marginRight: 4,
  },
  typeFilterText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSecondary,
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
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: C.card,
    marginRight: 4,
  },
  filterText: {
    fontSize: 11,
    fontWeight: "500",
    color: C.textSecondary,
  },
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  sortBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textSecondary,
  },
  sortOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: C.surface,
    marginRight: 4,
  },
  sortOptionText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textSecondary,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: 12,
    gap: 10,
    paddingBottom: 120,
  },
  pestIdBannerCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8F4E8",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pestIdCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pestIdIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F4E8",
    alignItems: "center",
    justifyContent: "center",
  },
  pestIdCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  pestIdCardSub: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 2,
  },
  pestIdCardRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F4E8",
    alignItems: "center",
    justifyContent: "center",
  },
  pestIdFab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.greenDark,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pestIdFabLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  composeFabSecondary: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  composeFabSecondaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
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
  emptyState: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  emptySub: {
    fontSize: 11,
    color: C.textSecondary,
  },
  clearFilterBtn: {
    backgroundColor: C.blue,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  composeFab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  composeFabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  // Compose Modal styles
  composeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  composeModal: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  composeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  composeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    marginBottom: 2,
  },
  typeBtnSub: {
    fontSize: 9,
    color: C.textSecondary,
  },
  composeInput: {
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: C.text,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  tagPreview: {
    marginBottom: 8,
  },
  tagPreviewLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: C.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  tagPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tagPreviewPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagPreviewText: {
    fontSize: 9,
    fontWeight: "600",
  },
  charCount: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  charCountText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  composeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
  },
  attachBtnText: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingVertical: 10,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  // Pest result styles - TRUE FULL SCREEN
  pestOverlayFullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.card,
    zIndex: 100,
  },
  pestCardFullScreen: {
    flex: 1,
    backgroundColor: C.card,
  },
  pestHeaderFull: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: C.greenLight,
  },
  pestCloseFull: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  pestConfHeaderFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.greenDark,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pestConfTextFull: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  pestPhotoFull: {
    height: 250,
    backgroundColor: "#C8E6C9",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pestPhotoLabelFull: {
    fontSize: 14,
    fontWeight: "600",
    color: C.greenDark,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pestContentFull: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  pestInfoFull: {
    marginBottom: 20,
  },
  pestNameFull: {
    fontSize: 32,
    lineHeight: 52,
    paddingTop: 8,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  pestSciFull: {
    fontSize: 15,
    color: C.textSecondary,
    fontStyle: "italic",
  },
  pestSciRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  pestSciDot: {
    fontSize: 15,
    color: C.textSecondary,
  },
  treatmentFull: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  treatHeaderFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  treatLabelFull: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  treatStepsFull: {
    gap: 12,
  },
  treatStepFull: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  treatNumFull: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.greenDark,
    color: "#fff",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 13,
    fontWeight: "700",
  },
  treatTextFull: {
    fontSize: 15,
    color: C.text,
    flex: 1,
    lineHeight: 26,
    paddingTop: 4,
  },
  pestActionsFull: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  pestActionPrimaryFull: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  pestActionPrimaryTextFull: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  pestActionSecondaryFull: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  pestActionSecondaryTextFull: {
    fontSize: 15,
    color: C.text,
    fontWeight: "600",
  },
  // Compose Modal - TRUE FULL SCREEN
  composeOverlayFullScreen: {
    flex: 1,
    backgroundColor: C.card,
  },
  composeModalFullScreen: {
    flex: 1,
    backgroundColor: C.card,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  composeHeaderFull: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  composeTitleFull: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
  },
  closeButtonFull: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  composeScrollViewFull: {
    flex: 1,
    paddingHorizontal: 16,
  },
  composeSection: {
    marginBottom: 14,
  },
  composeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  composeSectionTitleSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },
  categoryGridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryBtnCompact: {
    flex: 1,
    minWidth: "47%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
  },
  categoryBtnTextCompact: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSecondary,
  },
  typeSelectorCompact: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtnCompact: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    gap: 3,
  },
  typeBtnTextCompact: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
  },
  typeBtnSubCompact: {
    fontSize: 9,
    color: C.textSecondary,
  },
  composeInputLarge: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: C.text,
    minHeight: 140,
    textAlignVertical: "top",
    lineHeight: 26,
  },
  charCountSmall: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  charCountTextSmall: {
    fontSize: 11,
    color: C.textSecondary,
  },
  imagePreviewRow: {
    flexDirection: "row",
    gap: 8,
  },
  imagePreviewItem: {
    position: "relative",
  },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: C.surface,
  },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.red,
    alignItems: "center",
    justifyContent: "center",
  },
  typeSelectorFull: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  typeBtnFull: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    gap: 6,
  },
  typeBtnTextFull: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
  },
  typeBtnSubFull: {
    fontSize: 11,
    color: C.textSecondary,
  },
  textInputContainerFull: {
    flex: 1,
    margin: 16,
  },
  composeInputFull: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: C.text,
    textAlignVertical: "top",
    lineHeight: 28,
  },
  charCountFull: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  charCountTextFull: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: "600",
  },
  tagsContainerFull: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: C.surface,
    borderRadius: 12,
  },
  tagsHeaderFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  tagsLabelFull: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSecondary,
    textTransform: "uppercase",
  },
  tagsRowFull: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagPillFull: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagTextFull: {
    fontSize: 12,
    fontWeight: "600",
  },
  composeActionsFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  attachRowFull: {
    flexDirection: "row",
    gap: 10,
  },
  attachBtnFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: C.surface,
  },
  attachTextFull: {
    fontSize: 13,
    color: C.text,
    fontWeight: "600",
  },
  submitBtnFull: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 26,
    paddingVertical: 16,
  },
  submitTextFull: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
