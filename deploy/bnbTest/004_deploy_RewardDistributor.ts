import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('RewardDistributor', {
    from: deployer,
    // BUSD token on bsc testnet https://bscscan.com/address/0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee
    args: ['0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee'],
    log: true,
  });
};
func.tags = ['RewardDistribution'];

export default func;
