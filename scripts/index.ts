import { BigNumber } from 'ethers';
import hre, { ethers } from 'hardhat';
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

  // update power
  await arcana
    .connect(deployer)
    ['updatePower(uint256,uint256,uint256)'](BigNumber.from(a0.address), BigNumber.from(16), deadline);

  // update answer
  const answerTx = await arcana.connect(a0).populateTransaction.updateAnswerUri(
    BigNumber.from(a0.address),
    // cspell:disable-next-line
    'ipfs://QmXxPjQa1ShVnnai87qwCJg5hxJTzshwLNaqDyWGahgtUH',
  );

  const answerReq = await signMetaTxRequest(a0, forwarder, { ...answerTx, gasLimit: BigNumber.from(200000) });

  await forwarder.connect(a1).execute(answerReq.request, answerReq.signature);

  const chainId = await hre.getChainId();
  const domain = { name: await arcana.name(), version: 'v0.0.1', chainId: chainId, verifyingContract: arcana.address };
  // const deadline = Math.round(new Date().getTime() / 1000) + 86400;

  const type = {
    PowerUpdate: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'power', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const sig = await deployer._signTypedData(domain, type, {
    tokenId: BigNumber.from(a0.address),
    power: BigNumber.from(18),
    deadline: deadline,
  });

  const tx = await arcana
    .connect(a1)
    ['updatePower(uint256,uint256,uint256,bytes)'](BigNumber.from(a0.address), BigNumber.from(18), deadline, sig);

  // const req = await signMetaTxRequest(a0, forwarder, { ...tx, gasLimit: BigNumber.from(200000) });

  // const d = await forwarder.connect(a1).execute(req.request, req.signature);
  console.log(tx);
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
