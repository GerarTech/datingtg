// User Verification System via Telegram
import { UserProfile } from '../context/AppContext';

export interface VerificationRequest {
  telegramUserId: number;
  telegramUsername: string;
  datingUsername: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: number;
  notes?: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  user?: UserProfile;
}

// In-memory storage for demo (use database in production)
const verificationRequests: Map<string, VerificationRequest> = new Map();

export const createVerificationRequest = (
  telegramUserId: number,
  telegramUsername: string,
  datingUsername: string
): VerificationRequest => {
  const request: VerificationRequest = {
    telegramUserId,
    telegramUsername,
    datingUsername,
    requestedAt: Date.now(),
    status: 'pending'
  };
  
  verificationRequests.set(datingUsername, request);
  return request;
};

export const reviewVerificationRequest = (
  datingUsername: string,
  status: 'approved' | 'rejected',
  notes?: string
): boolean => {
  const request = verificationRequests.get(datingUsername);
  if (!request) return false;
  
  request.status = status;
  request.reviewedAt = Date.now();
  if (notes) request.notes = notes;
  
  return true;
};

export const getVerificationRequest = (datingUsername: string): VerificationRequest | null => {
  return verificationRequests.get(datingUsername) || null;
};

export const getAllVerificationRequests = (): VerificationRequest[] => {
  return Array.from(verificationRequests.values());
};

// Verification message templates
export const getVerificationMessage = (request: VerificationRequest): string => {
  switch (request.status) {
    case 'pending':
      return `🔍 Verification Request Received\n\n👤 User: @${request.telegramUsername}\n🎯 Dating Username: ${request.datingUsername}\n⏰ Requested: ${new Date(request.requestedAt).toLocaleString()}\n\n⏳ Status: Pending review\n\nOur team will verify your dating profile within 24 hours.`;
      
    case 'approved':
      return `✅ Verification Approved!\n\n🎉 Congratulations @${request.telegramUsername}!\n\n👤 Telegram: @${request.telegramUsername}\n💕 Dating: ${request.datingUsername}\n✅ Status: VERIFIED\n\nYour profile is now verified with a blue checkmark. You'll get access to premium features!${request.notes ? `\n\n📝 Notes: ${request.notes}` : ''}`;
      
    case 'rejected':
      return `❌ Verification Rejected\n\n👤 User: @${request.telegramUsername}\n🎯 Dating: ${request.datingUsername}\n❌ Status: REJECTED\n\nUnfortunately, we couldn't verify your profile at this time.${request.notes ? `\n\n📝 Reason: ${request.notes}` : '\n\nPlease review our guidelines and try again.'}`;
      
    default:
      return '❓ Unknown verification status';
  }
};

// Auto-verification logic
export const autoVerifyUser = (
  telegramUserId: number,
  telegramUsername: string,
  datingProfile: UserProfile
): VerificationResult => {
  // Check if user meets basic verification criteria
  const hasProfilePhoto = !!datingProfile.photo;
  const hasValidBio = datingProfile.bio && datingProfile.bio.length >= 20;
  const hasValidAge = datingProfile.age >= 18 && datingProfile.age <= 100;
  const hasValidLocation = !!datingProfile.location;
  
  const isCompleteProfile = hasProfilePhoto && hasValidBio && hasValidAge && hasValidLocation;
  
  if (isCompleteProfile) {
    // Auto-approve users with complete profiles
    const request = createVerificationRequest(telegramUserId, telegramUsername, datingProfile.username);
    request.status = 'approved';
    request.reviewedAt = Date.now();
    request.notes = 'Auto-approved: Complete profile with photo, bio, and valid age';
    
    return {
      success: true,
      message: '✅ Profile automatically verified! Welcome to Yene Premium.',
      user: {
        ...datingProfile,
        isVerified: true,
        verificationStatus: 'verified'
      }
    };
  } else {
    return {
      success: false,
      message: `❌ Profile incomplete for verification. Please add:\n${!hasProfilePhoto ? '• Profile photo\n' : ''}${!hasValidBio ? '• Bio (min 20 characters)\n' : ''}${!hasValidAge ? '• Valid age (18-100)\n' : ''}${!hasValidLocation ? '• Location\n' : ''}`
    };
  }
};
