// import { parseEther } from 'ethers/lib/utils';
// import { ethers } from 'hardhat';
// import { TokenSender } from '../typechain';
// import { getContract } from './utils';

// function randomAddress() {
//   return ethers.utils.computeAddress(ethers.utils.randomBytes(32));
// }

// function genRandomAddress(number: number) {
//   return Array.from({ length: number }, (e, i) => randomAddress());
// }

// describe('TokenSender', function () {
//   let tokenSender: TokenSender;
//   this.beforeAll(async () => {
//     tokenSender = await getContract<TokenSender>('TokenSender');
//   });
//   it('', async () => {
//     const addresses = genRandomAddress(750);
//     const perValue = 0.002;
//     console.log(addresses);

//     await tokenSender.sendNativeToken(addresses, ethers.utils.parseEther(perValue.toString()), {
//       value: parseEther((addresses.length * perValue).toString()),
//     });
//   });
// });
