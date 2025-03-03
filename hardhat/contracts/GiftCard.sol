// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GiftCard is ERC1155, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");


    struct TokenMetadata {
        string vendor;
        uint256 expiryDate;
        string encryptedData;
    }

    mapping(uint256 => TokenMetadata) private _tokenMetadata;
    mapping(address => uint256[]) private _userGiftCards;
    mapping(address => mapping(uint256 => bool)) private _ownedGiftCards;

    event GiftCardMinted(address indexed user, uint256 tokenId);
    event GiftCardSent(address indexed from, address indexed to, uint256 tokenId);

    constructor(string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender); // Admin can manage roles
    }

    function sendGiftCard(address to, uint256 tokenId) public {
        require(_ownedGiftCards[msg.sender][tokenId], "You do not own this gift card");

        // Transfer the token
        _safeTransferFrom(msg.sender, to, tokenId, 1, "");

        // Update ownership records
        _ownedGiftCards[msg.sender][tokenId] = false;
        if (!_ownedGiftCards[to][tokenId]) {
            _userGiftCards[to].push(tokenId);
            _ownedGiftCards[to][tokenId] = true;
        }

        emit GiftCardSent(msg.sender, to, tokenId);
    }
    

    function mintGiftCard(
        address user,
        uint256 tokenId,
        string memory vendor,
        uint256 expiryDate,
        string memory encryptedData
    ) public onlyRole(MINTER_ROLE) {
        require(expiryDate > block.timestamp, "Expiry date should be in the future");

        _mint(user, tokenId, 1, "");

        _tokenMetadata[tokenId] = TokenMetadata({
            vendor: vendor,
            expiryDate: expiryDate,
            encryptedData: encryptedData
        });

        if (!_ownedGiftCards[user][tokenId]) {
            _userGiftCards[user].push(tokenId);
            _ownedGiftCards[user][tokenId] = true;
        }

        emit GiftCardMinted(user, tokenId);
    }

    // 🔹 Get Token Details
    function getTokenMetadata(uint256 tokenId)
        public
        view
        returns (
            string memory vendor,
            uint256 expiryDate,
            string memory encryptedData
        )
    {
        require(bytes(_tokenMetadata[tokenId].vendor).length > 0, "Token does not exist");
        TokenMetadata memory metadata = _tokenMetadata[tokenId];
        return (
            metadata.vendor,
            metadata.expiryDate,
            metadata.encryptedData
        );
    }

    

    // Generate Metadata URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(bytes(_tokenMetadata[tokenId].vendor).length > 0, "Token does not exist");
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    function getUserGiftCards(address user) public view returns (uint256[] memory) {
        return _userGiftCards[user];
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
