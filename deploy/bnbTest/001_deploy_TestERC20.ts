import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('TestERC20', {
    from: deployer,
    args: ['Test ERC20', 'TRC'],
    log: true,
  });
};
func.tags = ['TestERC20'];

export default func;
