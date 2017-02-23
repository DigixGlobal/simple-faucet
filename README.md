# Simple Faucet

A simple rate-limited faucet for funding ether accounts.

##  Install

Clone this repo, run `npm i;`

## Usage

Start a TestRPC server with a lot of ETH.

```bash
testrpc --secure --account="0xe07bb36099d7f056fcda53a4870d6fa9ac4b56b1c2db640b073729092a509167,999999999999999999999999999999999"
```

Start the faucet server, pass the private key (generate a new one with `crypto.randomBytes(32).toString('hex')`).

```bash
node index.js -k e07bb36099d7f056fcda53a4870d6fa9ac4b56b1c2db640b073729092a509167
# -p port (default 3000)
# -v eth value transfer per request (default 1)
# -h host of the eth node (default http://localhost:8545)
# -k private key
```

Optionally, configure nginx:

```
location /faucet/ {
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_pass http://localhost:3000;
}
```

## HTTP API

```
[host]/faucet/[ethereum address]
```
