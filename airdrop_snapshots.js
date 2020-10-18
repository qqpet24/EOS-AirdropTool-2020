const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  
const fetch = require('node-fetch'); 
const { TextDecoder, TextEncoder } = require('util');
const rpc = new JsonRpc('http://openapi.eos.ren', { fetch }); 

const awaitTime=10;
const limit=5000;
const tokenContract="eosio.token"
const tokenTable="accounts"



function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
async function getScope(code,table,lower_bound,limit){
	let data = await rpc.get_table_by_scope({
		code:code,
		table:table,
		lower_bound: lower_bound,
		limit:limit//表行数限制
	})
	return data;
}
async function getFullTableScope(code,table){
	var data=[];
	var nextkey=0;
	var isFirst=true;
	while(true){
		try{
			var tmpdata=await getScope(code,table,nextkey,limit);
			for(var i=0;i<Object.keys(tmpdata.rows).length;i++){
				if(isFirst==true){
					isFirst=false;
				}else if(i==0){
					continue;
				}
				data.push(tmpdata.rows[i]);
			}
			nextkey=tmpdata.more;
			console.log(tmpdata);
			if(tmpdata.more==''){
				break;
			}
		}catch(e){
			console.log(e)
		}
		await sleep(awaitTime);
	}
	return data;
}
async function writeFile(filePath,message){//写入文件，自动换行
	var fs = require('fs'); 
	fs.writeFile(filePath, message+'\r\n', { 'flag': 'a' }, function(err) {
		if (err) {
			throw err;
		}
	})
}
function arrayToData(array,field){
	var message="";
	for(var i=0;i<array.length;i++){
		message+=array[i][field]+'\r\n'
	}
	return message;
}
(async () =>{
	try {
		var data=await getFullTableScope(tokenContract,tokenTable)//这里填写账户名、表名. You should fill in this fields with accounts name and table name;
		await writeFile('./airdrop_snapshots.txt',arrayToData(data,'scope'));
		console.log("Total accounts:"+data.length);
	} catch (e) {
		console.log(e);
	}
})();