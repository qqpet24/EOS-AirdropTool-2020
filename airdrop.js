const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  
const fetch = require('node-fetch'); 
const { TextDecoder, TextEncoder } = require('util');
const rpc = new JsonRpc('http://openapi.eos.ren', { fetch }); //API node
const signatureProvider = new JsSignatureProvider(["//Your privte key"]);//Change this field to your account's private key
const api = new Api({ rpc, signatureProvider , textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const account="Your account"//Change this field to your account
var flag=1;//Airdrop to accounts after this line in filePath
const batchAction=100;// Airdrop to 100 account in one time
const filePath='account.txt'//The airdrop account list
const tokenContract='eosio.token'//If EOS,it's eosio.token
const quantity='0.0001 EOS'// If 0.0001 EOS It means that you will airdrop 0.0001 EOS to other account
const awaitTime=1200;//ms



function sleep (time) {  
	return new Promise((resolve) => setTimeout(resolve, time));
}
var airdropAccounts=[];
var fs=require('fs');
fs.readFile(filePath,'utf-8',function(err,data){
	if(err){
		console.error(err);
	}
	else{
		airdropAccounts=data.split("\r\n");
	}
});

(async () =>{
	await sleep(10000);//Waitting for reading file,等待文件读取进去
	while(true){
		if(flag>airdropAccounts.length){
			break;
		}
		if(true){
			try {
				var myactions = [];

				for(var i=flag;i<flag+batchAction;i++){
					var myaction =  {
						account: tokenContract,
						name: 'transfer',
						authorization: [{
							actor:account,
							permission: 'active',
						}],
						data: {
								"from":account,
								"to":airdropAccounts[i],
								"quantity":quantity,
								"memo":flag
							  },
					};	
					myactions.push(myaction);
				}
				console.log(myactions);
				var result=await api.transact({
					actions: myactions
				}, {
					blocksBehind: 30,
					expireSeconds: 30,
				});
				console.log(result)
			} catch (e) {
				console.log(e);
				//console.log(e.json.error.details);
			}
		}
		flag+=batchAction;
		await sleep(awaitTime);
	}
})();