import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';

export async function getContract<T extends Contract>(contractName: string) {
  return await ethers.getContractAt<T>(contractName, (await deployments.get(contractName)).address);
}
