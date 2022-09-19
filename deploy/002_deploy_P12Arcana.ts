import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { get, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const forwarder = await get('Forwarder');

  await deploy('P12ArcanaUpgradable', {
    from: deployer,
    args: [forwarder.address],
    proxy: {
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}'],
      execute: {
        init: {
          methodName: 'initialize',
          args: ['P12MultiCastVoter', 'P12-MCV', 'v0.0.1'],
        },
      },
    },
    log: true,
  });
};
func.tags = ['P12AssetFactory'];

export default func;
