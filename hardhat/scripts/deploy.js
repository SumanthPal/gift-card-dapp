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

  //deploying vendor entity contract
  const VendorEntity = await hre.ethers.getContractFactory("VendorEntity");
  console.log("Deploying VenderEntity contract...")
  const vendorEntity = await VendorEntity.deploy("file:///path_to_your_local_metadata/{tokenId}.json");
  await vendorEntity.waitForDeployment();

  console.log("Granting VENDOR_ROLE to deployer...");
  const grantRoleTx = await vendorEntity.addVendor(deployer.address);
  await grantRoleTx.wait();
  console.log("VENDOR_ROLE granted to deployer!");
  //deploying vendor onboarding contract
  const VendorOnboarding = await hre.ethers.getContractFactory("Onboarding");
  console.log("Deploying VendorOnboarding contract...")
  const vendorOnboarding = await VendorOnboarding.deploy();
  await vendorOnboarding.waitForDeployment();

  const vendorOnboardingAddress = await vendorOnboarding.getAddress();
  console.log("VendorOnboarding deployed to:", vendorOnboardingAddress);

  const vendorEntityAddress = await vendorEntity.getAddress();
  console.log("VendorEntity deployed to:", vendorEntityAddress);


  // Wait for the transaction to be mined
  await tx.wait();
  console.log("Gift card minted successfully!");

  const couponTokenId = 2; // Unique token ID for the coupon
  const voucherTokenId = 3; // Unique token ID for the voucher
  const value = 100; // Example value (e.g., discount percentage or voucher value)
  const remainingUses = 5; // Number of times the token can be used
  const redeemableItems = ["Item1", "Item2"]; // Redeemable items for the voucher
  const amount = 1; // Number of tokens to mint

  // Mint a coupon
  console.log("Minting a coupon...");
  const mintCouponTx = await vendorEntity.mintVoucherOrCoupon(
    deployer.address, // to
    couponTokenId, // tokenId
    vendor, // vendor
    value, // value
    expiryDate, // expiryDate
    0, // tokenType (0 for COUPON)
    remainingUses, // remainingUses
    [], // redeemableItems (empty for coupons)
    encryptedData, // encryptedData
    amount // amount
  );
  await mintCouponTx.wait();
  console.log("Coupon minted successfully!");

  // Mint a voucher
  console.log("Minting a voucher...");
  const mintVoucherTx = await vendorEntity.mintVoucherOrCoupon(
    deployer.address, // to
    voucherTokenId, // tokenId
    vendor, // vendor
    value, // value
    expiryDate, // expiryDate
    1, // tokenType (1 for VOUCHER)
    remainingUses, // remainingUses
    redeemableItems, // redeemableItems
    encryptedData, // encryptedData
    amount // amount
  );
  await mintVoucherTx.wait();
  console.log("Voucher minted successfully!");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });