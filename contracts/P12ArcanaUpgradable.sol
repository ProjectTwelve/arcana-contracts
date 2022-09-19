//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;

import 'hardhat/console.sol';
// import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
// import '@openzeppelin/contracts/metatx/ERC2771Context.sol';
// import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol';
// import '@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';

contract P12ArcanaUpgradable is ERC2771ContextUpgradeable, OwnableUpgradeable, UUPSUpgradeable, ERC721Upgradeable {
  uint256 idx;

  // signer
  mapping(address => bool) signers;

  // voting powers
  mapping(uint256 => uint256) powers;

  // tokenId => ipfs uri
  mapping(uint256 => string) public answersUri;

  constructor(address forwarder_) ERC2771ContextUpgradeable(forwarder_) {}

  function initialize(string memory name_, string memory symbol_) public initializer {
    __ERC721_init_unchained(name_, symbol_);
  }

  function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {}

  function _msgSender() internal view virtual override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address sender) {
    return ERC2771ContextUpgradeable._msgSender();
  }

  function _msgData() internal view virtual override(ERC2771ContextUpgradeable, ContextUpgradeable) returns (bytes calldata) {
    return ERC2771ContextUpgradeable._msgData();
  }

  //
  function getBattlePass() external {
    require(balanceOf(_msgSender()) == 0, 'P12Arcana: already have pass');

    _safeMint(_msgSender(), idx);
    idx += 1;
  }

  function updateAnswerUri(uint256 tokenId, string calldata uri) external {
    require(ownerOf(tokenId) == _msgSender(), 'P12Arcana: not token owner');

    answersUri[tokenId] = uri;
  }

  modifier onlySigner() {
    require(signers[_msgSender()] == true, 'P12Arcana: not signer');
    _;
  }
}
