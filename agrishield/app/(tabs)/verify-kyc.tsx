import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const C = Colors.light;

// Mock KYC applications data
const MOCK_KYC_APPLICATIONS = [
  {
    id: 'kyc_001',
    userId: 'user_001',
    name: 'ဦးစောလှိုင်',
    npc: '၁၂/မန္တလေး(N)၁၂၃၅၆',
    township: 'ညောင်ဦး',
    family: 4,
    incomeLevel: '50',
    score: 180,
    status: 'pending',
    type: 'initial',
    assets: [
      { type: 'form7', details: 'မြေပိုင်ဆိုင်မှု - ၅ ဧက', hasFile: true },
      { type: 'vehicle', details: 'လယ်ထွန်စက်', hasFile: true },
    ],
    submittedAt: '2026-03-28',
  },
  {
    id: 'kyc_002',
    userId: 'user_002',
    name: 'ဒေါ်မြမြ',
    npc: '၁၄/ရန်ကုန်(N)၆၅၄၃၂၁',
    township: 'မေမြို',
    family: 5,
    incomeLevel: '100',
    score: 280,
    status: 'pending',
    type: 'initial',
    assets: [
      { type: 'house', details: 'အိမ်ပိုင်ဆိုင်မှု', hasFile: true },
      { type: 'land_area', value: '10', details: '၁၀ ဧက', hasFile: true },
      { type: 'business', details: 'ကုန်သွယ်ရေး လိုင်စင်', hasFile: true },
    ],
    submittedAt: '2026-03-27',
  },
  {
    id: 'kyc_003',
    userId: 'user_003',
    name: 'ဦးကျော်ဇော',
    npc: '၁၀/နေပြည်တော်(N)၁၁၁၂၂၂',
    township: 'နေပြည်တော်',
    family: 6,
    incomeLevel: '150',
    score: 380,
    status: 'pending',
    type: 'advanced',
    assets: [
      { type: 'form7', details: 'မြေပိုင်ဆိုင်မှု - ၂၀ က', hasFile: true },
      { type: 'house', details: 'အိမ် ၂ လုံး', hasFile: true },
      { type: 'business', details: 'စက်ရုံ', hasFile: true },
      { type: 'vehicle', details: 'ကား ၂ စီး', hasFile: true },
    ],
    submittedAt: '2026-03-26',
  },
];

// Mock verified history data
const MOCK_VERIFIED_HISTORY = [
  {
    id: 'kyc_101',
    userId: 'user_101',
    name: 'ဦးဘဘ',
    npc: '၀၉/မန္တလေး(N)၉၉၉၈၈၈',
    township: 'မန္တလေး',
    score: 250,
    status: 'approved',
    type: 'initial',
    verifiedAt: '2026-03-29',
    verifiedBy: 'Validator',
  },
  {
    id: 'kyc_102',
    userId: 'user_102',
    name: 'ဒေါ်အေးအေး',
    npc: '၀၈/ရန်ကုန်(N)၇၇၇၆၆၆',
    township: 'ရန်ကုန်',
    score: 420,
    status: 'approved',
    type: 'advanced',
    verifiedAt: '2026-03-29',
    verifiedBy: 'Validator',
  },
  {
    id: 'kyc_103',
    userId: 'user_103',
    name: 'ဦးညွန့်ဝင်း',
    npc: '၀၇/တောင်ကြီး(N)၅၅၅၄၄',
    township: 'တောင်ကြီး',
    score: 150,
    status: 'rejected',
    type: 'initial',
    verifiedAt: '2026-03-29',
    verifiedBy: 'Validator',
    rejectionReason: 'မှားယွင်းသော အချက်အလက်များ',
  },
  {
    id: 'kyc_104',
    userId: 'user_104',
    name: 'ဒေါ်ကြည်ကြည်',
    npc: '၀၆/မန္တလေး(N)၄၄၄၃၃',
    township: 'မန္တလေး',
    score: 320,
    status: 'approved',
    type: 'initial',
    verifiedAt: '2026-03-28',
    verifiedBy: 'Validator',
  },
];

type ViewType = 'main' | 'applications' | 'history' | 'detail';

export default function VerifyKYCScreen() {
  const router = useRouter();
  const { user, isValidator, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<ViewType>('main');
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kycApplications, setKycApplications] = useState(MOCK_KYC_APPLICATIONS);
  const [verifiedHistory, setVerifiedHistory] = useState(MOCK_VERIFIED_HISTORY);

  // Check if user has permission (validator or admin only)
  if (!user || (!isValidator() && !isAdmin())) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KYC စိစစ်အတည်ပြုခြင်း</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorCard}>
          <Feather name="x-octagon" size={40} color={C.amberDark} />
          <Text style={styles.errorTitle}>ဝင်ခွင့်မပြုပါ</Text>
          <Text style={styles.errorText}>စိစစ်ရေးမှူး သို့မဟုတ် အက်ဒမင်များသာ ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
            <Text style={styles.errorBtnText}>နောက်သို့ပြန်</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const pendingCount = kycApplications.length;
  const verifiedToday = verifiedHistory.filter(k => k.verifiedAt === '2026-03-29').length;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleVerify = (kycId: string, action: 'approve' | 'reject' | 'send_back') => {
    Alert.alert(
      action === 'approve' ? 'အတည်ပြုမည်' : action === 'reject' ? 'ပယ်ချမည်' : 'ပြန်လည်တင်ခိုင်းမည်',
      'သေချာပါသလား?',
      [
        { text: 'မလုပ်တော့ပါ', style: 'cancel' },
        {
          text: action === 'approve' ? 'အတည်ပြု' : action === 'reject' ? 'ပယ်ချ' : 'အတည်ပြု',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update the application status
            setKycApplications(prev => prev.filter(k => k.id !== kycId));

            // Add to verified history
            const kyc = kycApplications.find(k => k.id === kycId);
            if (kyc) {
              setVerifiedHistory(prev => [{
                ...kyc,
                status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
                verifiedAt: '2026-03-29',
                verifiedBy: 'Validator',
                rejectionReason: action === 'reject' ? 'အချက်အလက် မကိုက်ညီ' : undefined,
              }, ...prev]);
            }

            Alert.alert('အောင်မြင်', `KYC ကို ${action === 'approve' ? 'အတည်ပြု' : action === 'reject' ? 'ပယ်ချ' : 'ပြန်လည်တင်ခိုင်း'}ပြီးပါပြီ`);
            setSelectedKYC(null);
            setView('main');
            setIsProcessing(false);
          },
        },
      ]
    );
  };

  const renderMainView = () => (
    <>
      {/* Stats Cards */}
      <View style={[styles.statsContainer, { marginTop: 8 }]}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => setView('applications')}
          activeOpacity={0.7}
        >
          <View style={styles.statIconContainer}>
            <Feather name="check-square" size={28} color={C.blue} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statTitle}>KYC Applications</Text>
            <Text style={styles.statSubtitle}>{pendingCount} pending review</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeText}>{pendingCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => setView('history')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconContainer, { backgroundColor: C.greenLight }]}>
            <Feather name="file-text" size={28} color={C.greenDark} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statTitle}>Verified Today</Text>
            <Text style={styles.statSubtitle}>{verifiedToday} applications</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{kycApplications.filter(k => k.type === 'initial').length}</Text>
          <Text style={styles.quickStatLabel}>Initial KYC</Text>
        </View>
        <View style={[styles.quickStatDivider, { backgroundColor: C.border }]} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{kycApplications.filter(k => k.type === 'advanced').length}</Text>
          <Text style={styles.quickStatLabel}>Advanced KYC</Text>
        </View>
        <View style={[styles.quickStatDivider, { backgroundColor: C.border }]} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{verifiedToday}</Text>
          <Text style={styles.quickStatLabel}>Verified</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => setView('history')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentList}>
          {verifiedHistory.slice(0, 3).map((kyc, idx) => (
            <View key={kyc.id} style={[styles.recentItem, idx < 2 && styles.recentItemBorder]}>
              <View style={styles.recentIcon}>
                <Feather
                  name={kyc.status === 'approved' ? 'check-circle' : 'x-circle'}
                  size={18}
                  color={kyc.status === 'approved' ? C.greenDark : C.red}
                />
              </View>
              <View style={styles.recentContent}>
                <Text style={styles.recentName}>{kyc.name}</Text>
                <Text style={styles.recentInfo}>
                  {kyc.type === 'initial' ? 'Initial KYC' : 'Advanced KYC'} • {kyc.status === 'approved' ? 'Approved' : 'Rejected'}
                </Text>
              </View>
              <Text style={styles.recentTime}>{kyc.verifiedAt}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const renderApplicationsView = () => (
    <>
      {/* Initial KYC Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.primary }]}>Initial KYC</Text>
          <View style={[styles.badge, { backgroundColor: C.primaryLight }]}>
            <Text style={[styles.badgeText, { color: C.primaryDark }]}>
              {kycApplications.filter(k => k.type === 'initial').length} PENDING
            </Text>
          </View>
        </View>
        {kycApplications.filter(k => k.type === 'initial').length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={32} color={C.textSecondary} />
            <Text style={styles.emptyText}>No pending Initial KYC.</Text>
          </View>
        ) : (
          kycApplications.filter(k => k.type === 'initial').map((kyc) => (
            <TouchableOpacity
              key={kyc.id}
              style={styles.applicationCard}
              onPress={() => { setSelectedKYC(kyc); setView('detail'); }}
            >
              <View style={styles.appHeader}>
                <View>
                  <Text style={styles.appName}>{kyc.name}</Text>
                  <Text style={styles.appTownship}>{kyc.township}</Text>
                </View>
                <View style={styles.appScore}>
                  <Text style={styles.appScoreValue}>{kyc.score}</Text>
                  <Text style={styles.appScoreLabel}>Score</Text>
                </View>
              </View>
              <View style={styles.appFooter}>
                <Text style={styles.appDate}>တင်သွင်းထားသည့်ရက် - {kyc.submittedAt}</Text>
                <Feather name="chevron-right" size={16} color={C.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Advanced KYC Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.purple }]}>Advanced KYC</Text>
          <View style={[styles.badge, { backgroundColor: C.purpleLight }]}>
            <Text style={[styles.badgeText, { color: C.purpleDark }]}>
              {kycApplications.filter(k => k.type === 'advanced').length} PENDING
            </Text>
          </View>
        </View>
        {kycApplications.filter(k => k.type === 'advanced').length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={32} color={C.textSecondary} />
            <Text style={styles.emptyText}>No pending Advanced KYC.</Text>
          </View>
        ) : (
          kycApplications.filter(k => k.type === 'advanced').map((kyc) => (
            <TouchableOpacity
              key={kyc.id}
              style={styles.applicationCard}
              onPress={() => { setSelectedKYC(kyc); setView('detail'); }}
            >
              <View style={styles.appHeader}>
                <View>
                  <Text style={styles.appName}>{kyc.name}</Text>
                  <Text style={styles.appTownship}>{kyc.township}</Text>
                </View>
                <View style={styles.appScore}>
                  <Text style={styles.appScoreValue}>{kyc.score}</Text>
                  <Text style={styles.appScoreLabel}>Score</Text>
                </View>
              </View>
              <View style={styles.appFooter}>
                <Text style={styles.appDate}>တင်သွင်းထားသည့်ရက် - {kyc.submittedAt}</Text>
                <Feather name="chevron-right" size={16} color={C.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Loan Requests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.blue }]}>Loan Requests</Text>
          <View style={[styles.badge, { backgroundColor: C.blueLight }]}>
            <Text style={[styles.badgeText, { color: C.blueDark }]}>0 PENDING</Text>
          </View>
        </View>
        <View style={styles.emptyCard}>
          <Feather name="check-circle" size={32} color={C.textSecondary} />
          <Text style={styles.emptyText}>No active requests.</Text>
        </View>
      </View>
    </>
  );

  const renderHistoryView = () => (
    <>
      <View style={styles.section}>
        <View style={styles.historySummary}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: C.greenDark }]}>
              {verifiedHistory.filter(k => k.verifiedAt === '2026-03-29' && k.status === 'approved').length}
            </Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: C.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: C.red }]}>
              {verifiedHistory.filter(k => k.verifiedAt === '2026-03-29' && k.status === 'rejected').length}
            </Text>
            <Text style={styles.summaryLabel}>Rejected</Text>
          </View>
        </View>

        {verifiedHistory.filter(k => k.verifiedAt === '2026-03-29').map((kyc, idx) => (
          <TouchableOpacity
            key={kyc.id}
            style={[styles.historyCard, idx > 0 && styles.historyCardBorder]}
            onPress={() => { setSelectedKYC(kyc); setView('detail'); }}
          >
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyName}>{kyc.name}</Text>
                <Text style={styles.historyTownship}>{kyc.township}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: kyc.status === 'approved' ? C.greenLight : C.redLight }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: kyc.status === 'approved' ? C.greenDark : C.red }
                ]}>
                  {kyc.status === 'approved' ? 'အတည်ပြု' : 'ပယ်ချ'}
                </Text>
              </View>
            </View>
            <View style={styles.historyFooter}>
              <Text style={styles.historyDate}>{kyc.verifiedAt}</Text>
              <Text style={styles.historyType}>{kyc.type === 'initial' ? 'Initial KYC' : 'Advanced KYC'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderDetailView = () => {
    if (!selectedKYC) return null;

    return (
      <View style={styles.detailContainer}>
        {/* Back Header */}
        <View style={styles.detailBackHeader}>
          <TouchableOpacity style={styles.backSmallBtn} onPress={() => setView('applications')}>
            <Feather name="arrow-left" size={18} color={C.text} />
            <Text style={styles.backSmallText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailPageTitle}>KYC Details</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailAvatar}>
                <Text style={styles.detailAvatarText}>{selectedKYC.name.charAt(0)}</Text>
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{selectedKYC.name}</Text>
                <Text style={styles.detailTownship}>{selectedKYC.township}</Text>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: selectedKYC.type === 'initial' ? C.blueLight : C.purpleLight }
                ]}>
                  <Text style={[
                    styles.typeBadgeText,
                    { color: selectedKYC.type === 'initial' ? C.blue : C.purple }
                  ]}>
                    {selectedKYC.type === 'initial' ? 'Initial KYC' : 'Advanced KYC'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailGridItem}>
                <Text style={styles.detailGridLabel}>NRC</Text>
                <Text style={styles.detailGridValue}>{selectedKYC.npc}</Text>
              </View>
              <View style={styles.detailGridItem}>
                <Text style={styles.detailGridLabel}>Family</Text>
                <Text style={styles.detailGridValue}>{selectedKYC.family || 'N/A'}</Text>
              </View>
              <View style={styles.detailGridItem}>
                <Text style={styles.detailGridLabel}>Income Level</Text>
                <Text style={styles.detailGridValue}>{selectedKYC.incomeLevel || 'N/A'}</Text>
              </View>
              <View style={styles.detailGridItem}>
                <Text style={styles.detailGridLabel}>Submitted</Text>
                <Text style={styles.detailGridValue}>{selectedKYC.submittedAt || selectedKYC.verifiedAt}</Text>
              </View>
            </View>

            <View style={styles.scoreSection}>
              <Text style={styles.scoreSectionLabel}>Credit Score</Text>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreCircleValue}>{selectedKYC.score}</Text>
                <Text style={styles.scoreCircleMax}>/ 500</Text>
              </View>
            </View>

            {selectedKYC.assets && selectedKYC.assets.length > 0 && (
              <View style={styles.assetsSection}>
                <Text style={styles.assetsTitle}>ပိုင်ဆိုင်မှုများ</Text>
                {selectedKYC.assets.map((asset: any, idx: number) => (
                  <View key={idx} style={styles.assetItem}>
                    <View style={styles.assetIcon}>
                      <Feather name={asset.hasFile ? 'check-circle' : 'file'} size={14} color={C.primary} />
                    </View>
                    <Text style={styles.assetText}>
                      {asset.type === 'form7' ? 'Form 7 (မြေပိုင်ဆိုင်မှု)' :
                       asset.type === 'house' ? 'အိမ်ပိုင်ဆိုင်မှု' :
                       asset.type === 'business' ? 'စီးပွားရေးလိုင်စင်' :
                       asset.type === 'vehicle' ? 'ယာဉ်ပိုင်ဆိုင်မှု' : 'မြေဧက'}
                    </Text>
                    {asset.details && <Text style={styles.assetDetails}>{asset.details}</Text>}
                  </View>
                ))}
              </View>
            )}

            {selectedKYC.rejectionReason && (
              <View style={styles.rejectionSection}>
                <Feather name="alert-circle" size={20} color={C.red} />
                <View style={styles.rejectionContent}>
                  <Text style={styles.rejectionTitle}>ပယ်ချရသည့်အကြောင်းရင်း</Text>
                  <Text style={styles.rejectionReason}>{selectedKYC.rejectionReason}</Text>
                </View>
              </View>
            )}
          </View>

          {selectedKYC.status === 'pending' && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleVerify(selectedKYC.id, 'reject')}
                disabled={isProcessing}
              >
                <Feather name="x-circle" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>ပယ်ချ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.sendBackBtn]}
                onPress={() => handleVerify(selectedKYC.id, 'send_back')}
                disabled={isProcessing}
              >
                <Feather name="arrow-left" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>ပြန်လည်တင်ခိုင်း</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleVerify(selectedKYC.id, 'approve')}
                disabled={isProcessing}
              >
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>အတည်ပြု</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
      }
    >
      {/* Header - Only show on main view */}
      {view === 'main' && (
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      )}

      {view === 'main' && renderMainView()}
      {view === 'applications' && renderApplicationsView()}
      {view === 'history' && renderHistoryView()}
      {view === 'detail' && renderDetailView()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  refreshBtn: {
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
  errorCard: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.amberDark,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  errorBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  // Stats Cards
  statsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
    marginLeft: 14,
  },
  statTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
  },
  statBadge: {
    backgroundColor: C.redLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.red,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 16,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.primary,
  },
  quickStatLabel: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 4,
  },
  quickStatDivider: {
    width: 0.5,
    height: 40,
    marginHorizontal: 8,
  },
  // Section
  section: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  seeAllText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  emptyCard: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 8,
  },
  // Recent Activity
  recentList: {
    padding: 14,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentContent: {
    flex: 1,
    marginLeft: 12,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  recentInfo: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  recentTime: {
    fontSize: 11,
    color: C.textSecondary,
  },
  // Back Header
  backSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backSmallText: {
    fontSize: 14,
    color: C.textSecondary,
  },
  detailContainer: {
    flex: 1,
  },
  detailBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailPageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  // History Summary
  historySummary: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 0.5,
    height: 50,
  },
  // History Card
  historyCard: {
    padding: 14,
  },
  historyCardBorder: {
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  historyTownship: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 11,
    color: C.textSecondary,
  },
  historyType: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: '500',
  },
  // Application Card
  applicationCard: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  appTownship: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  appScore: {
    alignItems: 'center',
  },
  appScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
  },
  appScoreLabel: {
    fontSize: 9,
    color: C.textSecondary,
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appDate: {
    fontSize: 11,
    color: C.textSecondary,
  },
  // Detail View
  detailScroll: {
    flex: 1,
  },
  detailCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 14,
  },
  detailName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  detailTownship: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailGridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
  },
  detailGridLabel: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailGridValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: '500',
    marginTop: 4,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginBottom: 16,
  },
  scoreSectionLabel: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreCircleValue: {
    fontSize: 36,
    fontWeight: '700',
    color: C.primary,
  },
  scoreCircleMax: {
    fontSize: 14,
    color: C.textSecondary,
    marginLeft: 4,
  },
  assetsSection: {
    marginBottom: 16,
  },
  assetsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assetIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  assetText: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    fontWeight: '500',
  },
  assetDetails: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  rejectionSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.redLight,
    borderRadius: 12,
    padding: 12,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.red,
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 12,
    color: C.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  approveBtn: {
    backgroundColor: C.greenDark,
  },
  rejectBtn: {
    backgroundColor: C.red,
  },
  sendBackBtn: {
    backgroundColor: C.amberDark,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
