import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import { addFlatTask } from './flat';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';

import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@openzeppelin/hardhat-upgrades';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-contract-sizer';

dotenv.config();
addFlatTask();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const deployer = process.env.DEPLOYER || '0x0000000000000000000000000000000000000000';
const owner = process.env.OWNER || '0x0000000000000000000000000000000000000000';
const accounts = process.env.ACCOUNTS ? process.env.ACCOUNTS.split(',') : [];
// const addresses = process.env.ADDRESSES ? process.env.ADDRESSES.split(',') : [];

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 44102,
      deploy: ['deploy/hardhat'],
    },
    p12TestNet: {
      url: 'https://testnet.p12.games/',
      chainId: 44010,
      accounts: accounts,
      gas: 'auto',
      gasPrice: 'auto',
    },
    bnbMain: {
      url: 'https://bsc-dataseed1.binance.org/',
      accounts: accounts,
      gas: 'auto',
      gasPrice: 'auto',
      deploy: ['deploy/bnbMain'],
      tags: ['production'],
    },
    bnbTestStaging: {
      url: process.env.BNB_CHAIN_TEST_URL,
      accounts: accounts,
      gas: 'auto',
      gasPrice: 'auto',
      deploy: ['deploy/bnbTestStaging'],
      tags: ['staging'],
    },
    bnbTest: {
      url: process.env.BNB_CHAIN_TEST_URL,
      accounts: accounts,
      gas: 'auto',
      gasPrice: 'auto',
      deploy: ['deploy/bnbTest'],
      tags: ['test'],
    },
    mumbai: {
      url: 'https://matic-mumbai.chainstacklabs.com',
      accounts: accounts,
      gas: 'auto',
      gasPrice: 'auto',
      deploy: ['deploy/mumbai'],
      tags: ['test'],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      p12TestNet: deployer,
      bnbTest: deployer,
      bnbTestStaging: deployer,
      bnbMain: deployer,
      mumbai: deployer,
    },
    owner: {
      default: 0,
      bnbTest: owner,
      bnbTestStaging: owner,
      bnbMain: owner,
    },
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  deterministicDeployment: {
    // bnb Chain Test
    97: { factory: '0x4e59b44847b379578588920cA78FbF26c0B4956C', deployer: '', funding: '', signedTx: '' },
    // bnb Chain Main
    56: { factory: '0x4e59b44847b379578588920cA78FbF26c0B4956C', deployer: '', funding: '', signedTx: '' },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'ETH',
    gasPrice: 5,
    showTimeSpent: true,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.BNBSCAN_API_KEY!,
  },
  external: {
    contracts: [
      {
        artifacts: 'node_modules/@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/',
      },
    ],
  },
};

export default config;
