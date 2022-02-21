
var infura2 = "https://mainnet.infura.io/v3/9c7e70b4bf234955945ff87b8149926e"

if (typeof web3 !== 'undefined') {
    // Mist, Metamask
    web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    // web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(infura2));
}

let simpleMarketplace_instance = new web3.eth.Contract(simpleMarketplace_abi, simpleMarketplace_address);
var erc721_instance = new web3.eth.Contract(erc721_abi, erc721_address);


async function updatePage(){
  console.log("updating ")
  let minted = document.querySelector('#total')

  let maxSupply = await simpleMarketplace_instance.methods.maxToMint().call()

  let totalSupply = await simpleMarketplace_instance.methods.totalSupply().call()

  minted.innerText = totalSupply + " / 5000 Already Minted !"
}

updatePage()




async function mint(){
  console.log("minting")

  let mintFee = await simpleMarketplace_instance.methods.mintFee().call()

  let target = document.querySelector('#count')
  let count = 1
  count = parseInt(target.value)
  count = count.toString()
  var price = mintFee * count

  hexNativeFees = web3.utils.toHex(price)

  const acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  parameter = {
      value: hexNativeFees,
      from: acc[0],
      gas: web3.utils.toHex(count*mintingGas),
      gasPrice: web3.utils.toHex(gasPrice)
  }

  let balance = await erc721_instance.methods.balanceOf(acc[0]).call();
  console.log('display warning: ', balance)
  if (balance == 0){

    document.querySelector('.not-holder').classList.add('warning-visible')
    await sleep(5000)
    document.querySelector('.not-holder').classList.remove('warning-visible')
    return
  }

  simpleMarketplace_instance.methods.mint(count).send(parameter, (err, transactionHash) => {
      window.alert("Transaction sent: "+transactionHash)
      if(transactionHash){
      $('main').append('<div id="divLoading" style="margin: 0px; padding: 0px; position: fixed; right: 0px; top: 0px; width: 100%; height: 100%; background-color: rgb(102, 102, 102); z-index: 30001; opacity: 0.8;">\
        <p style="position: absolute; color: White; top: 50%; left: 45%;">\
        Pending transactions, please wait...\
        <img src="static/assets/create/loader.gif">\
        </p>\
        </div>');
      }
      tx_hash = transactionHash
  }).on('confirmation', () => {}).then((newContractInstance) => {
    setTimeout(removeLoader, 2000);
      window.alert('Minted')
  })
  .catch(function(error){
    setTimeout(removeLoader, 2000);
    window.alert("Minting failed")
  })
    // })

}
