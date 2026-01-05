import { expect } from "chai";
import { ethers } from "hardhat";
import { GRUHAToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GRUHAToken", function () {
  let gruhaToken: GRUHAToken;
  let admin: SignerWithAddress;
  let authority: SignerWithAddress;
  let msme1: SignerWithAddress;
  let msme2: SignerWithAddress;
  let vendor1: SignerWithAddress;
  let vendor2: SignerWithAddress;
  
  // Token types
  const RESILIENCE_CREDIT = 0;
  const RELIEF_TOKEN = 1;
  
  // Categories
  const STORAGE = 0;
  const TRANSPORT = 1;
  const REPAIRS = 2;
  const WAGES = 3;
  const MATERIALS = 4;
  const UTILITIES = 5;
  const EQUIPMENT = 6;

  beforeEach(async function () {
    [admin, authority, msme1, msme2, vendor1, vendor2] = await ethers.getSigners();
    
    const GRUHATokenFactory = await ethers.getContractFactory("GRUHAToken");
    gruhaToken = await GRUHATokenFactory.deploy();
    await gruhaToken.waitForDeployment();
    
    // Grant authority role to authority signer
    const AUTHORITY_ROLE = await gruhaToken.AUTHORITY_ROLE();
    await gruhaToken.grantRole(AUTHORITY_ROLE, authority.address);
  });

  describe("Deployment", function () {
    it("Should set the deployer as admin and authority", async function () {
      const DEFAULT_ADMIN_ROLE = await gruhaToken.DEFAULT_ADMIN_ROLE();
      const AUTHORITY_ROLE = await gruhaToken.AUTHORITY_ROLE();
      
      expect(await gruhaToken.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await gruhaToken.hasRole(AUTHORITY_ROLE, admin.address)).to.be.true;
    });

    it("Should configure correct category rules for Resilience Credits", async function () {
      expect(await gruhaToken.isCategoryAllowed(RESILIENCE_CREDIT, STORAGE)).to.be.true;
      expect(await gruhaToken.isCategoryAllowed(RESILIENCE_CREDIT, TRANSPORT)).to.be.true;
      expect(await gruhaToken.isCategoryAllowed(RESILIENCE_CREDIT, REPAIRS)).to.be.false;
      expect(await gruhaToken.isCategoryAllowed(RESILIENCE_CREDIT, WAGES)).to.be.false;
    });

    it("Should configure correct category rules for Relief Tokens", async function () {
      expect(await gruhaToken.isCategoryAllowed(RELIEF_TOKEN, STORAGE)).to.be.true;
      expect(await gruhaToken.isCategoryAllowed(RELIEF_TOKEN, TRANSPORT)).to.be.true;
      expect(await gruhaToken.isCategoryAllowed(RELIEF_TOKEN, REPAIRS)).to.be.true;
      expect(await gruhaToken.isCategoryAllowed(RELIEF_TOKEN, WAGES)).to.be.true;
      expect(await gruhaToken.isCategoryAllowed(RELIEF_TOKEN, MATERIALS)).to.be.true;
    });

    it("Should have zero initial statistics", async function () {
      const stats = await gruhaToken.getStats();
      expect(stats[0]).to.equal(0n); // totalMinted
      expect(stats[1]).to.equal(0n); // totalSpent
      expect(stats[2]).to.equal(0n); // totalMSMEs
      expect(stats[3]).to.equal(0n); // totalVendors
      expect(stats[4]).to.equal(0n); // totalTransactions
    });
  });

  describe("MSME Registration", function () {
    it("Should register MSME with authority role", async function () {
      await gruhaToken.connect(authority).registerMSME(
        msme1.address,
        "Test MSME Business",
        "UDYAM-XX-00-0000001"
      );
      
      const msme = await gruhaToken.msmes(msme1.address);
      expect(msme.wallet).to.equal(msme1.address);
      expect(msme.businessName).to.equal("Test MSME Business");
      expect(msme.udyamNumber).to.equal("UDYAM-XX-00-0000001");
      expect(msme.isVerified).to.be.true;
      expect(msme.isActive).to.be.true;
    });

    it("Should increment MSME count", async function () {
      await gruhaToken.connect(authority).registerMSME(msme1.address, "MSME 1", "UDYAM-1");
      await gruhaToken.connect(authority).registerMSME(msme2.address, "MSME 2", "UDYAM-2");
      
      expect(await gruhaToken.totalMSMEs()).to.equal(2n);
    });

    it("Should emit MSMERegistered event", async function () {
      await expect(
        gruhaToken.connect(authority).registerMSME(msme1.address, "Test MSME", "UDYAM-1")
      )
        .to.emit(gruhaToken, "MSMERegistered")
        .withArgs(msme1.address, "Test MSME", "UDYAM-1");
    });

    it("Should reject duplicate registration", async function () {
      await gruhaToken.connect(authority).registerMSME(msme1.address, "MSME 1", "UDYAM-1");
      
      await expect(
        gruhaToken.connect(authority).registerMSME(msme1.address, "MSME 1 Again", "UDYAM-1-AGAIN")
      ).to.be.revertedWith("MSME already registered");
    });

    it("Should reject registration without authority role", async function () {
      await expect(
        gruhaToken.connect(msme1).registerMSME(msme2.address, "Test", "UDYAM-1")
      ).to.be.reverted;
    });
  });

  describe("Vendor Registration", function () {
    it("Should register vendor with categories", async function () {
      await gruhaToken.connect(authority).registerVendor(
        vendor1.address,
        "Safe Storage Warehouse",
        [STORAGE, TRANSPORT]
      );
      
      const vendor = await gruhaToken.vendors(vendor1.address);
      expect(vendor.wallet).to.equal(vendor1.address);
      expect(vendor.businessName).to.equal("Safe Storage Warehouse");
      expect(vendor.isVerified).to.be.true;
      expect(vendor.isActive).to.be.true;
      expect(vendor.complianceScore).to.equal(100n);
    });

    it("Should grant vendor role", async function () {
      await gruhaToken.connect(authority).registerVendor(
        vendor1.address,
        "Warehouse",
        [STORAGE]
      );
      
      const VENDOR_ROLE = await gruhaToken.VENDOR_ROLE();
      expect(await gruhaToken.hasRole(VENDOR_ROLE, vendor1.address)).to.be.true;
    });

    it("Should reject registration with no categories", async function () {
      await expect(
        gruhaToken.connect(authority).registerVendor(vendor1.address, "Vendor", [])
      ).to.be.revertedWith("Must have at least one category");
    });
  });

  describe("Disaster Declaration", function () {
    const disasterId = ethers.id("CYCLONE-2024-001");

    it("Should declare a disaster", async function () {
      await gruhaToken.connect(authority).declareDisaster(
        disasterId,
        "Cyclone Amphan",
        "CYCLONE"
      );
      
      const disaster = await gruhaToken.disasters(disasterId);
      expect(disaster.id).to.equal(disasterId);
      expect(disaster.name).to.equal("Cyclone Amphan");
      expect(disaster.disasterType).to.equal("CYCLONE");
      expect(disaster.isActive).to.be.true;
    });

    it("Should emit DisasterDeclared event", async function () {
      await expect(
        gruhaToken.connect(authority).declareDisaster(disasterId, "Cyclone Test", "CYCLONE")
      )
        .to.emit(gruhaToken, "DisasterDeclared")
        .withArgs(disasterId, "Cyclone Test", "CYCLONE");
    });
  });

  describe("Token Allocation", function () {
    beforeEach(async function () {
      await gruhaToken.connect(authority).registerMSME(msme1.address, "MSME 1", "UDYAM-1");
    });

    it("Should allocate Resilience Credits to MSME", async function () {
      const amount = ethers.parseEther("10000"); // 10,000 tokens
      
      await gruhaToken.connect(authority).allocateTokens(
        msme1.address,
        RESILIENCE_CREDIT,
        amount,
        30, // 30 days validity
        ethers.ZeroHash
      );
      
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      expect(allocations.length).to.equal(1);
      
      const allocation = await gruhaToken.allocations(allocations[0]);
      expect(allocation.msme).to.equal(msme1.address);
      expect(allocation.totalAmount).to.equal(amount);
      expect(allocation.remainingAmount).to.equal(amount);
      expect(allocation.tokenType).to.equal(RESILIENCE_CREDIT);
      expect(allocation.isActive).to.be.true;
    });

    it("Should update totalMinted", async function () {
      const amount = ethers.parseEther("5000");
      
      await gruhaToken.connect(authority).allocateTokens(
        msme1.address,
        RESILIENCE_CREDIT,
        amount,
        30,
        ethers.ZeroHash
      );
      
      expect(await gruhaToken.totalMinted()).to.equal(amount);
    });

    it("Should correctly calculate MSME balance", async function () {
      const amount1 = ethers.parseEther("5000");
      const amount2 = ethers.parseEther("3000");
      
      await gruhaToken.connect(authority).allocateTokens(
        msme1.address,
        RESILIENCE_CREDIT,
        amount1,
        30,
        ethers.ZeroHash
      );
      
      await gruhaToken.connect(authority).allocateTokens(
        msme1.address,
        RELIEF_TOKEN,
        amount2,
        60,
        ethers.ZeroHash
      );
      
      const balance = await gruhaToken.getMSMEBalance(msme1.address);
      expect(balance).to.equal(amount1 + amount2);
    });

    it("Should reject allocation to unregistered MSME", async function () {
      await expect(
        gruhaToken.connect(authority).allocateTokens(
          msme2.address, // Not registered
          RESILIENCE_CREDIT,
          ethers.parseEther("1000"),
          30,
          ethers.ZeroHash
        )
      ).to.be.revertedWith("MSME not registered");
    });
  });

  describe("Token Spending", function () {
    const amount = ethers.parseEther("10000");
    const spendAmount = ethers.parseEther("2500");
    const bookingId = ethers.id("BOOKING-001");

    beforeEach(async function () {
      // Register MSME
      await gruhaToken.connect(authority).registerMSME(msme1.address, "MSME 1", "UDYAM-1");
      
      // Register Vendor for STORAGE
      await gruhaToken.connect(authority).registerVendor(
        vendor1.address,
        "Safe Warehouse",
        [STORAGE, TRANSPORT]
      );
      
      // Allocate Resilience Credits
      await gruhaToken.connect(authority).allocateTokens(
        msme1.address,
        RESILIENCE_CREDIT,
        amount,
        30,
        ethers.ZeroHash
      );
    });

    it("Should spend tokens on allowed category", async function () {
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      await gruhaToken.connect(msme1).spendTokens(
        allocations[0],
        vendor1.address,
        spendAmount,
        STORAGE,
        bookingId,
        "QmProofHash123"
      );
      
      const allocation = await gruhaToken.allocations(allocations[0]);
      expect(allocation.remainingAmount).to.equal(amount - spendAmount);
      
      expect(await gruhaToken.totalSpent()).to.equal(spendAmount);
      expect(await gruhaToken.totalTransactions()).to.equal(1n);
    });

    it("Should update vendor earnings", async function () {
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      await gruhaToken.connect(msme1).spendTokens(
        allocations[0],
        vendor1.address,
        spendAmount,
        STORAGE,
        bookingId,
        "QmProofHash123"
      );
      
      const vendor = await gruhaToken.vendors(vendor1.address);
      expect(vendor.totalEarnings).to.equal(spendAmount);
    });

    it("Should emit TokensSpent and VendorSettlement events", async function () {
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      await expect(
        gruhaToken.connect(msme1).spendTokens(
          allocations[0],
          vendor1.address,
          spendAmount,
          STORAGE,
          bookingId,
          "QmProofHash"
        )
      )
        .to.emit(gruhaToken, "TokensSpent")
        .and.to.emit(gruhaToken, "VendorSettlement");
    });

    it("Should reject spending on disallowed category for Resilience Credits", async function () {
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      // REPAIRS is not allowed for RESILIENCE_CREDIT
      await expect(
        gruhaToken.connect(msme1).spendTokens(
          allocations[0],
          vendor1.address,
          spendAmount,
          REPAIRS,
          bookingId,
          "QmProof"
        )
      ).to.be.revertedWith("Category not allowed for this token type");
    });

    it("Should reject spending if vendor not authorized for category", async function () {
      // Register vendor for REPAIRS only
      await gruhaToken.connect(authority).registerVendor(
        vendor2.address,
        "Repair Shop",
        [REPAIRS]
      );
      
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      // Try to spend on STORAGE but vendor2 only does REPAIRS
      await expect(
        gruhaToken.connect(msme1).spendTokens(
          allocations[0],
          vendor2.address,
          spendAmount,
          STORAGE,
          bookingId,
          "QmProof"
        )
      ).to.be.revertedWith("Vendor not authorized for category");
    });

    it("Should reject spending more than balance", async function () {
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      const tooMuch = ethers.parseEther("15000");
      
      await expect(
        gruhaToken.connect(msme1).spendTokens(
          allocations[0],
          vendor1.address,
          tooMuch,
          STORAGE,
          bookingId,
          "QmProof"
        )
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should reject spending from another MSME's allocation", async function () {
      await gruhaToken.connect(authority).registerMSME(msme2.address, "MSME 2", "UDYAM-2");
      
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      await expect(
        gruhaToken.connect(msme2).spendTokens(
          allocations[0],
          vendor1.address,
          spendAmount,
          STORAGE,
          bookingId,
          "QmProof"
        )
      ).to.be.revertedWith("Not your allocation");
    });
  });

  describe("Relief Token Full Workflow", function () {
    const disasterId = ethers.id("FLOOD-2024-001");
    const amount = ethers.parseEther("50000");

    beforeEach(async function () {
      // Declare disaster
      await gruhaToken.connect(authority).declareDisaster(
        disasterId,
        "Kerala Floods 2024",
        "FLOOD"
      );
      
      // Register MSME
      await gruhaToken.connect(authority).registerMSME(msme1.address, "Flood Affected Shop", "UDYAM-KL-001");
      
      // Register multiple vendors
      await gruhaToken.connect(authority).registerVendor(vendor1.address, "Repair Service", [REPAIRS, MATERIALS]);
      await gruhaToken.connect(authority).registerVendor(vendor2.address, "Transport Co", [TRANSPORT, STORAGE]);
    });

    it("Should complete full recovery workflow with Relief Tokens", async function () {
      // Allocate Relief Tokens
      await gruhaToken.connect(authority).allocateTokens(
        msme1.address,
        RELIEF_TOKEN,
        amount,
        90, // 90 days for recovery
        disasterId
      );
      
      // Verify disaster allocation tracking
      let disaster = await gruhaToken.disasters(disasterId);
      expect(disaster.totalAllocated).to.equal(amount);
      
      // Spend on repairs
      const repairCost = ethers.parseEther("15000");
      const allocations = await gruhaToken.getMSMEAllocations(msme1.address);
      
      await gruhaToken.connect(msme1).spendTokens(
        allocations[0],
        vendor1.address,
        repairCost,
        REPAIRS,
        ethers.id("REPAIR-BOOKING-001"),
        "QmRepairProof"
      );
      
      // Spend on materials
      const materialsCost = ethers.parseEther("10000");
      await gruhaToken.connect(msme1).spendTokens(
        allocations[0],
        vendor1.address,
        materialsCost,
        MATERIALS,
        ethers.id("MATERIALS-BOOKING-001"),
        "QmMaterialsProof"
      );
      
      // Spend on transport
      const transportCost = ethers.parseEther("5000");
      await gruhaToken.connect(msme1).spendTokens(
        allocations[0],
        vendor2.address,
        transportCost,
        TRANSPORT,
        ethers.id("TRANSPORT-BOOKING-001"),
        "QmTransportProof"
      );
      
      // Verify final state
      disaster = await gruhaToken.disasters(disasterId);
      expect(disaster.totalSpent).to.equal(repairCost + materialsCost + transportCost);
      
      const remainingBalance = await gruhaToken.getMSMEBalance(msme1.address);
      expect(remainingBalance).to.equal(amount - repairCost - materialsCost - transportCost);
      
      const stats = await gruhaToken.getStats();
      expect(stats[4]).to.equal(3n); // 3 transactions
    });
  });

  describe("Admin Functions", function () {
    it("Should update vendor compliance score", async function () {
      await gruhaToken.connect(authority).registerVendor(vendor1.address, "Vendor", [STORAGE]);
      
      await gruhaToken.connect(authority).updateVendorCompliance(vendor1.address, 85);
      
      const vendor = await gruhaToken.vendors(vendor1.address);
      expect(vendor.complianceScore).to.equal(85n);
    });

    it("Should suspend vendor", async function () {
      await gruhaToken.connect(authority).registerVendor(vendor1.address, "Vendor", [STORAGE]);
      
      await gruhaToken.connect(authority).suspendVendor(vendor1.address);
      
      const vendor = await gruhaToken.vendors(vendor1.address);
      expect(vendor.isActive).to.be.false;
      
      const VENDOR_ROLE = await gruhaToken.VENDOR_ROLE();
      expect(await gruhaToken.hasRole(VENDOR_ROLE, vendor1.address)).to.be.false;
    });
  });
});
