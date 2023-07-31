import { ChainData, SquidData } from "@0xsquid/squid-types";

import { Contract, RpcProvider } from "../../types/ethers";
import { OverrideParams } from "../../types";

export class Utils {
  async validateNativeBalance({
    fromProvider,
    sender,
    amount,
    fromChain
  }: {
    fromProvider: RpcProvider;
    sender: string;
    amount: bigint;
    fromChain: ChainData;
  }) {
    const balance = BigInt((await fromProvider.getBalance(sender)).toString());

    if (amount > balance) {
      throw new Error(
        `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`
      );
    }

    return {
      isApproved: true,
      message: `User has the expected balance ${amount} of ${fromChain.nativeCurrency.symbol}`
    };
  }

  async validateTokenBalance({
    amount,
    fromTokenContract,
    sender,
    fromChain
  }: {
    amount: bigint;
    fromTokenContract: Contract;
    sender: string;
    fromChain: ChainData;
  }) {
    const balance = BigInt(
      (await (fromTokenContract as Contract).balanceOf(sender)).toString()
    );

    if (amount > balance) {
      throw new Error(
        `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`
      );
    }

    return {
      isApproved: true,
      message: `User has approved Squid to use ${amount} of ${await (
        fromTokenContract as Contract
      ).symbol()}`
    };
  }

  getGasData = ({
    transactionRequest,
    overrides
  }: {
    transactionRequest: SquidData;
    overrides: OverrideParams | undefined;
  }) => {
    const { gasLimit, gasPrice, maxPriorityFeePerGas, maxFeePerGas } =
      transactionRequest;

    const gasParams = maxPriorityFeePerGas
      ? {
          gasLimit,
          maxPriorityFeePerGas,
          maxFeePerGas
        }
      : {
          gasLimit,
          gasPrice
        };

    return overrides ? { ...gasParams, ...overrides } : gasParams;
  };
}
