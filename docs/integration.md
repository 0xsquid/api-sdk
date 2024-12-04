## Integration Tests

1. Run the backend API

2. Run all tests

```bash
yarn integration
```

Run only specific tests

```bash
yarn integration:sendtrade
yarn integration:tradesend
yarn integration:tradesendtrade
```

## Examples to interact with the Squid API - testnet supported

API endpoint documentation
<https://docs.squidrouter.com/api>

- install package dependencies "yarn install"
- configuration in .env file (rename example to .env)
- explore the /api/quotes & api/tokens endpoints for supported chains and tokens
- run approval.ts to approve tokens before any transactions eg "yarn ts-node approve.ts"
- run transaction.ts to query /api/transaction endpoint and send tokens cross chain ✨

## Notes

Transactions are not sent via the api, the api is a helper endpoint only, transactions are submitted via the callers rpc endpoint.
