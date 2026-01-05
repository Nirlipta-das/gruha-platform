// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GRUHAToken
 * @author GRUHA Platform
 * @notice GRUHA Dual Token System for Climate Resilience
 * @dev Implements Resilience Credits (pre-disaster) and Relief Tokens (post-disaster)
 * 
 * This contract manages:
 * 1. Token minting by authorized authorities
 * 2. Token spending with category enforcement
 * 3. Vendor settlements
 * 4. Complete audit trail on-chain
 */
contract GRUHAToken is AccessControl, ReentrancyGuard {
    
    // ============================================
    // ROLES
    // ============================================
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");
    
    // ============================================
    // TOKEN TYPES
    // ============================================
    enum TokenType {
        RESILIENCE_CREDIT,  // Pre-disaster: Storage, Transport only
        RELIEF_TOKEN        // Post-disaster: Repairs, Wages, Materials, Utilities
    }
    
    // ============================================
    // SPENDING CATEGORIES
    // ============================================
    enum Category {
        STORAGE,
        TRANSPORT,
        REPAIRS,
        WAGES,
        MATERIALS,
        UTILITIES,
        EQUIPMENT
    }
    
    // ============================================
    // DATA STRUCTURES
    // ============================================
    
    struct TokenAllocation {
        uint256 id;
        address msme;
        TokenType tokenType;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 validUntil;
        bytes32 disasterId;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Transaction {
        uint256 id;
        address msme;
        address vendor;
        uint256 allocationId;
        uint256 amount;
        Category category;
        bytes32 bookingId;
        uint256 timestamp;
        string proofHash; // IPFS hash of proof documents
    }
    
    struct Vendor {
        address wallet;
        string businessName;
        Category[] allowedCategories;
        uint256 totalEarnings;
        uint256 complianceScore;
        bool isVerified;
        bool isActive;
    }
    
    struct MSME {
        address wallet;
        string businessName;
        string udyamNumber;
        bool isVerified;
        bool isActive;
    }
    
    struct Disaster {
        bytes32 id;
        string name;
        string disasterType;
        uint256 declaredAt;
        uint256 totalAllocated;
        uint256 totalSpent;
        bool isActive;
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    uint256 private _allocationCounter;
    uint256 private _transactionCounter;
    
    // Mappings
    mapping(address => MSME) public msmes;
    mapping(address => Vendor) public vendors;
    mapping(bytes32 => Disaster) public disasters;
    mapping(uint256 => TokenAllocation) public allocations;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public msmeAllocations;
    mapping(address => uint256[]) public vendorTransactions;
    
    // Category rules for token types
    mapping(TokenType => mapping(Category => bool)) public allowedCategories;
    
    // Platform statistics
    uint256 public totalMinted;
    uint256 public totalSpent;
    uint256 public totalMSMEs;
    uint256 public totalVendors;
    uint256 public totalTransactions;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event MSMERegistered(address indexed wallet, string businessName, string udyamNumber);
    event VendorRegistered(address indexed wallet, string businessName);
    event DisasterDeclared(bytes32 indexed disasterId, string name, string disasterType);
    event TokensAllocated(
        uint256 indexed allocationId,
        address indexed msme,
        TokenType tokenType,
        uint256 amount,
        bytes32 disasterId
    );
    event TokensSpent(
        uint256 indexed transactionId,
        address indexed msme,
        address indexed vendor,
        uint256 amount,
        Category category,
        bytes32 bookingId
    );
    event VendorSettlement(address indexed vendor, uint256 amount, uint256 transactionId);
    event AllocationExpired(uint256 indexed allocationId, uint256 remainingAmount);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
        
        // Set allowed categories for Resilience Credits (pre-disaster)
        allowedCategories[TokenType.RESILIENCE_CREDIT][Category.STORAGE] = true;
        allowedCategories[TokenType.RESILIENCE_CREDIT][Category.TRANSPORT] = true;
        
        // Set allowed categories for Relief Tokens (post-disaster)
        allowedCategories[TokenType.RELIEF_TOKEN][Category.STORAGE] = true;
        allowedCategories[TokenType.RELIEF_TOKEN][Category.TRANSPORT] = true;
        allowedCategories[TokenType.RELIEF_TOKEN][Category.REPAIRS] = true;
        allowedCategories[TokenType.RELIEF_TOKEN][Category.WAGES] = true;
        allowedCategories[TokenType.RELIEF_TOKEN][Category.MATERIALS] = true;
        allowedCategories[TokenType.RELIEF_TOKEN][Category.UTILITIES] = true;
        allowedCategories[TokenType.RELIEF_TOKEN][Category.EQUIPMENT] = true;
    }
    
    // ============================================
    // MSME FUNCTIONS
    // ============================================
    
    /**
     * @notice Register a new MSME
     * @param _wallet MSME wallet address
     * @param _businessName Business name
     * @param _udyamNumber Udyam registration number
     */
    function registerMSME(
        address _wallet,
        string calldata _businessName,
        string calldata _udyamNumber
    ) external onlyRole(AUTHORITY_ROLE) {
        require(!msmes[_wallet].isActive, "MSME already registered");
        require(_wallet != address(0), "Invalid wallet address");
        
        msmes[_wallet] = MSME({
            wallet: _wallet,
            businessName: _businessName,
            udyamNumber: _udyamNumber,
            isVerified: true,
            isActive: true
        });
        
        totalMSMEs++;
        emit MSMERegistered(_wallet, _businessName, _udyamNumber);
    }
    
    // ============================================
    // VENDOR FUNCTIONS
    // ============================================
    
    /**
     * @notice Register a new Vendor
     * @param _wallet Vendor wallet address
     * @param _businessName Business name
     * @param _categories Allowed service categories
     */
    function registerVendor(
        address _wallet,
        string calldata _businessName,
        Category[] calldata _categories
    ) external onlyRole(AUTHORITY_ROLE) {
        require(!vendors[_wallet].isActive, "Vendor already registered");
        require(_wallet != address(0), "Invalid wallet address");
        require(_categories.length > 0, "Must have at least one category");
        
        vendors[_wallet] = Vendor({
            wallet: _wallet,
            businessName: _businessName,
            allowedCategories: _categories,
            totalEarnings: 0,
            complianceScore: 100,
            isVerified: true,
            isActive: true
        });
        
        _grantRole(VENDOR_ROLE, _wallet);
        totalVendors++;
        emit VendorRegistered(_wallet, _businessName);
    }
    
    // ============================================
    // DISASTER FUNCTIONS
    // ============================================
    
    /**
     * @notice Declare a new disaster event
     * @param _disasterId Unique disaster identifier
     * @param _name Disaster name
     * @param _disasterType Type of disaster (FLOOD, CYCLONE, etc.)
     */
    function declareDisaster(
        bytes32 _disasterId,
        string calldata _name,
        string calldata _disasterType
    ) external onlyRole(AUTHORITY_ROLE) {
        require(!disasters[_disasterId].isActive, "Disaster already exists");
        
        disasters[_disasterId] = Disaster({
            id: _disasterId,
            name: _name,
            disasterType: _disasterType,
            declaredAt: block.timestamp,
            totalAllocated: 0,
            totalSpent: 0,
            isActive: true
        });
        
        emit DisasterDeclared(_disasterId, _name, _disasterType);
    }
    
    // ============================================
    // TOKEN ALLOCATION FUNCTIONS
    // ============================================
    
    /**
     * @notice Allocate tokens to an MSME
     * @param _msme MSME wallet address
     * @param _tokenType Type of token (RESILIENCE_CREDIT or RELIEF_TOKEN)
     * @param _amount Amount to allocate (in wei-like units)
     * @param _validityDays Number of days until expiration
     * @param _disasterId Associated disaster ID
     */
    function allocateTokens(
        address _msme,
        TokenType _tokenType,
        uint256 _amount,
        uint256 _validityDays,
        bytes32 _disasterId
    ) external onlyRole(AUTHORITY_ROLE) nonReentrant {
        require(msmes[_msme].isActive, "MSME not registered");
        require(_amount > 0, "Amount must be positive");
        require(_validityDays > 0 && _validityDays <= 365, "Invalid validity");
        
        if (_disasterId != bytes32(0)) {
            require(disasters[_disasterId].isActive, "Disaster not active");
        }
        
        _allocationCounter++;
        uint256 allocationId = _allocationCounter;
        
        allocations[allocationId] = TokenAllocation({
            id: allocationId,
            msme: _msme,
            tokenType: _tokenType,
            totalAmount: _amount,
            remainingAmount: _amount,
            validUntil: block.timestamp + (_validityDays * 1 days),
            disasterId: _disasterId,
            isActive: true,
            createdAt: block.timestamp
        });
        
        msmeAllocations[_msme].push(allocationId);
        totalMinted += _amount;
        
        if (_disasterId != bytes32(0)) {
            disasters[_disasterId].totalAllocated += _amount;
        }
        
        emit TokensAllocated(allocationId, _msme, _tokenType, _amount, _disasterId);
    }
    
    // ============================================
    // TOKEN SPENDING FUNCTIONS
    // ============================================
    
    /**
     * @notice Spend tokens for a service
     * @param _allocationId Allocation to spend from
     * @param _vendor Vendor address
     * @param _amount Amount to spend
     * @param _category Service category
     * @param _bookingId Associated booking ID
     * @param _proofHash IPFS hash of proof documents
     */
    function spendTokens(
        uint256 _allocationId,
        address _vendor,
        uint256 _amount,
        Category _category,
        bytes32 _bookingId,
        string calldata _proofHash
    ) external nonReentrant {
        TokenAllocation storage allocation = allocations[_allocationId];
        
        // Validations
        require(allocation.isActive, "Allocation not active");
        require(allocation.msme == msg.sender, "Not your allocation");
        require(block.timestamp < allocation.validUntil, "Allocation expired");
        require(allocation.remainingAmount >= _amount, "Insufficient balance");
        require(vendors[_vendor].isActive, "Vendor not registered");
        require(_amount > 0, "Amount must be positive");
        
        // Category enforcement
        require(
            allowedCategories[allocation.tokenType][_category],
            "Category not allowed for this token type"
        );
        
        // Verify vendor can provide this category
        bool vendorAllowed = false;
        for (uint i = 0; i < vendors[_vendor].allowedCategories.length; i++) {
            if (vendors[_vendor].allowedCategories[i] == _category) {
                vendorAllowed = true;
                break;
            }
        }
        require(vendorAllowed, "Vendor not authorized for category");
        
        // Deduct from allocation
        allocation.remainingAmount -= _amount;
        
        // Create transaction record
        _transactionCounter++;
        uint256 txId = _transactionCounter;
        
        transactions[txId] = Transaction({
            id: txId,
            msme: msg.sender,
            vendor: _vendor,
            allocationId: _allocationId,
            amount: _amount,
            category: _category,
            bookingId: _bookingId,
            timestamp: block.timestamp,
            proofHash: _proofHash
        });
        
        vendorTransactions[_vendor].push(txId);
        totalSpent += _amount;
        totalTransactions++;
        
        // Update vendor earnings
        vendors[_vendor].totalEarnings += _amount;
        
        // Update disaster stats if applicable
        if (allocation.disasterId != bytes32(0)) {
            disasters[allocation.disasterId].totalSpent += _amount;
        }
        
        emit TokensSpent(txId, msg.sender, _vendor, _amount, _category, _bookingId);
        emit VendorSettlement(_vendor, _amount, txId);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get MSME's total available balance
     * @param _msme MSME address
     */
    function getMSMEBalance(address _msme) external view returns (uint256 total) {
        uint256[] memory allocs = msmeAllocations[_msme];
        for (uint i = 0; i < allocs.length; i++) {
            TokenAllocation memory alloc = allocations[allocs[i]];
            if (alloc.isActive && block.timestamp < alloc.validUntil) {
                total += alloc.remainingAmount;
            }
        }
    }
    
    /**
     * @notice Get MSME's allocations
     * @param _msme MSME address
     */
    function getMSMEAllocations(address _msme) external view returns (uint256[] memory) {
        return msmeAllocations[_msme];
    }
    
    /**
     * @notice Get vendor's transaction IDs
     * @param _vendor Vendor address
     */
    function getVendorTransactions(address _vendor) external view returns (uint256[] memory) {
        return vendorTransactions[_vendor];
    }
    
    /**
     * @notice Get platform statistics
     */
    function getStats() external view returns (
        uint256 _totalMinted,
        uint256 _totalSpent,
        uint256 _totalMSMEs,
        uint256 _totalVendors,
        uint256 _totalTransactions
    ) {
        return (totalMinted, totalSpent, totalMSMEs, totalVendors, totalTransactions);
    }
    
    /**
     * @notice Check if category is allowed for token type
     * @param _tokenType Token type
     * @param _category Category
     */
    function isCategoryAllowed(TokenType _tokenType, Category _category) external view returns (bool) {
        return allowedCategories[_tokenType][_category];
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @notice Deactivate expired allocations
     * @param _allocationId Allocation to deactivate
     */
    function deactivateExpiredAllocation(uint256 _allocationId) external {
        TokenAllocation storage allocation = allocations[_allocationId];
        require(block.timestamp >= allocation.validUntil, "Not expired yet");
        require(allocation.isActive, "Already deactivated");
        
        allocation.isActive = false;
        emit AllocationExpired(_allocationId, allocation.remainingAmount);
    }
    
    /**
     * @notice Update vendor compliance score
     * @param _vendor Vendor address
     * @param _newScore New compliance score (0-100)
     */
    function updateVendorCompliance(
        address _vendor,
        uint256 _newScore
    ) external onlyRole(AUTHORITY_ROLE) {
        require(vendors[_vendor].isActive, "Vendor not active");
        require(_newScore <= 100, "Score must be 0-100");
        vendors[_vendor].complianceScore = _newScore;
    }
    
    /**
     * @notice Suspend a vendor
     * @param _vendor Vendor address
     */
    function suspendVendor(address _vendor) external onlyRole(AUTHORITY_ROLE) {
        require(vendors[_vendor].isActive, "Vendor not active");
        vendors[_vendor].isActive = false;
        _revokeRole(VENDOR_ROLE, _vendor);
    }
}
