const hre = require("hardhat");

async function main() {
  const EngageLayerProtocol = await hre.ethers.getContractFactory("EngageLayerProtocol");

  const registry = await EngageLayerProtocol.deploy();


  await registry.waitForDeployment();

  console.log("EngageLayerProtocol deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/// contract address = 0xE83Fcc64C9f10F6875b517b3E1e2dFd69eDD79B8