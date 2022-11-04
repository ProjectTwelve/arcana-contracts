![License: GPL](https://img.shields.io/badge/license-GPLv3-blue)

# P12 Arcana @TI11

Smart contract repo about the P12 Arcana @TI11.

Includes:

- An NFT contract with dynamic on-chain svg render
- Minimal ERC2771 forwarder for meta transaction
- Merkle tree reward distributor

Rewards data are list in [data](data/)

## Usage

Requirement:

- Node >= 16
- pnpm >= 7

Clone the repository

```shell
$ git clone https://github.com/ProjectTwelve/arcana-contracts
```

Install dependencies

```shell
$ pnpm i
```

Run all test

```shell
$ pnpm test
```

Generate Merkle Tree Root

```
$ pnpm gen:root
```

# Credits

https://github.com/ngmachado/Waterfall

# Copyright

Copyright © 2022 Project Twelve

Licensed under [GPL-3.0](LICENSE)
