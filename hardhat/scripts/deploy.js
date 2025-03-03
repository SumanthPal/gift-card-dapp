// deployment/1_deploy_giftcard.js

const hre = require("hardhat");

async function main() {
  // Deploy the GiftCard contract
  const GiftCard = await hre.ethers.getContractFactory("GiftCard");
  const giftCard = await GiftCard.deploy("https://myapi.com/api/metadata/");

  console.log("GiftCard contract deployed to:", giftCard.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
