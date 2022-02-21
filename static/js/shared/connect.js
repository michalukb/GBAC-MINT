let actualAddress
const DApp = {
  web3: null,
  contracts: {},
  accounts: [],

  init: function() {
    return DApp.initWeb3();
  },

  initWeb3: async function () {
    if (typeof window.ethereum !== 'undefined') {

      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        // console.log("connect 4")

        actualAddress = web3.utils.toChecksumAddress(accounts[0])
        // Accounts now exposed, use them
        DApp.updateAccounts(accounts);

        // Opt out of refresh page on network change
        // Ref: https://docs.metamask.io/guide/ethereum-provider.html#properties
        ethereum.autoRefreshOnNetworkChange = false;

        // When user changes to another account,
        // trigger necessary updates within DApp
        window.ethereum.on('accountsChanged', DApp.updateAccounts);
      } catch (error) {
        // User denied account access
        console.error('User denied web3 access');
        return;
      }
      DApp.web3 = new Web3(window.ethereum);
    }
    else if (web3) {
      // Deprecated web3 provider
      DApp.web3 = new Web3(web3.currentProvider);
      // no need to ask for permission
    }
    // No web3 provider
    else {
      console.error('No web3 provider detected');
      return;
    }
    return DApp.initContract();
  },

  updateAccounts: async function(accounts) {
    const firstUpdate = !(DApp.accounts && DApp.accounts[0]);
    DApp.accounts = accounts || await DApp.web3.eth.getAccounts();
    actualAddress = web3.utils.toChecksumAddress(accounts[0])
    if (!firstUpdate) {
      DApp.render();
    }
  },

  initContract: async function() {
    let networkId = await DApp.web3.eth.net.getId();

    return DApp.render();
  },

  render: async function() {

  },
};

async function connect(){
  const ethEnabled = () => {
    if (web3)
    {
      try{
        web3 = new Web3(web3.currentProvider);
        window.ethereum.enable();
        return true;
      }catch(err){
        alert("Metamask not connected")
      }

    }
    return false;
  }

  if (!ethEnabled()) {
    alert("Please install MetaMask to use this dApp!");
  } else{
    // console.log("document.querySelector('.connect'): ", document.querySelector('.connect'))
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });


    actualAddress = web3.utils.toChecksumAddress(accounts[0])
    document.querySelector('.connect').textContent = actualAddress.substring(0, 4) + " ... " + actualAddress.substr(actualAddress.length - 2)

    alert("connected to metamask")

  }

}

async function connect2(){
  await DApp.init();
  const ethEnabled = () => {
    if (web3)
    {
      try{
        web3 = new Web3(web3.currentProvider);
        window.ethereum.enable();
        window.ethereum.on('accountsChanged', DApp.updateAccounts);
        return true;
      }catch(err){
        alert("Metamask not connected")
      }
    }
    return false;
  }

  if (!ethEnabled()) {
    alert("Please install MetaMask to use this dApp!");
  } else{

    document.querySelector('.connect').textContent = actualAddress.substring(0, 6) + " ... " + actualAddress.substr(actualAddress.length - 4)

  }

}
