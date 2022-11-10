import { formatBytes32String, keccak256 } from 'ethers/lib/utils';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  await deploy('CollabUpgradable', {
    from: deployer,
    proxy: {
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}'],
      execute: {
        init: {
          methodName: 'initialize',
          args: [owner],
        },
      },
    },
    log: true,
    deterministicDeployment: keccak256(formatBytes32String('P12_Collab_V1')),
  });
};
func.tags = ['CollabUpgradable'];

export default func;
