// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VendorEntity is ERC1155, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");

    enum TokenType { COUPON, VOUCHER }

    struct TokenMetadata {
        string vendor;
        uint256 value; // either a discount % or a fixed value
        TokenType tokenType;
        uint256 remainingUses; // Only for coupons
        uint256 expiryDate;
        string[] redeemableItems; // Only for vouchers
        string encryptedData;
    }

    // Mapping to store token metadata
    mapping(uint256 => TokenMetadata) private _tokenMetadata;
    
    // Mapping to store a list of gift cards for each user
    mapping(address => uint256[]) private _userGiftCards;

    // Mapping to check if a user owns a specific token
    mapping(address => mapping(uint256 => bool)) private _ownedGiftCards;

    event GiftCardMinted(address indexed user, uint256 tokenId, uint256 value);
    event TokenMinted(address indexed vendor, uint256 tokenId, uint256 amount);
    event TokenRedeemed(address indexed user, uint256 tokenId, uint256 remainingUses);
    event TokenSentToWallet(address indexed from, address indexed to, uint256 tokenId, string entityType);

    constructor(string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender); // Admin can manage roles
    }

    function mintVoucherOrCoupon(
        address to,
        uint256 tokenId,
        string memory vendor,
        uint256 value,
        uint256 expiryDate,
        TokenType tokenType,
        uint256 remainingUses,
        string[] memory redeemableItems,
        string memory encryptedData,
        uint256 amount // Number of copies to mint
    ) public onlyRole(VENDOR_ROLE) {
        require(expiryDate > block.timestamp, "Expiry date should be in the future");
        if (tokenType == TokenType.COUPON) {
            require(value <= 100, "Coupon discount should be <= 100%");
            require(remainingUses > 0, "Coupon must have at least 1 use");
        }

        if (tokenType == TokenType.VOUCHER) {
            require(redeemableItems.length > 0, "Voucher must have redeemable items");
        }

        _mint(to, tokenId, amount, ""); // Mint multiple copies
        _tokenMetadata[tokenId] = TokenMetadata({
            vendor: vendor,
            value: value,
            expiryDate: expiryDate,
            tokenType: tokenType,
            remainingUses: remainingUses,
            redeemableItems: redeemableItems,
            encryptedData: encryptedData
        });

        if (!_ownedGiftCards[to][tokenId]) {
            _userGiftCards[to].push(tokenId);
            _ownedGiftCards[to][tokenId] = true;
        }

        emit TokenMinted(msg.sender, tokenId, amount);
    }

    // Get Token Details
    function getTokenMetadata(uint256 tokenId)
        public
        view
        returns (
            string memory vendor,
            uint256 value,
            uint256 expiryDate,
            TokenType tokenType,
            uint256 remainingUses,
            string[] memory redeemableItems,
            string memory encryptedData
        )
    {
        require(bytes(_tokenMetadata[tokenId].vendor).length > 0, "Token does not exist");
        TokenMetadata memory metadata = _tokenMetadata[tokenId];
        return (
            metadata.vendor,
            metadata.value,
            metadata.expiryDate,
            metadata.tokenType,
            metadata.remainingUses,
            metadata.redeemableItems,
            metadata.encryptedData
        );
    }

    // Redeem Coupons and Vouchers
    function redeem(uint256 tokenId) public {
        require(balanceOf(msg.sender, tokenId) > 0, "You do not own this token");
        TokenMetadata storage metadata = _tokenMetadata[tokenId];

        require(metadata.expiryDate > block.timestamp, "Token has expired");

        if (metadata.tokenType == TokenType.COUPON) {
            require(metadata.remainingUses > 0, "Coupon has been fully used");
            metadata.remainingUses -= 1;

            if (metadata.remainingUses == 0) {
                _burn(msg.sender, tokenId, 1);
            }
        } else if (metadata.tokenType == TokenType.VOUCHER) {
            _burn(msg.sender, tokenId, 1);
        } else {
            revert("Only coupons and vouchers can be redeemed");
        }

        emit TokenRedeemed(msg.sender, tokenId, metadata.remainingUses);
    }

    // Generate Metadata URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(bytes(_tokenMetadata[tokenId].vendor).length > 0, "Token does not exist");
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    function getUserGiftCards(address user) public view returns (uint256[] memory) {
        return _userGiftCards[user];
    }

    function sendTokenToWallet(
        address to,
        uint256 tokenId,
        string memory entityType
    ) public {
        require(bytes(_tokenMetadata[tokenId].vendor).length > 0, "Token does not exist");
        
        // Ensure the entity type is valid
        require(
            keccak256(abi.encodePacked(entityType)) == keccak256("voucher") ||
            keccak256(abi.encodePacked(entityType)) == keccak256("coupon"),
            "Invalid entity type"
        );

        // Ensure the sender owns the token before transferring
        require(balanceOf(msg.sender, tokenId) > 0, "Sender does not own the token");

        // Execute the transfer
        _safeTransferFrom(msg.sender, to, tokenId, 1, "");

        emit TokenSentToWallet(msg.sender, to, tokenId, entityType);
    }

    // Assign Vendor Role
    function addVendor(address vendor) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VENDOR_ROLE, vendor);
    }

    // Check Role Support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
