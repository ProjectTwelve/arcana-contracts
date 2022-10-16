import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const testERC20 = await get('TestERC20');

  await deploy('RewardDistributor', {
    from: deployer,
    args: [testERC20.address],
    log: true,
  });
};
func.tags = ['RewardDistribution'];

export default func;
