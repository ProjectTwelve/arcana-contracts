// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/utils/structs/BitMaps.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@p12/contracts-lib/contracts/access/SafeOwnable.sol';

import './interface/IRewardDistributor.sol';

contract RewardDistributor is IRewardDistributor, SafeOwnable {
  using BitMaps for BitMaps.BitMap;
  using SafeERC20 for IERC20;

  bytes32 private _merkleRoot;
  IERC20 public rewardToken;
  uint256 public claimPeriodEnds;
  BitMaps.BitMap private claimed;

  constructor(IERC20 rewardToken_) {
    rewardToken = rewardToken_;
  }

  /**
   * @dev Claims airdropped tokens.
   * @param amount The amount of the claim being made.
   * @param merkleProof A merkle proof proving the claim is valid.
   */
  function claimTokens(uint256 amount, bytes32[] calldata merkleProof) external {
    require(block.timestamp < claimPeriodEnds, 'P12Arcana: Not in claim period.');
    require(amount <= rewardToken.balanceOf(address(this)), 'P12Arcana: Amount exceeds balance');
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
    bool valid = MerkleProof.verify(merkleProof, _merkleRoot, leaf);
    require(valid, 'P12Arcana: invalid proof');
    require(!isClaimed(uint160(_msgSender())), 'P12Arcana: Tokens already claimed');

    claimed.set(uint160(_msgSender()));
    rewardToken.transfer(msg.sender, amount);
    emit Claim(msg.sender, amount);
  }

  /**
   * @dev Returns true if the claim at the given index in the merkle tree has already been made.
   * @param index The index into the merkle tree.
   */
  function isClaimed(uint256 index) public view returns (bool) {
    return claimed.get(index);
  }

  /**
   * @dev Sets the merkle root.
   * @param newMerkleRoot The merkle root to set.
   */
  function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
    _merkleRoot = newMerkleRoot;
    emit MerkleRootChanged(_merkleRoot);
  }

  /**
   * @dev Sets the claim period ends.
   * @param claimPeriodEnds_ The merkle root to set.
   */
  function setClaimPeriodEnds(uint256 claimPeriodEnds_) external onlyOwner {
    claimPeriodEnds = claimPeriodEnds_;
    emit ClaimPeriodEndsChanged(claimPeriodEnds);
  }

  /**
   * @dev withdraw remaining tokens.
   * @param dest The destination address.
   */
  function withdraw(address dest) external onlyOwner {
    require(dest != address(0), 'P12Arcana: can not withdraw to 0');
    rewardToken.transfer(dest, rewardToken.balanceOf(address(this)));
  }

  /**
   * @dev deposit token via this function, in case of send wrong token
   * @param amount amount to deposit
   */
  function deposit(uint256 amount) external {
    rewardToken.safeTransferFrom(msg.sender, address(this), amount);
  }
}
