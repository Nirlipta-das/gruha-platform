/**
 * GRUHA Wallet Service - Fraud Detection
 * Per PRD §11 - Fraud Detection Rules
 */

import { SpendingCategory, TokenType } from './config';
import { transactionDb, WalletTransaction } from './wallet-store';
import { logger } from './logger';

// Fraud detection rules per PRD §11
interface FraudCheckResult {
  score: number;
  flags: string[];
  action: 'ALLOW' | 'FLAG' | 'BLOCK';
}

export function checkForFraud(
  msmeId: string,
  vendorId: string,
  amount: bigint,
  category: SpendingCategory,
  tokenType: TokenType
): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;
  
  const amountNum = Number(amount);
  const recentTxns = transactionDb.findByMsme(msmeId, 10);
  
  // Rule 1: Round amount check (amounts like 10000, 20000, etc.)
  if (amountNum >= 10000 && amountNum % 1000 === 0) {
    score += 15;
    flags.push('ROUND_AMOUNT');
    logger.debug(`Fraud check: ROUND_AMOUNT flag for ${amountNum}`);
  }
  
  // Rule 2: Rapid-fire transactions (>5 in last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = recentTxns.filter(t => 
    new Date(t.createdAt) > oneHourAgo
  ).length;
  
  if (recentCount >= 5) {
    score += 20;
    flags.push('RAPID_FIRE');
    logger.debug(`Fraud check: RAPID_FIRE flag, ${recentCount} txns in last hour`);
  }
  
  // Rule 3: Same vendor repeated (>=3 times in last 24hrs)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sameVendorCount = recentTxns.filter(t => 
    t.vendorId === vendorId && new Date(t.createdAt) > oneDayAgo
  ).length;
  
  if (sameVendorCount >= 3) {
    score += 25;
    flags.push('VENDOR_COLLUSION_RISK');
    logger.debug(`Fraud check: VENDOR_COLLUSION_RISK flag, ${sameVendorCount} txns to same vendor`);
  }
  
  // Rule 4: Large transaction relative to history
  const avgAmount = recentTxns.length > 0
    ? recentTxns.reduce((sum, t) => sum + Number(t.amount), 0) / recentTxns.length
    : 0;
  
  if (avgAmount > 0 && amountNum > avgAmount * 5) {
    score += 15;
    flags.push('UNUSUAL_AMOUNT');
    logger.debug(`Fraud check: UNUSUAL_AMOUNT flag, ${amountNum} vs avg ${avgAmount}`);
  }
  
  // Rule 5: Wage spending limit (max 30% of total)
  if (category === SpendingCategory.WAGES && tokenType === TokenType.RELIEF_TOKEN) {
    const totalSpent = recentTxns.reduce((sum, t) => sum + Number(t.amount), 0);
    const wageSpent = recentTxns
      .filter(t => t.category === SpendingCategory.WAGES)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const wagePercent = totalSpent > 0 ? ((wageSpent + amountNum) / (totalSpent + amountNum)) * 100 : 0;
    
    if (wagePercent > 30) {
      score += 30;
      flags.push('WAGE_LIMIT_EXCEEDED');
      logger.debug(`Fraud check: WAGE_LIMIT_EXCEEDED flag, ${wagePercent.toFixed(1)}%`);
    }
  }
  
  // Rule 6: First-time vendor with large amount
  const hasUsedVendorBefore = recentTxns.some(t => t.vendorId === vendorId);
  if (!hasUsedVendorBefore && amountNum > 50000) {
    score += 10;
    flags.push('NEW_VENDOR_LARGE_AMOUNT');
    logger.debug(`Fraud check: NEW_VENDOR_LARGE_AMOUNT flag`);
  }
  
  // Determine action based on score
  let action: 'ALLOW' | 'FLAG' | 'BLOCK';
  if (score >= 50) {
    action = 'BLOCK';
  } else if (score >= 30) {
    action = 'FLAG';
  } else {
    action = 'ALLOW';
  }
  
  logger.info(`Fraud check result: score=${score}, action=${action}, flags=${flags.join(',')}`);
  
  return { score, flags, action };
}

// Check category restrictions per token type
export function validateCategory(tokenType: TokenType, category: SpendingCategory): boolean {
  // Resilience Credits (pre-disaster) can ONLY be used for storage and transport
  if (tokenType === TokenType.RESILIENCE_CREDIT) {
    return category === SpendingCategory.STORAGE || category === SpendingCategory.TRANSPORT;
  }
  
  // Relief Tokens (post-disaster) can be used for all categories
  return true;
}

// Get allowed categories for a token type
export function getAllowedCategories(tokenType: TokenType): SpendingCategory[] {
  if (tokenType === TokenType.RESILIENCE_CREDIT) {
    return [SpendingCategory.STORAGE, SpendingCategory.TRANSPORT];
  }
  return Object.values(SpendingCategory).filter(v => typeof v === 'number') as SpendingCategory[];
}
