/**
 * RBAC + Authentication + KYC System Types
 */

// User Roles
export type UserRole = 'farmer' | 'expert' | 'validator' | 'admin';

// KYC Status
export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'send_back';

// User Tier based on score
export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  tier: UserTier;
  score: number;
  kycStatus: KYCStatus;
  township: string;
  familyHead?: string;
  landOwnership?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  name: string;
  township: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'nrc' | 'township_letter' | 'family_validation' | 'ownership_declaration' | 'form_7' | 'township_approval';
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  stage: 1 | 2;
  documents: KYCDocument[];
  status: KYCStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  sendBackReason?: string;
}

export interface PointAction {
  id: string;
  name: string;
  description: string;
  delta: number;
  category: 'community' | 'kyc' | 'loan' | 'climate';
}

export interface PointHistory {
  id: string;
  userId: string;
  actionId: string;
  actionName: string;
  delta: number;
  previousScore: number;
  newScore: number;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'late';
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  dueDate?: string;
  repaidAt?: string;
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  subscriptionRequired?: boolean;
}

// Tier configuration
export const TIER_CONFIG: Record<UserTier, { range: [number, number]; loanMultiplier: number; label: string }> = {
  bronze: { range: [0, 299], loanMultiplier: 1, label: 'Bronze' },
  silver: { range: [300, 599], loanMultiplier: 2, label: 'Silver' },
  gold: { range: [600, 899], loanMultiplier: 3, label: 'Gold' },
  platinum: { range: [900, 1000], loanMultiplier: 5, label: 'Platinum' },
};

// Point actions configuration
export const POINT_ACTIONS: PointAction[] = [
  // Community actions
  { id: 'post_question', name: 'Post Question', description: 'Ask a question in the community', delta: 5, category: 'community' },
  { id: 'post_answer', name: 'Post Answer', description: 'Answer a question', delta: 10, category: 'community' },
  { id: 'helpful_received', name: 'Helpful Received', description: 'Receive helpful vote', delta: 3, category: 'community' },
  { id: 'share_knowledge', name: 'Share Knowledge', description: 'Share farming tip', delta: 15, category: 'community' },

  // KYC actions
  { id: 'submit_kyc_stage1', name: 'Submit KYC Stage 1', description: 'Complete initial KYC', delta: 50, category: 'kyc' },
  { id: 'submit_kyc_stage2', name: 'Submit KYC Stage 2', description: 'Complete advanced KYC', delta: 100, category: 'kyc' },
  { id: 'kyc_approved', name: 'KYC Approved', description: 'KYC verification passed', delta: 50, category: 'kyc' },

  // Loan actions
  { id: 'repay_on_time', name: 'Repay On Time', description: 'Repay loan on time', delta: 30, category: 'loan' },
  { id: 'early_repayment', name: 'Early Repayment', description: 'Repay loan early', delta: 50, category: 'loan' },
  { id: 'late_repayment', name: 'Late Repayment', description: 'Repay loan late', delta: -20, category: 'loan' },
  { id: 'missed_repayment', name: 'Missed Repayment', description: 'Miss loan repayment', delta: -50, category: 'loan' },

  // Climate actions
  { id: 'report_disaster', name: 'Report Disaster', description: 'Report climate disaster', delta: 10, category: 'climate' },
  { id: 'verify_disaster', name: 'Verify Disaster', description: 'Verify disaster report', delta: 15, category: 'climate' },
];

// Helper functions
export function getUserTier(score: number): UserTier {
  if (score >= 900) return 'platinum';
  if (score >= 600) return 'gold';
  if (score >= 300) return 'silver';
  return 'bronze';
}

export function getMaxLoanAmount(score: number, baseAmount: number = 100000): number {
  const tier = getUserTier(score);
  return baseAmount * TIER_CONFIG[tier].loanMultiplier;
}

export function canAccessFeature(score: number, feature: 'expert' | 'validator' | 'admin'): boolean {
  if (feature === 'expert') return score >= 300;
  if (feature === 'validator') return false; // Requires subscription
  if (feature === 'admin') return false; // Requires admin role
  return false;
}

export function requiresKYCStage2(score: number): boolean {
  return score >= 300;
}
