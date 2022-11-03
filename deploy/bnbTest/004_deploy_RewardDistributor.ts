import { formatBytes32String, keccak256 } from 'ethers/lib/utils';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  await deploy('RewardDistributor', {
    from: deployer,
    args: [owner],
    log: true,
    deterministicDeployment: keccak256(formatBytes32String('P12_Arcana_V1_Test')),
  });
};
func.tags = ['RewardDistribution'];

export default func;
