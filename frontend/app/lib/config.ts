import { baseSepolia } from 'viem/chains';
import contractData from './contracts/EngageLayerProtocol.json';

export const CONTRACT_ADDRESS = contractData.address as `0x${string}`;
export const CONTRACT_ABI = contractData.abi;
export const CHAIN = baseSepolia;
