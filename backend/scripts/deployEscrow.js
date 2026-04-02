const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Deploy AgriEscrow
  const Escrow = await hre.ethers.getContractFactory("AgriEscrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  console.log("AgriEscrow deployed to:", contractAddress);

  // Define standard paths and create blockchain directory if it does not exist
  const destDir = path.join(__dirname, "..", "blockchain");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Get the artifact (ABI) from the compiled outputs
  const artifact = require("../artifacts/contracts/AgriEscrow.sol/AgriEscrow.json");

  // Save the address and ABI to contract.json
  const contractData = {
    address: contractAddress,
    abi: artifact.abi
  };

  fs.writeFileSync(
    path.join(destDir, "contract.json"),
    JSON.stringify(contractData, null, 2)
  );
  console.log("Saved ABI and address to blockchain/contract.json");

  // Wait a few blocks so Polygonscan has time to index the contract before verification
  console.log("Waiting for 5 block confirmations before verifying...");
  const deploymentReceipt = await escrow.deploymentTransaction().wait(5);
  
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfuly!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
