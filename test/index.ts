import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { Forwarder, P12ArcanaUpgradable, RenderEngine } from '../typechain';
import { signMetaTxRequest } from './signer';
import { getContract } from './utils';

describe('P12Arcana', function () {
  let forwarder: Forwarder;
  let p12Arcana: P12ArcanaUpgradable;
  let renderEngine: RenderEngine;

  let owner: SignerWithAddress;
  let signer: SignerWithAddress;
  let relayer: SignerWithAddress;
  let user: SignerWithAddress;
  this.beforeAll(async () => {
    forwarder = await getContract<Forwarder>('Forwarder');
    p12Arcana = await getContract<P12ArcanaUpgradable>('P12ArcanaUpgradable');
    renderEngine = await getContract<RenderEngine>('RenderEngine');
    [owner, signer, relayer, user] = await ethers.getSigners();
  });
  it('Should set signer successfully', async () => {
    expect(await p12Arcana.signers(signer.address)).to.be.equal(false);
    await p12Arcana.connect(owner).setSigner(signer.address, true);
    expect(await p12Arcana.signers(signer.address)).to.be.equal(true);
  });

  it('Should set renderEngine successfully', async () => {
    expect(await p12Arcana.renderEngine()).to.be.equal(ethers.constants.AddressZero);
    await p12Arcana.connect(owner).setRenderEngin(renderEngine.address);
    expect(await p12Arcana.renderEngine()).to.be.equal(renderEngine.address);
  });

  it('Should user self work successfully', async function () {
    await p12Arcana.connect(user)['getBattlePass()']();

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);

    await p12Arcana
      .connect(user)
      // cspell:disable-next-line
      .updateAnswerUri(1, 'ipfs://bafyreibenzyulwwmj7gmcbd4tbqanehuumwi3vpfjttspp7gs5kylouasy');
  });
  it('Should relayer work properly', async function () {
    const tx = await p12Arcana.connect(user).populateTransaction['getBattlePass()']();

    const req = await signMetaTxRequest(user, forwarder, tx);

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);

    await forwarder.connect(relayer).execute(req.request, req.signature);

    expect(await p12Arcana.balanceOf(relayer.address)).to.be.equal(0);
    expect(await p12Arcana.balanceOf(forwarder.address)).to.be.equal(0);

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);

    const answerTx = await p12Arcana.connect(user).populateTransaction.updateAnswerUri(
      1,
      // cspell:disable-next-line
      'ipfs://bafyreibenzyulwwmj7gmcbd4tbqanehuumwi3vpfjttspp7gs5kylouasy',
    );

    const answerReq = await signMetaTxRequest(user, forwarder, answerTx);

    await forwarder.connect(relayer).execute(answerReq.request, answerReq.signature);

    // cspell:disable-next-line
    expect(await p12Arcana.answersUri(1)).to.be.equal('ipfs://bafyreibenzyulwwmj7gmcbd4tbqanehuumwi3vpfjttspp7gs5kylouasy');
  });

  it('Should update power successfully', async () => {
    const chainId = await hre.getChainId();
    const domain = { name: await p12Arcana.name(), version: 'v0.0.1', chainId: chainId, verifyingContract: p12Arcana.address };
    const deadline = Math.round(new Date().getTime() / 1000) + 86400;

    const type = {
      PowerUpdate: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'power', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const sig = await signer._signTypedData(domain, type, { tokenId: 1, power: 100, deadline: deadline });

    await p12Arcana.connect(user)['updatePower(uint256,uint256,uint256,bytes)'](1, 100, deadline, sig);

    expect(await p12Arcana.getVotingPower(1)).to.be.equal(100);
  });
  it('Should update power via meta transaction successfully', async () => {
    const chainId = await hre.getChainId();
    const domain = { name: await p12Arcana.name(), version: 'v0.0.1', chainId: chainId, verifyingContract: p12Arcana.address };
    const deadline = Math.round(new Date().getTime() / 1000) + 86400;

    const type = {
      PowerUpdate: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'power', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const sig = await signer._signTypedData(domain, type, { tokenId: 1, power: 200, deadline: deadline });

    const tx = await p12Arcana
      .connect(user)
      .populateTransaction['updatePower(uint256,uint256,uint256,bytes)'](1, 200, deadline, sig);

    const req = await signMetaTxRequest(user, forwarder, tx);

    await forwarder.connect(relayer).execute(req.request, req.signature);

    expect(await p12Arcana.getVotingPower(1)).to.be.equal(200);
  });

  it('should owner update power successfully', async () => {
    await p12Arcana
      .connect(signer)
      ['updatePower(uint256,uint256,uint256)'](1, 100, Math.round(new Date().getTime() / 1000) + 86400);

    await expect(
      p12Arcana.connect(user)['updatePower(uint256,uint256,uint256)'](1, 2, Math.round(new Date().getTime() / 1000) + 86400),
    ).to.be.revertedWith('P12Arcana: not signer');

    expect(await p12Arcana.getVotingPower(1)).to.be.equal(100);
  });

  it('Should render tokenUri successfully', async () => {
    const metadata = await p12Arcana.tokenURI(1);

    console.log(atob(metadata.slice(29)));
  });
});
