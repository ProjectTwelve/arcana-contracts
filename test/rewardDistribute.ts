import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { keccak256, parseEther, solidityKeccak256 } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import MerkleTree from 'merkletreejs';
import { RewardDistributor, TestERC20 } from '../typechain';
import { getContract } from './utils';

describe('P12Arcana', function () {
  let rewardDistributor: RewardDistributor;
  let testERC20: TestERC20;
  let tree: MerkleTree;
  let admin: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    user3: SignerWithAddress,
    user4: SignerWithAddress;
  this.beforeAll(async () => {
    rewardDistributor = await getContract<RewardDistributor>('RewardDistributor');
    testERC20 = await getContract<TestERC20>('TestERC20');
    [admin, user1, user2, user3, user4] = await ethers.getSigners();
  });
  it('should deposit successfully', async () => {
    await testERC20.mint(parseEther('100'));
    await testERC20.approve(rewardDistributor.address, ethers.constants.MaxUint256);
    expect(await testERC20.balanceOf(admin.address)).to.be.equal(parseEther('100'));

    await rewardDistributor.deposit(parseEther('100'));
    expect(await testERC20.balanceOf(rewardDistributor.address)).to.be.equal(parseEther('100'));
  });
  it('should set claim ends successfully', async () => {
    await rewardDistributor.setClaimPeriodEnds(new Date().getTime() + 86400);
  });
  it('should set merkle tree root successfully', async () => {
    const leaves = [
      { address: user1.address, amount: parseEther('9') },
      { address: user2.address, amount: parseEther('10') },
      { address: user3.address, amount: parseEther('11') },
      { address: user4.address, amount: parseEther('12') },
    ].map((v) => {
      return solidityKeccak256(['address', 'uint256'], [v.address, v.amount]);
    });

    tree = new MerkleTree(leaves, keccak256, { sort: true });

    await rewardDistributor.setMerkleRoot('0x' + tree.getRoot().toString('hex'));
  });
  it('should claim reward successfully', async () => {
    const leaf = solidityKeccak256(['address', 'uint256'], [user1.address, parseEther('9')]);
    await rewardDistributor.connect(user1).claimTokens(
      parseEther('9'),
      tree.getProof(leaf).map((v) => {
        return '0x' + v.data.toString('hex');
      }),
    );
  });
});
