import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Forwarder } from '../typechain';

const ForwardRequest = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
];

function getMetaTxTypeData(chainId: number, verifyingContract: string) {
  return {
    types: {
      ForwardRequest,
    },
    domain: {
      name: 'MinimalForwarder',
      version: '0.0.1',
      chainId,
      verifyingContract,
    },
    primaryType: 'ForwardRequest',
  };
}
async function buildTypedData(forwarder: Forwarder, request: PopulatedTransaction) {
  const chainId = await forwarder.provider.getNetwork().then((n) => n.chainId);
  const typeData = getMetaTxTypeData(chainId, forwarder.address);
  return { ...typeData, message: request };
}

async function buildRequest(forwarder: Forwarder, input: PopulatedTransaction) {
  const nonce = await forwarder.getNonce(input.from!).then((nonce) => nonce.toNumber());
  return { value: BigNumber.from(0), gas: input.gasLimit!, nonce, from: input.from!, to: input.to!, data: input.data! };
}

export async function signMetaTxRequest(signer: SignerWithAddress, forwarder: Forwarder, input: PopulatedTransaction) {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signer._signTypedData(toSign.domain, toSign.types, toSign.message);
  return { signature, request };
}
