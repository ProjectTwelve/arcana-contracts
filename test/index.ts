import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, deployments } from 'hardhat';
import { Forwarder, P12ArcanaUpgradable } from '../typechain';
import { signMetaTxRequest } from './signer';

async function getContract<T extends Contract>(contractName: string) {
  await deployments.fixture([contractName]);
  return await ethers.getContractAt<T>(contractName, (await deployments.get(contractName)).address);
}

describe('P12Arcana', function () {
  let forwarder: Forwarder;
  let p12Arcana: P12ArcanaUpgradable;
  this.beforeAll(async () => {
    forwarder = await getContract<Forwarder>('Forwarder');
    p12Arcana = await getContract<P12ArcanaUpgradable>('P12ArcanaUpgradable');
  });
  it('Should user self get successfully', async function () {
    const [user] = await ethers.getSigners();

    await p12Arcana.getBattlePass();

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);
  });
  it('Should relayer work properly', async function () {
    const [user, relayer] = await ethers.getSigners();

    const tx = await p12Arcana.populateTransaction.getBattlePass();

    const req = await signMetaTxRequest(user, forwarder, tx);

    await forwarder.connect(relayer).execute(req.request, req.signature);

    expect(await p12Arcana.balanceOf(user.address)).to.be.equal(1);

    const questionList = [0, 1, 2, 3, 4, 5, 6, 7];
    const answerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const answerTx = await p12Arcana.populateTransaction.updateAnswer(0, questionList, answerList);

    const answerReq = await signMetaTxRequest(user, forwarder, answerTx);

    await forwarder.connect(relayer).execute(answerReq.request, answerReq.signature);

    for (let i = 0; i < questionList.length; i++) {
      expect(await p12Arcana.answers(0, questionList[i])).to.be.equal(answerList[i]);
    }
  });
});
