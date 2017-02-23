const express = require('express');
const parseArgs = require('minimist');
const RateLimit = require('express-rate-limit');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const app = express();

const args = parseArgs(process.argv.slice(2));
const host = args.h || 'http://localhost:8545';
const privateKey = args.k;
const port = args.p || 3000;
const value = args.v || 1;
const weiValue = value * 1e18;
const windowMs = 60 * 1000;

const web3 = new Web3(new Web3.providers.HttpProvider(host));

if (!privateKey) {
  console.log('You must pass the private key of the coinbase account (-k)');
  process.exit();
}

if (!web3.isConnected()) {
  console.log(`Can't connect to ${host}`);
  process.exit();
}
const coinbase = web3.eth.coinbase;

const limiter = new RateLimit({
  windowMs, // 1 minute
  max: 5, // limit each IP to 10 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  message: `Too many requests created from this IP, please wait ${windowMs / 1000} seconds.`,
});

app.use(limiter);

app.get('/faucet/:address', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { address } = req.params;
  console.log(`---\n${new Date()} ${ip} /faucet/${address}`);
  try {
    const nonce = web3.eth.getTransactionCount(coinbase);
    const tx = new Tx({
      from: coinbase,
      to: address,
      nonce: web3.toHex(nonce),
      value: web3.toHex(weiValue),
    });
    tx.sign(Buffer.from(privateKey, 'hex'));
    const rawTx = tx.serialize().toString('hex');
    const receipt = web3.eth.sendRawTransaction(rawTx);
    const message = `Sent ${value} ETH to ${address} ${receipt}`;
    console.log(message);
    return res.send(message);
  } catch (err) {
    const errMessage = err.message.split('\n')[0];
    console.log(errMessage);
    return res.status(500).send(errMessage);
  }
});

app.listen(port, () => {
  console.log({ host, port, value });
  console.log('Faucet started, visit /faucet/[address]\n---\n');
});
