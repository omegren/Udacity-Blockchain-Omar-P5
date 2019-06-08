var HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = 'permit umbrella primary robust tissue battle child town opera broccoli bird crystal';
const infura = 'rinkeby.infura.io/v3/2205bb81bde841728a7b23ce05835a18'

module.exports = {
  networks: { 
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*"
    }, 
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, infura),
      network_id: 4,
      gas : 4500000,
      gasPrice : 10000000000
    },
  }
};