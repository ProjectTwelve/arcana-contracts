// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.17;

contract TokenSender {
  function sendNativeToken(address[] calldata addresses, uint256 perValue) external payable {
    for (uint256 i = 0; i < addresses.length; i++) {
      payable(addresses[i]).transfer(perValue);
    }
  }
}
