//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/metatx/ERC2771Context.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract P12Arcana is ERC2771Context, Ownable, ERC721 {
  uint256 idx;

  // tokenId => problem Id => answer
  mapping(uint256 => mapping(uint256 => string)) public answers;

  constructor(
    string memory name_,
    string memory symbol_,
    address forwarder_
  ) ERC2771Context(forwarder_) ERC721(name_, symbol_) {}

  function _msgSender() internal view virtual override(ERC2771Context, Context) returns (address sender) {
    return ERC2771Context._msgSender();
  }

  function _msgData() internal view virtual override(ERC2771Context, Context) returns (bytes calldata) {
    return ERC2771Context._msgData();
  }

  //
  function getBattlePass() external {
    require(balanceOf(_msgSender()) == 0, 'P12Arcana: already have pass');

    _safeMint(_msgSender(), idx);
    idx += 1;
  }

  //
  function updateAnswer(
    uint256 tokenId,
    uint256[] calldata problemId,
    string[] calldata replies
  ) external {
    require(ownerOf(tokenId) == _msgSender(), 'P12Arcana: not token owner');
    require(problemId.length == replies.length, 'P12Arcana: invalid args');

    for (uint256 i = 0; i < problemId.length; i++) {
      require(bytes(replies[0]).length <= 32, 'P12Arcana: reply to long');
      answers[tokenId][problemId[i]] = replies[i];
    }
  }
}
