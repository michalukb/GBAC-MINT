var infura2 = "https://mainnet.infura.io/v3/9c7e70b4bf234955945ff87b8149926e"

if (typeof web3 !== 'undefined') {

    web3 = new Web3(window.ethereum);
    window.ethereum.enable();

} else {

    web3 = new Web3(new Web3.providers.HttpProvider(infura2));
}

const serverUrl = "https://nfwc5wjxawdx.usemoralis.com:2053/server";
const appId = "BaPv13MBAyQisHJ7nB1CplUGgGhVdS6CPi12sUrN";
Moralis.start({ serverUrl, appId });

async function getNFTs(){

    let acc = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const options = { chain: 'eth', address: acc[0]}

    const nfts = await Moralis.Web3.getNFTs(options);
    console.log(nfts);

    nfts.forEach(function(nft){
       console.log(nft.token_uri);
    })
 }

 getNFTs()

// let loadNftAddress = "0x56fB2a9f4176E1c5D373785e7aAA84427ef7D6aB" // mainnet
let loadNftAddress = "0x1B0C5BF048C509732DbEb44bc92b5474900beC2f" // testnet
// let stakingAddress = "0x885d69388cAa76C3b005D9f10A7070C1D662cAf1"

let loadNft_instance = new web3.eth.Contract(loadNft_abi, loadNftAddress);
var erc721_instance = new web3.eth.Contract(erc721_abi, erc721_address);

var staking_instance = new web3.eth.Contract(staking_abi, staking_address);

var erc20_instance = new web3.eth.Contract(erc20_abi, erc20_address);


async function updatePage(){
  let acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  console.log(acc)
  let user = acc[0]
  let totalStaked = document.querySelector('#totalStaked')
  let stakedByUser = document.querySelector('#stakedByUser')
  let dailyYield = document.querySelector('#dailyYield')

  let totalReward = document.querySelector('#totalReward')
  let claimedReward = document.querySelector('#claimedReward')
  let pendingReward = document.querySelector('#pendingReward')

  let tokens = await loadNft_instance.methods.getTokens(user).call()
  console.log("tokens: ", tokens)
  let html = ''

  let symbol = await erc20_instance.methods.symbol().call()

  let userStakedBalance = await staking_instance.methods.balanceOf(user).call()
  console.log('userStakedBalance: ', userStakedBalance)
  let totalStakedBalance = await staking_instance.methods.totalSupply().call()

  console.log('totalStakedBalance: ', totalStakedBalance)

  totalStaked.innerText = (await staking_instance.methods.totalSupply().call()) + ' BGAC'
  stakedByUser.innerText = await staking_instance.methods.balanceOf(user).call() + ' BGAC'

  if (totalStakedBalance == 0){
    totalStakedBalance = 1
  }

  dailyYield.innerText = (userStakedBalance * 54800 / totalStakedBalance) +  " " + symbol

  let claimed = await staking_instance.methods.paid(user).call() / 1e18
  claimedReward.innerText = claimed.toFixed(4) + " " + symbol

  let pending = await staking_instance.methods.earned(user).call() / 1e18
  pendingReward.innerText = pending.toFixed(4) + " " + symbol
  let total = parseFloat(pending) + parseFloat(claimed)
  totalReward.innerText = total.toFixed(4) + " " + symbol
  // totalReward.innerText = await staking_instance.methods.balanceOf(user).call()

  // nfts.innerHTML = html

}

updatePage()

let interval = 5000


var intervalId = setInterval(function() {
  updatePage()
}, interval);


async function stakeApproved(id){
  console.log("stake: ", id)

  const acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  parameter = {
      from: acc[0],
      gas: web3.utils.toHex(stakingGas),
      gasPrice: web3.utils.toHex(gasPrice)
  }
  staking_instance.methods.stake(id).send(parameter, (err, transactionHash) => {
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
      window.alert('Staked')
  })
  .catch(function(error){
    setTimeout(removeLoader, 2000);
    window.alert("Staking failed")
  })
}

async function stakeApprove(id){
  console.log("stake: ", id)

  const acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  parameter = {
      from: acc[0],
      gas: web3.utils.toHex(approveGas),
      gasPrice: web3.utils.toHex(gasPrice)
  }

  erc721_instance.methods.approve(staking_address, id).send(parameter, (err, transactionHash) => {
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
      window.alert('Approved')
      parameter = {
          from: acc[0],
          gas: web3.utils.toHex(stakingGas),
          gasPrice: web3.utils.toHex(gasPrice)
      }
      staking_instance.methods.stake(id).send(parameter, (err, transactionHash) => {
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
          window.alert('Staked')
      })
      .catch(function(error){
        setTimeout(removeLoader, 2000);
        window.alert("Staking failed")
      })
  })
  .catch(function(error){
    setTimeout(removeLoader, 2000);
    window.alert("Approve failed")
  })
}

async function stake(id){
  console.log("stake: ", id)

  const acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  parameter = {
      from: acc[0],
      gas: web3.utils.toHex(approveGas),
      gasPrice: web3.utils.toHex(gasPrice)
  }

  let approved = await erc721_instance.methods.getApproved(id).call()

  approved = web3.utils.toChecksumAddress(approved)

  staking = web3.utils.toChecksumAddress(staking_address)

  if(approved == staking){
    stakeApproved(id)
  }else{
    stakeApprove(id)
  }
}

async function unstake(id){

  const acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  parameter = {
      from: acc[0],
      gas: web3.utils.toHex(unstakeGas),
      gasPrice: web3.utils.toHex(gasPrice)
  }
  console.log("unstake: ", id)
  staking_instance.methods.withdraw(id).send(parameter, (err, transactionHash) => {
      window.alert("Transaction sent: "+transactionHash)
      if(transactionHash){
      $('main').append('<div id="divLoading" style="margin: 0px; padding: 0px; position: fixed; right: 0px; top: 0px; width: 100%; height: 100%; background-color: rgb(102, 102, 102); z-index: 30001; opacity: 0.8;">\
        <p style="position: absolute; color: White; top: 50%; left: 45%;">\
        Pending transactions, please wait...\
        <img src="static/loader.gif">\
        </p>\
        </div>');
      }
      tx_hash = transactionHash
  }).on('confirmation', () => {}).then((newContractInstance) => {
    setTimeout(removeLoader, 2000);
      window.alert('Unstaked')
  })
  .catch(function(error){
    setTimeout(removeLoader, 2000);
    window.alert("Unstaking failed")
  })
}


// async function loadNfts(){
//   let acc = await window.ethereum.request({
//     method: 'eth_requestAccounts',
//   });
//
//   console.log("loading NFTs for account: ", acc)
//   let user = acc[0]
//   interval = 500000
//
//   const options = { chain: 'eth', address: acc[0]}
//
//   const tokens = await Moralis.Web3.getNFTs(options);
//
//   console.log("tokens: ", tokens)
//   let html = ''
//
//   let nfts = document.querySelector('#nfts')
//
//   tokens.forEach(async function (arrayItem) {
//
//     let metadataUri = 'https://babygirlsapeclub.com/metadata/'+arrayItem.token_id+'.json'
//     console.log("metadataUri: ", metadataUri)
//
//     let metadata = await $.getJSON(metadataUri);
//
//     console.log('metadata: ', metadata)
//     console.log('metadata image: ', metadata['image'])
//
//     html = html + '\
//     <div class="card">\
//         <img src='+metadata['image']+' alt="">\
//         <div class="card-content">\
//             <p>Ape Baby Girl #'+arrayItem.token_id+'</p>\
//             <p onclick="stake('+arrayItem.token_id+')">Stake</p>\
//         </div>\
//     </div>\
//     '
//
//     nfts.innerHTML = html
//
//   });
//   interval = 5000
// }


async function loadNfts(){
  let acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  console.log("loading NFTs for account: ", acc)
  let user = acc[0]
  interval = 500000

  const options = { chain: 'eth', address: acc[0]}

  // const tokens = await Moralis.Web3.getNFTs(options);

  let tokens = await loadNft_instance.methods.getTokens(user).call()

  console.log("tokens: ", tokens)
  let html = ''

  let nfts = document.querySelector('#nfts')

  tokens.forEach(async function (arrayItem) {

    let metadataUri = 'http://127.0.0.1:5001/metadata/'+arrayItem+'.json'
    console.log("metadataUri: ", metadataUri)

    let metadata = await $.getJSON(metadataUri);

    console.log('metadata: ', metadata)
    console.log('metadata image: ', metadata['image'])

    html = html + '\
    <div class="card">\
        <img src='+metadata['image']+' alt="">\
        <div class="card-content">\
            <p>Ape Baby Girl #'+arrayItem+'</p>\
            <p onclick="stake('+arrayItem+')">Stake</p>\
        </div>\
    </div>\
    '

    nfts.innerHTML = html

  });
  interval = 5000
}

loadNfts()

async function loadStaked(){
  let acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  console.log(acc)
  let user = acc[0]
  let balanceStaked = await staking_instance.methods.balanceOf(user).call()
  console.log("balanceStaked: ", balanceStaked)
  let html = ''

  let nfts = document.querySelector('#staking')

  for(var i = 0; i < parseInt(balanceStaked); i++){
    let tokenId = await staking_instance.methods.tokenOfStakerByIndex(user, i).call()
    let metadataUri = await erc721_instance.methods.tokenURI(tokenId).call()

    let metadata = await $.getJSON(metadataUri);

    console.log('metadata: ', metadata)
    console.log('metadata image: ', metadata['image'])

    html = html + '\
    <div class="card">\
        <img src='+metadata['image']+' alt="">\
        <div class="card-content">\
            <p>Ape Baby Girl #'+tokenId+'</p>\
            <p onclick="unstake('+tokenId+')">unstake</p>\
        </div>\
    </div>\
    '
    nfts.innerHTML = html
  }
}

loadStaked()


async function claim(){

  const acc = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  parameter = {
      from: acc[0],
      gas: web3.utils.toHex(claimGas),
      gasPrice: web3.utils.toHex(gasPrice)
  }

  staking_instance.methods.getReward().send(parameter, (err, transactionHash) => {
      window.alert("Transaction sent: "+transactionHash)
      if(transactionHash){
      $('main').append('<div id="divLoading" style="margin: 0px; padding: 0px; position: fixed; right: 0px; top: 0px; width: 100%; height: 100%; background-color: rgb(102, 102, 102); z-index: 30001; opacity: 0.8;">\
        <p style="position: absolute; color: White; top: 50%; left: 45%;">\
        Pending transactions, please wait...\
        <img src="static/loader.gif">\
        </p>\
        </div>');
      }
      tx_hash = transactionHash
  }).on('confirmation', () => {}).then((newContractInstance) => {
    setTimeout(removeLoader, 2000);
      window.alert('Claimed')
  })
  .catch(function(error){
    setTimeout(removeLoader, 2000);
    window.alert("Claim failed")
  })
}
