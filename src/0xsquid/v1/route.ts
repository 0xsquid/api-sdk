import {
  Estimate,
  RouteResponse,
  TransactionRequest,
  RouteParams,
  Route,
  RouteData,
  Call,
  CallType,
  Bridge,
  Swap,
  TokenData,
  FeeCost,
  GasCost,
  CustomCall,
  ContractCall,
  OptimalRoute
} from "../../types";
import { removeEmpty } from "./util";

export const parseTokenData = (data: any): TokenData => {
  const { chainId, address, name, symbol, decimals, logoURI, coingeckoId } =
    data;
  return {
    chainId,
    address,
    name,
    symbol,
    decimals,
    logoURI,
    coingeckoId
  };
};

export const parseBridge = (data: any): Call => {
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact
  } = data;
  return {
    type: CallType.BRIDGE,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact
  } as Bridge;
};

export const parseSwap = (data: any): Call => {
  const {
    type,
    dex: { chainName, dexName, factory, isStable, swapRouter },
    path,
    squidCallType,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact,
    dynamicSlippage
  } = data;
  return removeEmpty({
    type,
    dex: { chainName, dexName, factory, isStable, swapRouter },
    squidCallType,
    path,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    toAmountMin,
    exchangeRate,
    priceImpact,
    dynamicSlippage
  } as Swap);
};

export const parseCustom = (data: any): Call => {
  const { type, callType, target, value, callData, estimatedGas, payload } =
    data;
  return removeEmpty({
    type,
    callType,
    target,
    value,
    callData,
    estimatedGas,
    payload
  } as CustomCall);
};

export const parseRoute = (data: any[]): Route => {
  const calls = data
    .filter((call: Call) =>
      [CallType.BRIDGE, CallType.CUSTOM, CallType.SWAP].includes(call.type)
    )
    .map((call: any) => {
      switch (call.type as CallType) {
        case CallType.BRIDGE:
          return parseBridge(call);
        case CallType.SWAP:
          return parseSwap(call);
        case CallType.CUSTOM:
          return parseCustom(call);
      }
    });
  return calls;
};

export const parseOptimalRoute = (data: any): OptimalRoute => {
  const { fromChain, toChain } = data;
  const routeData = {
    fromChain: parseRoute(fromChain),
    toChain: parseRoute(toChain)
  };
  return routeData;
};

export const parseFeeCost = (data: any): FeeCost[] =>
  data.map((item: any) => {
    return {
      name: item.name,
      description: item.description,
      percentage: item.percentage,
      token: parseTokenData(item.token),
      amount: item.amount,
      amountUSD: item.amountUSD
    };
  });

export const parseGasCost = (data: any): GasCost[] =>
  data.map((item: any) => {
    const {
      type,
      token,
      amount,
      amountUSD,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimate,
      limit
    } = item;
    return {
      type,
      token: parseTokenData(token),
      amount,
      amountUSD,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimate,
      limit
    } as GasCost;
  });

export const parseEstimate = (data: any): Estimate => {
  const {
    fromAmount,
    sendAmount,
    toAmount,
    toAmountMin,
    route,
    exchangeRate,
    estimatedRouteDuration,
    aggregatePriceImpact,
    feeCosts,
    gasCosts
  } = data;
  const estimate = {
    fromAmount,
    sendAmount,
    toAmount,
    toAmountMin,
    route: parseOptimalRoute(route),
    exchangeRate,
    estimatedRouteDuration,
    aggregatePriceImpact,
    feeCosts: parseFeeCost(feeCosts),
    gasCosts: parseGasCost(gasCosts)
  } as Estimate;
  return estimate;
};

export const parseTransactionRequest = (request: any): TransactionRequest => {
  const {
    routeType,
    targetAddress,
    data,
    value,
    gasLimit,
    gasPrice,
    gasCosts,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = request;
  return {
    routeType,
    targetAddress,
    data,
    value,
    gasLimit,
    gasPrice,
    gasCosts,
    maxFeePerGas,
    maxPriorityFeePerGas
  } as TransactionRequest;
};

export const parseCustomContractCall = (data: any): ContractCall => {
  const { callType, target, value, callData, estimatedGas } = data;
  return removeEmpty({
    callType,
    target,
    value, //optional
    callData,
    payload: data.payload ? data.payload : undefined,
    estimatedGas
  } as ContractCall);
};

export const parseParams = (data: any): RouteParams => {
  const {
    fromChain,
    toChain,
    fromToken,
    fromAmount,
    toToken,
    toAddress,
    slippage,
    quoteOnly, //optional
    enableForecall //optional
  } = data;
  return removeEmpty({
    fromChain,
    toChain,
    fromAmount,
    fromToken: parseTokenData(fromToken),
    toToken: parseTokenData(toToken),
    toAddress,
    slippage,
    quoteOnly,
    enableForecall: enableForecall ? enableForecall : undefined,
    customContractCalls: data.customContractCalls
      ? parseCustomContractCall(data.customContractCalls)
      : undefined
  });
};

export const parseRouteResponse = (response: any): RouteResponse => {
  const routeResponse = {
    route: {
      estimate: parseEstimate(response.estimate),
      transactionRequest: parseTransactionRequest(response.transactionRequest),
      params: parseParams(response.params)
    }
  };
  return routeResponse;
};
