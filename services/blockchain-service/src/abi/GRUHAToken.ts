/**
 * GRUHA Token Contract ABI
 * Generated from compiled Solidity contract
 */

export const GRUHA_TOKEN_ABI = [
  // Constructor
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  
  // Errors
  { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
  { inputs: [{ name: "account", type: "address" }, { name: "neededRole", type: "bytes32" }], name: "AccessControlUnauthorizedAccount", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "allocationId", type: "uint256" }, { indexed: false, name: "remainingAmount", type: "uint256" }], name: "AllocationExpired", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "disasterId", type: "bytes32" }, { indexed: false, name: "name", type: "string" }, { indexed: false, name: "disasterType", type: "string" }], name: "DisasterDeclared", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "wallet", type: "address" }, { indexed: false, name: "businessName", type: "string" }, { indexed: false, name: "udyamNumber", type: "string" }], name: "MSMERegistered", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "role", type: "bytes32" }, { indexed: true, name: "previousAdminRole", type: "bytes32" }, { indexed: true, name: "newAdminRole", type: "bytes32" }], name: "RoleAdminChanged", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "role", type: "bytes32" }, { indexed: true, name: "account", type: "address" }, { indexed: true, name: "sender", type: "address" }], name: "RoleGranted", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "role", type: "bytes32" }, { indexed: true, name: "account", type: "address" }, { indexed: true, name: "sender", type: "address" }], name: "RoleRevoked", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "allocationId", type: "uint256" }, { indexed: true, name: "msme", type: "address" }, { indexed: false, name: "tokenType", type: "uint8" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "disasterId", type: "bytes32" }], name: "TokensAllocated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "transactionId", type: "uint256" }, { indexed: true, name: "msme", type: "address" }, { indexed: true, name: "vendor", type: "address" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "category", type: "uint8" }, { indexed: false, name: "bookingId", type: "bytes32" }], name: "TokensSpent", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "wallet", type: "address" }, { indexed: false, name: "businessName", type: "string" }], name: "VendorRegistered", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "vendor", type: "address" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "transactionId", type: "uint256" }], name: "VendorSettlement", type: "event" },
  
  // Role constants
  { inputs: [], name: "AUTHORITY_ROLE", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "DEFAULT_ADMIN_ROLE", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "VENDOR_ROLE", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  
  // View functions
  { inputs: [{ name: "", type: "uint256" }], name: "allocations", outputs: [{ name: "id", type: "uint256" }, { name: "msme", type: "address" }, { name: "tokenType", type: "uint8" }, { name: "totalAmount", type: "uint256" }, { name: "remainingAmount", type: "uint256" }, { name: "validUntil", type: "uint256" }, { name: "disasterId", type: "bytes32" }, { name: "isActive", type: "bool" }, { name: "createdAt", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint8" }, { name: "", type: "uint8" }], name: "allowedCategories", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "bytes32" }], name: "disasters", outputs: [{ name: "id", type: "bytes32" }, { name: "name", type: "string" }, { name: "disasterType", type: "string" }, { name: "declaredAt", type: "uint256" }, { name: "totalAllocated", type: "uint256" }, { name: "totalSpent", type: "uint256" }, { name: "isActive", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_msme", type: "address" }], name: "getMSMEAllocations", outputs: [{ type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_msme", type: "address" }], name: "getMSMEBalance", outputs: [{ name: "total", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "role", type: "bytes32" }], name: "getRoleAdmin", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getStats", outputs: [{ name: "_totalMinted", type: "uint256" }, { name: "_totalSpent", type: "uint256" }, { name: "_totalMSMEs", type: "uint256" }, { name: "_totalVendors", type: "uint256" }, { name: "_totalTransactions", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_vendor", type: "address" }], name: "getVendorTransactions", outputs: [{ type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], name: "hasRole", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_tokenType", type: "uint8" }, { name: "_category", type: "uint8" }], name: "isCategoryAllowed", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "msmes", outputs: [{ name: "wallet", type: "address" }, { name: "businessName", type: "string" }, { name: "udyamNumber", type: "string" }, { name: "isVerified", type: "bool" }, { name: "isActive", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "interfaceId", type: "bytes4" }], name: "supportsInterface", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalMSMEs", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalMinted", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSpent", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTransactions", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalVendors", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "transactions", outputs: [{ name: "id", type: "uint256" }, { name: "msme", type: "address" }, { name: "vendor", type: "address" }, { name: "allocationId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "category", type: "uint8" }, { name: "bookingId", type: "bytes32" }, { name: "timestamp", type: "uint256" }, { name: "proofHash", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "vendors", outputs: [{ name: "wallet", type: "address" }, { name: "businessName", type: "string" }, { name: "totalEarnings", type: "uint256" }, { name: "complianceScore", type: "uint256" }, { name: "isVerified", type: "bool" }, { name: "isActive", type: "bool" }], stateMutability: "view", type: "function" },
  
  // State-changing functions
  { inputs: [{ name: "_msme", type: "address" }, { name: "_tokenType", type: "uint8" }, { name: "_amount", type: "uint256" }, { name: "_validityDays", type: "uint256" }, { name: "_disasterId", type: "bytes32" }], name: "allocateTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_allocationId", type: "uint256" }], name: "deactivateExpiredAllocation", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_disasterId", type: "bytes32" }, { name: "_name", type: "string" }, { name: "_disasterType", type: "string" }], name: "declareDisaster", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], name: "grantRole", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_wallet", type: "address" }, { name: "_businessName", type: "string" }, { name: "_udyamNumber", type: "string" }], name: "registerMSME", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_wallet", type: "address" }, { name: "_businessName", type: "string" }, { name: "_categories", type: "uint8[]" }], name: "registerVendor", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "role", type: "bytes32" }, { name: "callerConfirmation", type: "address" }], name: "renounceRole", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], name: "revokeRole", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_allocationId", type: "uint256" }, { name: "_vendor", type: "address" }, { name: "_amount", type: "uint256" }, { name: "_category", type: "uint8" }, { name: "_bookingId", type: "bytes32" }, { name: "_proofHash", type: "string" }], name: "spendTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_vendor", type: "address" }], name: "suspendVendor", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_vendor", type: "address" }, { name: "_newScore", type: "uint256" }], name: "updateVendorCompliance", outputs: [], stateMutability: "nonpayable", type: "function" }
] as const;

export default GRUHA_TOKEN_ABI;
