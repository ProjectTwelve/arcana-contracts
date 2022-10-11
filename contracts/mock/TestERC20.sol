// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestERC20 is ERC20 {
  constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

  function mint(uint256 amount) external {
    _mint(msg.sender, amount);
  }
}
