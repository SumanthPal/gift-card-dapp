const hre = require("hardhat");
const {ethers} = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the GiftCard contract
  const GiftCard = await hre.ethers.getContractFactory("GiftCard");
  console.log("Deploying gift card contract...")
  const giftCard = await GiftCard.deploy("file:///path_to_your_local_metadata/{tokenId}.json");
  await giftCard.waitForDeployment();
  

  const giftCardAddress = await giftCard.getAddress();
        console.log("Token deployed to:", giftCardAddress);
  
  // Define the gift card details
  const userAddress = deployer.address; // This could be your address or anyone else's
  const tokenId = 1; // Unique token ID for the gift card
  const vendor = "MyVendor";
  const expiryDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days from now
  const encryptedData = "encrypted_data_here";

  // Mint the gift card
  const tx = await giftCard.mintGiftCard(userAddress, tokenId, vendor, expiryDate, encryptedData);
  console.log("Minting gift card... Transaction Hash:", tx.hash);


  const VendorEntity = await hre.ethers.getContractFactory("VendorEntity");
  console.log("Deploying VenderEntity contract...")
  const vendorEntity = await VendorEntity.deploy();
  await vendorEntity.waitForDeployment();

  const vendorEntityAddress = await vendorEntity.getAddress();
  console.log("VendorEntity deployed to:", vendorEntityAddress);


  // Wait for the transaction to be mined
  await tx.wait();
  console.log("Gift card minted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });