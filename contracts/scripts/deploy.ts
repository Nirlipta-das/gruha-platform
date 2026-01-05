import { ethers, run, network } from "hardhat";

async function main() {
  console.log("🚀 GRUHA Token Deployment Script");
  console.log("================================");
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log("");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} MATIC`);
  console.log("");

  // Deploy GRUHAToken
  console.log("📦 Deploying GRUHAToken...");
  const GRUHAToken = await ethers.getContractFactory("GRUHAToken");
  const gruhaToken = await GRUHAToken.deploy();
  
  await gruhaToken.waitForDeployment();
  const contractAddress = await gruhaToken.getAddress();
  
  console.log(`✅ GRUHAToken deployed to: ${contractAddress}`);
  console.log("");

  // Get deployment transaction
  const deploymentTx = gruhaToken.deploymentTransaction();
  if (deploymentTx) {
    console.log(`Transaction Hash: ${deploymentTx.hash}`);
    console.log(`Gas Used: ${deploymentTx.gasLimit.toString()}`);
  }
  console.log("");

  // Verify initial state
  console.log("📊 Verifying Initial State...");
  const stats = await gruhaToken.getStats();
  console.log(`  Total Minted: ${stats[0]}`);
  console.log(`  Total Spent: ${stats[1]}`);
  console.log(`  Total MSMEs: ${stats[2]}`);
  console.log(`  Total Vendors: ${stats[3]}`);
  console.log(`  Total Transactions: ${stats[4]}`);
  console.log("");

  // Verify roles
  const DEFAULT_ADMIN_ROLE = await gruhaToken.DEFAULT_ADMIN_ROLE();
  const AUTHORITY_ROLE = await gruhaToken.AUTHORITY_ROLE();
  
  const hasAdminRole = await gruhaToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasAuthorityRole = await gruhaToken.hasRole(AUTHORITY_ROLE, deployer.address);
  
  console.log(`🔐 Deployer Roles:`);
  console.log(`  Admin Role: ${hasAdminRole}`);
  console.log(`  Authority Role: ${hasAuthorityRole}`);
  console.log("");

  // Verify category rules
  console.log("📋 Category Rules Verification:");
  
  // TokenType.RESILIENCE_CREDIT = 0
  // TokenType.RELIEF_TOKEN = 1
  // Category: STORAGE=0, TRANSPORT=1, REPAIRS=2, WAGES=3, MATERIALS=4, UTILITIES=5, EQUIPMENT=6
  
  const resilienceStorage = await gruhaToken.isCategoryAllowed(0, 0);
  const resilienceTransport = await gruhaToken.isCategoryAllowed(0, 1);
  const resilienceRepairs = await gruhaToken.isCategoryAllowed(0, 2);
  
  console.log("  Resilience Credits:");
  console.log(`    - Storage: ${resilienceStorage}`);
  console.log(`    - Transport: ${resilienceTransport}`);
  console.log(`    - Repairs: ${resilienceRepairs} (should be false)`);
  
  const reliefStorage = await gruhaToken.isCategoryAllowed(1, 0);
  const reliefRepairs = await gruhaToken.isCategoryAllowed(1, 2);
  const reliefWages = await gruhaToken.isCategoryAllowed(1, 3);
  
  console.log("  Relief Tokens:");
  console.log(`    - Storage: ${reliefStorage}`);
  console.log(`    - Repairs: ${reliefRepairs}`);
  console.log(`    - Wages: ${reliefWages}`);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: deploymentTx?.hash || "N/A"
  };

  console.log("📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");

  // Verify on block explorer (only for testnets)
  if (network.name === "mumbai" || network.name === "amoy") {
    console.log("⏳ Waiting for block confirmations before verification...");
    // Wait for 5 block confirmations
    if (deploymentTx) {
      await deploymentTx.wait(5);
    }
    
    try {
      console.log("🔍 Verifying contract on PolygonScan...");
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on PolygonScan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log(`⚠️ Verification failed: ${error.message}`);
        console.log("You can verify manually later.");
      }
    }
  }

  console.log("");
  console.log("🎉 Deployment Complete!");
  console.log("================================");
  console.log("");
  console.log("Next Steps:");
  console.log("1. Save the contract address: " + contractAddress);
  console.log("2. Update your .env file with CONTRACT_ADDRESS");
  console.log("3. Run integration tests");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
