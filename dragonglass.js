const fetch = require("node-fetch");

// remove special chars from id
const getTransactionId = (id)=>{ // id = transactionId eg: 0.0.88920@1594669895.221000000
    let transactionId = "";
    for(let i=0;i<id.length;i++){
        if(id[i]=='.' || id[i]=='@')continue;
        transactionId+=id[i];
    }
    return transactionId;
};

// consvert hex_string to string
function hexToString (hex) {
    let string = "";
    for (var i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
}

const getMessage = async (id)=>{
    try{
        const transactionId = getTransactionId(id);
        const url = `${process.env.DRAGONGLASS_URL}hcs/messages?transactionID=${transactionId}`; // send get request to get hedera messages

        // get our message
        const data = await fetch(url,{
            method:"get",
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json",
                "x-api-key":process.env.DRAGONGLASS_ACCESS_KEY
            }
        });

        const res = await data.json();
        let message = res.data[0].message;

        console.log("Hexstring:",message);
        message = hexToString(message);
        return message;

    }catch(e){
        console.log(e);
    }
};

module.exports = getMessage;

// (async()=>{
//     console.log((await getMessage("0.0.88920@1594669895.221000000")));
// })();
