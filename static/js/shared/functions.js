function removeLoader(){

      $('#divLoading').remove();

}


async function getCoinbase(){
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return web3.utils.toChecksumAddress(accounts[0])
}
