import { expect } from 'chai';
import hre, { deployments, ethers } from 'hardhat';
import { CollabUpgradable } from '../typechain';
import { getContract } from './utils';

const protectedId = 'ABCDEFG';
const randomId = ethers.utils.randomBytes(32).toString();

// cspell:disable-next-line
const content = 'ipfs://Qmxxxxxxxxxxxxxxxxxxxxx';

const setUpTest = deployments.createFixture(async ({ deployments, getNamedAccounts, ethers }, options) => {
  const [signer] = await ethers.getSigners();
  const chainId = await hre.getChainId();
  const collab = await getContract<CollabUpgradable>('CollabUpgradable');
  await deployments.fixture();

  // EIP712 related constants
  const domain = { name: 'P12 Collab', version: 'v0.0.1', chainId: chainId, verifyingContract: collab.address };
  const type = {
    CanJoin: [
      { name: 'user', type: 'address' },
      { name: 'id', type: 'string' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  // set protected activities
  await expect(collab.setProtectedActivity(protectedId))
    .to.be.emit(collab, 'EvProtectedActivitySet')
    .withArgs(protectedId, true);
  // set signers
  await expect(collab.setSigner(signer.address, true)).to.be.emit(collab, 'EvSignerSet').withArgs(signer.address, true);

  return {
    collab: collab,
    domain: domain,
    type: type,
    signer: signer,
  };
});

describe('Collab', function () {
  it('Should save stamp successfully', async () => {
    const { collab } = await setUpTest();
    const [user] = await ethers.getSigners();
    const id = ethers.utils.randomBytes(32).toString();

    await expect(collab['saveStamp(string,string)'](id, content))
      .to.be.emit(collab, 'EvStampUpdate')
      .withArgs(user.address, id, content);
  });

  it('Should isProtected work properly', async () => {
    const { collab } = await setUpTest();

    expect(await collab.isProtected(protectedId)).to.be.equal(true);
    expect(await collab.isProtected(randomId)).to.be.equal(false);
  });

  it('Should save stamp in protected activities without signature fail', async () => {
    const { collab } = await setUpTest();

    await expect(collab['saveStamp(string,string)'](protectedId, content)).to.be.revertedWith('ProtectedActivity');
  });

  it('Should save stamp in protected activities with signature success', async () => {
    const { collab, domain, type, signer } = await setUpTest();

    const [user] = await ethers.getSigners();

    const deadline = Math.floor(new Date().getTime() / 1000 + 3600);

    const signature = await signer._signTypedData(domain, type, {
      user: user.address,
      id: protectedId,
      deadline: deadline,
    });

    await expect(collab.connect(user)['saveStamp(string,string,uint256,bytes)'](protectedId, content, deadline, signature))
      .to.be.emit(collab, 'EvStampUpdate')
      .withArgs(user.address, protectedId, content);
  });

  it('Should save stamp in unprotected activities with signature fail', async () => {
    const { collab, domain, type, signer } = await setUpTest();

    const [user] = await ethers.getSigners();

    const deadline = Math.floor(new Date().getTime() / 1000 + 3600);

    const id = ethers.utils.randomBytes(32).toString();

    const signature = await signer._signTypedData(domain, type, {
      user: user.address,
      id: id,
      deadline: deadline,
    });

    await expect(
      collab.connect(user)['saveStamp(string,string,uint256,bytes)'](id, content, deadline, signature),
    ).to.be.revertedWith('NotProtectedActivity');
  });
});
