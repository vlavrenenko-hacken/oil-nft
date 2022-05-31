// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title A contract for Aishi NFT
/// @author Lavrenenko V.V.
/// @notice You can use this contract to mint, lock and transfer NFT tokens named AishiToken
/// @dev All function calls are currently implemented without side effects
contract AishiToken is ERC721PresetMinterPauserAutoId {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint => uint) public tokenLockedFromTimestamp;
    mapping (uint => bytes32) public tokenUnlockCodeHashes;
    mapping (uint => bool) public tokenUnlocked;

    /// @dev Emitted when an NFT token is unlocked
    event TokenUnlocked(uint tokenId, address unlockerAddress);

    /// @dev Calls ERC721PresetMinterPauserAutoId and sets the values for {_name}, {_symbol} and {_baseTokenURI}
    constructor() ERC721PresetMinterPauserAutoId("AishiToken", "AIS", "https://aisthisi.art/metadata/") {}

    /// @notice One of the contract hooks, which is called before token transfers
    /// @dev The Lavrenenko V.V. Adds a check for locking mechanism and overrides the base _beforeTokenTransfer from ERC721 a
    /// @param from The sender's address
    /// @param to The recipient's address
    /// @param tokenId The Id of the token to be transfered
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        require(tokenLockedFromTimestamp[tokenId] > block.timestamp || tokenUnlocked[tokenId], "AishtisiToken: Token locked");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /// @notice Unlocks the token
    /// @dev The Lavrenenko V.V. Add checks for ownership of the token and for the hash to unlock the token,
    /// emits TokenUnlocked event
    /// @param unlockHash The hash used to unlock the token
    /// @param tokenId The id of the token to be unlocked
    function unlockToken(bytes32 unlockHash, uint256 tokenId) public {
        require(msg.sender == ownerOf(tokenId), "AishtisiToken: Only the Owner can unlock the Token"); //not 100% sure about that one yet
        require(unlockHash == tokenUnlockCodeHashes[tokenId], "AishtisiToken: Unlock Code Incorrect");
        tokenUnlocked[tokenId] = true;
        emit TokenUnlocked(tokenId, msg.sender);
    }

    /// @notice Mints new tokens
    /// @dev The Lavrenenko V.V. Sets the lockedFromTimeStamp and the unlock hash. then calls the parent mint
    /// @param to The recipient's address
    /// @param lockedFromTimestamp The initial locking time
    /// @param unlockHash The hash to unlock the token
    function mintToken(address to, uint lockedFromTimestamp, bytes32 unlockHash) public {
        tokenLockedFromTimestamp[_tokenIds.current()] = lockedFromTimestamp;
        tokenUnlockCodeHashes[_tokenIds.current()] = unlockHash;
        _tokenIds.increment();
        super.mint(to);
    }

    /// @notice Generates the tokenURI
    /// @dev The Lavrenenko V.V. Turns the tokenId into the tokenURI
    /// @param tokenId The id of the token
    /// @return The generated URI of the token
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked(super.tokenURI(tokenId),".json"));
    }
}

