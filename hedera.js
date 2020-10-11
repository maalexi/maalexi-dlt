// require("dotenv").config();
const {
    Client,
    MirrorClient,
    MirrorConsensusTopicQuery,
    ConsensusTopicCreateTransaction,
    ConsensusMessageSubmitTransaction,
    TransactionId,
    Ed25519PrivateKey,    
} = require("@hashgraph/sdk");


const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY); // or use process.env.OPERATOR_KEY (must not share)
const operatorAccount = process.env.OPERATOR_ID; // account id
const node = process.env.NODE_ID; // choose some mainnet node
const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;  // mirror node address
const topicId = process.env.TOPIC_ID; // all invoices to this topic

const client = Client.forTestnet();
client.setOperator(operatorAccount,operatorPrivateKey);
// client.replaceNodes([node,port]);


// create topic
const createTopic = async ()=>{
    try{ 
        const transactionId = await new ConsensusTopicCreateTransaction().execute(client);
        const transactionReceipt = await transactionId.getReceipt(client);
        const topicId = transactionReceipt.getConsensusTopicId();
        return topicId;
    }catch(e){
        console.log(e);
    }
};

const submitMessage = async (message,memo)=>{
    try{
        const consensusClient = new MirrorClient(mirrorNodeAddress); // create mirror client

        // setting the mirror node to recieve messages from this topic
        new MirrorConsensusTopicQuery()
        .setTopicId(topicId)
        .subscribe(
        consensusClient,
        (msg) => console.log(msg.toString()), // prints when mirror node recieves our message
        (error) => {
            // console.log(error);
            throw new Error("Internal Error");
        }
        );
    
        //this will be our transactionId
        const transactionId = new TransactionId(operatorAccount);

        // message must be string or JSON(may be)
        new ConsensusMessageSubmitTransaction()
        .setTransactionId(transactionId)
        .setTopicId(topicId)
        .setNodeAccountId(node)
        .setMessage(message)
        .setTransactionMemo(memo) // memo would be file name
        .execute(client);

        // contains all the info
        const record = await transactionId.getRecord(client);
        const receipt = await transactionId.getReceipt(client);

        //info we need to show to customer
        const info = {
            status:record.receipt.status.toString(), // SUCCESS
            consensusTopicRunningHash:Buffer.from(receipt.getConsensusTopicRunningHash()).toString("hex"),
            consensusTopicSequenceNumber:receipt.getConsensusTopicSequenceNumber(),
            transactionHash:Buffer.from(record.transactionHash).toString("hex"),
            consensusTimestamp:new Date(record.consensusTimestamp.seconds*1000).toString(), // ignore nano_seconds
            transactionId:record.transactionId.toString(),
            transactionMemo:record.transactionMemo,
            topicId:topicId,
            transactionFee:record.transactionFee.toString(), // hbars debited for submitting this message
                                                  // distributed amongst mirror and mainnet node
        };
        
        // console.log(info);
        return info;
    }catch(e){
        console.log(e);
    }
};


module.exports = {
    submitMessage,
    createTopic
};


























