import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const C = Colors.light;

const ASSET_TYPES = [
  { type: 'form7', label: 'မြေပိုင်ဆိုင်မှု (Form 7)', points: '+50 pts' },
  { type: 'house', label: 'အိမ်ပိုင်ဆိုင်မှု', points: '+50 pts' },
  { type: 'business', label: 'စီးပွားရေး လိုင်စင်', points: '+50 pts' },
  { type: 'vehicle', label: 'စက်ကရိယာ / ယာဉ်', points: '+30 pts' },
  { type: 'land_area', label: 'မြေဧက', points: '+5 pts/ဧက' },
];

const INCOME_LEVELS = [
  { value: '30', label: '၁၀ - ၂၀ သိန်း', points: '+30 pts' },
  { value: '50', label: '၂၀ - ၄၀ သိန်း', points: '+50 pts' },
  { value: '100', label: '၄၀ - ၈၀ သိန်း', points: '+100 pts' },
  { value: '150', label: '၈၀ - ၁၆၀ သိန်း', points: '+150 pts' },
  { value: '200', label: '၁၆၀ သိန်း အထက်', points: '+200 pts' },
];

interface Asset {
  id: string;
  type: string;
  value: string;
  details: string;
  hasFile: boolean;
}

export default function KYCScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();

  // Check if user has permission (farmer or expert role only, not by score)
  const isFarmer = user?.role === 'farmer';
  const isExpert = user?.role === 'expert';

  if (!user || (!isFarmer && !isExpert)) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KYC အတည်ပြုခြင်း</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorCard}>
          <Feather name="x-octagon" size={40} color={C.amberDark} />
          <Text style={styles.errorTitle}>ဝင်ခွင့်မပြုပါ</Text>
          <Text style={styles.errorText}>တောင်သူ သို့မဟုတ် ကျွမ်းကျင်သူများသာ KYC တင်သွင်းနိုင်ပါသည်</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
            <Text style={styles.errorBtnText}>နောက်သို့ပြန်</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycForm, setKycForm] = useState({
    name: user?.name || '',
    npc: '',
    township: user?.township || '',
    family: '4',
    incomeLevel: '30',
  });
  const [assets, setAssets] = useState<Asset[]>([]);

  const calculateScore = () => {
    let score = 100 + parseInt(kycForm.incomeLevel);

    assets.forEach(asset => {
      if (asset.type === 'form7') score += 50;
      else if (asset.type === 'house') score += 50;
      else if (asset.type === 'business') score += 50;
      else if (asset.type === 'vehicle') score += 30;
      else if (asset.type === 'land_area') score += (parseInt(asset.value || 0) * 5);
    });

    return Math.min(500, score);
  };

  const addAsset = () => {
    setAssets([...assets, {
      id: Date.now().toString(),
      type: 'form7',
      value: '',
      details: '',
      hasFile: false
    }]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSubmit = async () => {
    if (!kycForm.name.trim() || !kycForm.npc.trim()) {
      Alert.alert('အမှား', 'အမည်နှင့် နိုင်ငံသားစိစစ်ရေးကတ် နံပါတ်ကို ဖြည့်ပါ');
      return;
    }

    if (assets.length === 0) {
      Alert.alert('အသိပေးချက်', 'ပိုင်ဆိုင်မှု တစ်ခုခုကို ထည့်သွင်းပါ');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const calculatedScore = calculateScore();
    updateUser({
      kycStatus: 'pending',
      score: calculatedScore,
    });

    Alert.alert('အောင်မြင်', 'KYC လျှောက်လွှာ တင်သွင်းပြီးပါပြီ', [
      { text: 'အိုကေ', onPress: () => router.replace('/(tabs)/profile') }
    ]);

    setIsSubmitting(false);
  };

  const predictedScore = calculateScore();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC အတည်ပြုခြင်း</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Feather name="info" size={20} color={C.primary} />
        <Text style={styles.infoText}>
          KYC ပုံစံကို ဖြည့်စွက်ပြီး ပိုင်ဆိုင်မှုများကို ထည့်သွင်းပါ။ သင့် Credit Score ကို တွက်ချက်ပေးပါမည်။
        </Text>
      </View>

      {/* Current Status */}
      {user?.kycStatus && user.kycStatus !== 'not_submitted' && (
        <View style={[styles.statusCard, { backgroundColor:
          user.kycStatus === 'approved' ? C.greenLight :
          user.kycStatus === 'rejected' ? C.redLight :
          C.amberLight
        }]}>
          <Feather
            name={
              user.kycStatus === 'approved' ? 'check-circle' :
              user.kycStatus === 'rejected' ? 'x-circle' : 'clock'
            }
            size={20}
            color={
              user.kycStatus === 'approved' ? C.greenDark :
              user.kycStatus === 'rejected' ? C.red :
              C.amberDark
            }
          />
          <Text style={[styles.statusText, { color:
            user.kycStatus === 'approved' ? C.greenDark :
            user.kycStatus === 'rejected' ? C.red :
            C.amberDark
          }]}>
            {user.kycStatus === 'approved' ? 'KYC အတည်ပြုပြီး' :
             user.kycStatus === 'rejected' ? 'KYC ပယ်ချခံရ' : 'စိစစ်ဆဲ'}
          </Text>
        </View>
      )}

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>အခြေခံ အချက်အလက်</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>အမည်</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={18} color={C.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ဦး/ဒေါ် ..."
              placeholderTextColor={C.textSecondary}
              value={kycForm.name}
              onChangeText={(text) => setKycForm({ ...kycForm, name: text })}
              editable={!isSubmitting}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>နိုင်ငံသားစိစစ်ရေးကတ် နံပါတ် (NRC)</Text>
          <View style={styles.inputWrapper}>
            <Feather name="credit-card" size={18} color={C.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="၁၂/XXX(N)၁၂၄၅၆"
              placeholderTextColor={C.textSecondary}
              value={kycForm.npc}
              onChangeText={(text) => setKycForm({ ...kycForm, npc: text })}
              editable={!isSubmitting}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>မြို့နယ်</Text>
          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={18} color={C.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ညောင်ဦး"
              placeholderTextColor={C.textSecondary}
              value={kycForm.township}
              onChangeText={(text) => setKycForm({ ...kycForm, township: text })}
              editable={!isSubmitting}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>မိသားစု ဦးရေ</Text>
          <View style={styles.inputWrapper}>
            <Feather name="users" size={18} color={C.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="4"
              placeholderTextColor={C.textSecondary}
              value={kycForm.family}
              onChangeText={(text) => setKycForm({ ...kycForm, family: text })}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Income Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>နှစ်စဉ် ဝင်ငွေ</Text>
          <Text style={styles.sectionDesc}>ဝင်ငွေပမာဏကို ရွေးချယ်ပါ</Text>

          {INCOME_LEVELS.map((level, idx) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.optionCard,
                kycForm.incomeLevel === level.value && styles.optionCardSelected
              ]}
              onPress={() => setKycForm({ ...kycForm, incomeLevel: level.value })}
            >
              <View style={styles.optionRow}>
                <View style={[
                  styles.optionDot,
                  { backgroundColor: kycForm.incomeLevel === level.value ? C.primary : C.border }
                ]} />
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionLabel,
                    kycForm.incomeLevel === level.value && { color: C.primary }
                  ]}>{level.label}</Text>
                  <Text style={styles.optionPoints}>{level.points}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assets */}
        <View style={styles.section}>
          <View style={styles.assetsHeader}>
            <Text style={styles.sectionTitle}>ပိုင်ဆိုင်မှုများ</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addAsset}>
              <Feather name="plus" size={16} color={C.primary} />
              <Text style={styles.addBtnText}>ထည့်မည်</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>သင့်ပိုင်ဆိုင်မှုများကို ထည့်သွင်းပါ</Text>

          {assets.length === 0 ? (
            <View style={styles.emptyAssets}>
              <Feather name="inbox" size={32} color={C.textSecondary} />
              <Text style={styles.emptyText}>ပိုင်ဆိုင်မှု မရှိသေးပါ</Text>
            </View>
          ) : (
            assets.map((asset, idx) => (
              <View key={asset.id} style={[styles.assetCard, idx > 0 && styles.assetCardBorder]}>
                <View style={styles.assetHeader}>
                  <Text style={styles.assetNumber}>ပိုင်ဆိုင်မှု #{assets.indexOf(asset) + 1}</Text>
                  <TouchableOpacity onPress={() => removeAsset(asset.id)}>
                    <Feather name="trash-2" size={16} color={C.red} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ပိုင်ဆိုင်မှု အမျိုးအစား</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="package" size={18} color={C.textSecondary} style={styles.inputIcon} />
                    <TouchableOpacity
                      style={styles.selectorBtn}
                      onPress={() => {
                        const currentIndex = ASSET_TYPES.findIndex(t => t.type === asset.type);
                        const nextIndex = (currentIndex + 1) % ASSET_TYPES.length;
                        updateAsset(asset.id, 'type', ASSET_TYPES[nextIndex].type);
                      }}
                    >
                      <Text style={styles.selectorText}>
                        {ASSET_TYPES.find(t => t.type === asset.type)?.label || 'ရွေးပါ'}
                      </Text>
                      <Feather name="chevron-down" size={16} color={C.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {asset.type === 'land_area' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>ဧက အရေအတွက်</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="maximize-2" size={18} color={C.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="5"
                        placeholderTextColor={C.textSecondary}
                        value={asset.value}
                        onChangeText={(text) => updateAsset(asset.id, 'value', text)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>အသေးစိတ် (တည်နေရာ၊ အမှတ်)</Text>
                  <View style={styles.textareaWrapper}>
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      placeholder="..."
                      placeholderTextColor={C.textSecondary}
                      value={asset.details}
                      onChangeText={(text) => updateAsset(asset.id, 'details', text)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.uploadBtn,
                    asset.hasFile && styles.uploadBtnUploaded
                  ]}
                  onPress={() => updateAsset(asset.id, 'hasFile', !asset.hasFile)}
                >
                  <Feather
                    name={asset.hasFile ? 'check-circle' : 'upload-cloud'}
                    size={20}
                    color={asset.hasFile ? C.greenDark : C.textSecondary}
                  />
                  <Text style={[
                    styles.uploadBtnText,
                    asset.hasFile && { color: C.greenDark }
                  ]}>
                    {asset.hasFile ? 'ဖိုင် တင်ပြီး' : 'ဖိုင် တင်ရန် နှိပ်ပါ'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Score Preview */}
        <View style={styles.scorePreview}>
          <Text style={styles.scorePreviewLabel}>ခန့်မှန်း Credit Score</Text>
          <View style={styles.scorePreviewRow}>
            <Text style={styles.scorePreviewValue}>{predictedScore}</Text>
            <Text style={styles.scorePreviewMax}>/ 500</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>တင်သွင်းမည်</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: C.primaryDark,
    lineHeight: 18,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    flex: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 14,
    color: C.text,
    flex: 1,
  },
  textarea: {
    minHeight: 80,
  },
  textareaWrapper: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  optionCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  optionCardSelected: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13,
    color: C.text,
    fontWeight: '500',
  },
  optionPoints: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  assetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },
  emptyAssets: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 8,
  },
  assetCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  assetCardBorder: {
    marginTop: 8,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  uploadBtnUploaded: {
    backgroundColor: C.greenLight,
    borderColor: C.greenDark,
  },
  uploadBtnText: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '600',
  },
  scorePreview: {
    backgroundColor: C.primaryLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  scorePreviewLabel: {
    fontSize: 12,
    color: C.primaryDark,
    fontWeight: '600',
  },
  scorePreviewRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  scorePreviewValue: {
    fontSize: 32,
    fontWeight: '700',
    color: C.primary,
  },
  scorePreviewMax: {
    fontSize: 14,
    color: C.primaryDark,
    marginLeft: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
