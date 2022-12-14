import { exit } from 'process';
import * as path from 'path';
import * as csv from 'fast-csv';
import * as fs from 'fs-extra';
import { keccak256, parseEther, solidityKeccak256 } from 'ethers/lib/utils';
// import { BigNumber } from 'ethers';
import MerkleTree from 'merkletreejs';
import { assert } from 'console';

// interface UserReward {
//   address: string;
//   amount: BigNumber;
//   //   solvedPredictions: number;
// }

async function main() {
  const data: any[] = [];
  fs.createReadStream(path.resolve(__dirname, '../data/reward.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => {
      data.push({ address: row.wallet_address, amount: row.total_reward });
    })
    .on('end', () => {
      // check whether addresses is not independent
      const allAddr = data.map((x) => {
        return x.address;
      });

      const allAddrSet = new Set(allAddr);
      assert(allAddr.length === allAddrSet.size);

      fs.writeFileSync(path.resolve(__dirname, '../data/merkleTree.json'), JSON.stringify(data));
      const tree = new MerkleTree(
        data.map((x) => {
          return solidityKeccak256(['address', 'uint256'], [x.address, parseEther(x.amount)]);
        }),
        keccak256,
        { sort: true },
      );
      const hexRoot = '0x' + tree.getRoot().toString('hex');
      console.log('Merkle Tree Root: ', hexRoot);

      const leaf = '';

      const proof = tree.getProof(leaf).map((v) => {
        return '0x' + v.data.toString('hex');
      });
      console.log('Proof: ', proof);
    });
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
