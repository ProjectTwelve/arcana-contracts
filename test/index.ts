import { expect } from 'chai';
import { ethers } from 'hardhat';
import { signMetaTxRequest } from './signer';

describe('P12Arcana', function () {
  let forwarderAddr: string;
  this.beforeAll(async () => {
    const ForwarderF = await ethers.getContractFactory('Forwarder');
    const forwarder = await ForwarderF.deploy();
    forwarderAddr = forwarder.address;
  });
  it('Should user self get successfully', async function () {
    const [user] = await ethers.getSigners();

    const forward = await ethers.getContractAt('Forwarder', forwarderAddr);

    const p12Arcana = await (await ethers.getContractFactory('P12Arcana')).deploy('', '', forward.address);

    await p12Arcana.getBattlePass();

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);
  });
  it('Should relayer work properly', async function () {
    const [user, relayer] = await ethers.getSigners();

    const forward = await ethers.getContractAt('Forwarder', forwarderAddr);

    const p12Arcana = await (await ethers.getContractFactory('P12Arcana')).deploy('', '', forward.address);

    const tx = await p12Arcana.populateTransaction.getBattlePass();

    const req = await signMetaTxRequest(user, forward, tx);

    await forward.connect(relayer).execute(req.request, req.signature);

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);

    const questionList = [0, 1, 2, 3, 4, 5, 6, 7];
    const answerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const answerTx = await p12Arcana.populateTransaction.updateAnswer(0, questionList, answerList);

    const answerReq = await signMetaTxRequest(user, forward, answerTx);

    await forward.connect(relayer).execute(answerReq.request, answerReq.signature);

    for (let i = 0; i < questionList.length; i++) {
      expect(await p12Arcana.answers(0, questionList[i])).to.be.equal(answerList[i]);
    }
  });
});
