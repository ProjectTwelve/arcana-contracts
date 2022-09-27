import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { exit } from 'process';
import { getContract } from '../test/utils';
import { signMetaTxRequest } from '../test/signer';
import { Forwarder, P12ArcanaUpgradable } from '../typechain';

async function main() {
  const [deployer, a0, a1] = await ethers.getSigners();

  const arcana = await getContract<P12ArcanaUpgradable>('P12ArcanaUpgradable');
  const forwarder = await getContract<Forwarder>('Forwarder');

  // get battle pass
  await arcana.connect(a1)['getBattlePass(address)'](a0.address);

  const deadline = Math.round(new Date().getTime() / 1000) + 86400;

  //   // update power
  await arcana
    .connect(deployer)
    ['updatePower(uint256,uint256,uint256)'](BigNumber.from(a0.address), BigNumber.from(16), deadline);

  // update answer
  const answerTx = await arcana.connect(a0).populateTransaction.updateAnswerUri(
    BigNumber.from(a0.address),
    // cspell:disable-next-line
    'ipfs://bafyreibenzyulwwmj7gmcbd4tbqanehuumwi3vpfjttspp7gs5kylouasx',
  );

  const answerReq = await signMetaTxRequest(a0, forwarder, { ...answerTx, gasLimit: BigNumber.from(100000) });

  console.log(answerReq);
  //   await forwarder.connect(a1).execute(answerReq.request, answerReq.signature);
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
