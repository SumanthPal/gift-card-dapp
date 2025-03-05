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
        uint256 value;
        TokenType tokenType;
        uint256 expiryDate;
        uint256 remainingUses; // Added this field
        string[] redeemableItems;
        string encryptedData;
    }

    mapping(uint256 => TokenMetadata) private _tokenMetadata;
    mapping(address => uint256[]) private _userGiftCards;
    mapping(address => mapping(uint256 => bool)) private _ownedGiftCards;

    event GiftCardMinted(address indexed user, uint256 tokenId, uint256 value);
    event TokenMinted(address indexed vendor, uint256 tokenId, uint256 amount);
    event TokenRedeemed(address indexed user, uint256 tokenId, uint256 remainingUses);
    event TokenSentToWallet(address indexed from, address indexed to, uint256 tokenId, TokenType tokenType);

    constructor(string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
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
        uint256 amount
    ) public onlyRole(VENDOR_ROLE) {
        require(expiryDate > block.timestamp, "Expiry date should be in the future");

        if (tokenType == TokenType.COUPON) {
            require(value <= 100, "Coupon discount should be <= 100%");
            require(remainingUses > 0, "Coupon must have at least 1 use");
        }

        if (tokenType == TokenType.VOUCHER) {
            require(redeemableItems.length > 0, "Voucher must have redeemable items");
        }

        require(_tokenMetadata[tokenId].expiryDate == 0, "Token ID already exists");

        _mint(to, tokenId, amount, "");

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
        require(_tokenMetadata[tokenId].expiryDate != 0, "Token does not exist");
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
            revert("Invalid token type");
        }

        emit TokenRedeemed(msg.sender, tokenId, metadata.remainingUses);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(_tokenMetadata[tokenId].expiryDate != 0, "Token does not exist");
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    function getUserGiftCards(address user) public view returns (uint256[] memory) {
        return _userGiftCards[user];
    }

    function sendTokenToWallet(address to, uint256 tokenId) public {
        require(_tokenMetadata[tokenId].expiryDate != 0, "Token does not exist");
        require(balanceOf(msg.sender, tokenId) > 0, "Sender does not own the token");

        _safeTransferFrom(msg.sender, to, tokenId, 1, "");

        emit TokenSentToWallet(msg.sender, to, tokenId, _tokenMetadata[tokenId].tokenType);
    }

    function addVendor(address vendor) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VENDOR_ROLE, vendor);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
