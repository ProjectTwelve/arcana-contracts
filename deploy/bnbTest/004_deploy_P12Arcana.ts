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
          args: [
            'P12 Fantasy Pass',
            'P12FP',
            'v0.0.1',
            "P12 Fantasy Pass is a symbol of participation in P12 Arcana @ TI11, a massive online web3 gaming campaign in accordance with one of the world's biggest esports tournaments: The International 2022, featuring Dota 2.",
          ],
        },
      },
    },
    log: true,
  });
};
func.tags = ['P12ArcanaUpgradable'];

export default func;
