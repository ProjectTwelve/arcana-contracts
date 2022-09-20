//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;
import './RenderConsts.sol';
import './interface/IP12ArcanaUpgradable.sol';
import './interface/IRenderEngine.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import 'hardhat/console.sol';

contract RenderEngine is IRenderEngine {
  // EIP 4883
  function renderTokenById(uint256 tokenId) public view override returns (string memory) {
    uint256 power = IP12ArcanaUpgradable(msg.sender).getVotingPower(tokenId);
    console.log(power);
    if (power < 15) {
      return _renderSilver(power);
    } else {
      return _renderGold(power);
    }
  }

  //
  function _renderSilver(uint256 power) private pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          RenderConsts.SLIVER_PREFIX,
          Strings.toString(power),
          RenderConsts.SLIVER_SUFFIX,
          RenderConsts.FONTS,
          '</defs></svg>'
        )
      );
  }

  //
  function _renderGold(uint256 power) private pure returns (string memory) {
    if (power > 999) {
      power = 999;
    }
    return
      string(
        abi.encodePacked(
          RenderConsts.GOLD_PREFIX,
          Strings.toString(power),
          RenderConsts.GOLD_SUFFIX,
          RenderConsts.FONTS,
          '</defs></svg>'
        )
      );
  }
}
