
const express = require("express");
const app = express();
require("dotenv").config();
const op = require("./hedera");
var multer  = require("multer");
var upload = multer();
const hash = require("./hash");
const getMessage = require("./dragonglass");


app.use(express.json());

app.post("/upload",upload.single("file"),async (req,res)=>{
    
    const buffer = req.file.buffer;

    const fileHash = hash(buffer);
    const message = {
        hash:fileHash,
        bucket:process.env.BUCKET_NAME,
        location:"file_url" // file location
    };
    const jsonMessage = JSON.stringify(message);
    const info = await op.submitMessage(jsonMessage,"Memo");
    info.fileHash = fileHash;
    res.send(info);
});

app.post("/get-info",async (req,res)=>{
    const id = req.body.transactionId;
    const message = await getMessage(id);
    res.send(message);
});




app.listen(3000,()=>{
    console.log("Started");
});
































// (async function() {
// console.log("balance before transfer:", (await new AccountBalanceQuery().setAccountId(operatorAccountId).execute(client)));

//     const receipt = await (await new CryptoTransferTransaction()
//         .addSender(operatorAccountId, 3)
//         .addRecipient("0.0.3", 3)
//         .setTransactionMemo("sdk example")
//         .execute(client))
//         .getReceipt(client);

//     console.log(receipt);
//     console.log("balance after transfer:", (await new AccountBalanceQuery().setAccountId(operatorAccountId).execute(client)));
// })();