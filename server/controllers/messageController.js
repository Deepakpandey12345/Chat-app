

const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');

// SEND MESSSAGE
exports.sendMessage = async(req, res)=>{
    try{
        // REQUEST DATA
        const {message} = req.body;
        const {id : receiver} = req.params;
        const sender = req.user._id;
        // FIND CONVERSATION IN DBs
        let conversation =
            await Conversation.findOne({participants:{ $all: [receiver, sender]}});
        //  NO CONVERSATION -> CREATE ONE
        if(!conversation){
           conversation= await Conversation.create({participants: [receiver, sender]});
        }

        // CREATE MESSAGE
        const newMessage = await Message.create({sender, receiver, message})
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        // SOCKET IO IMPLEMENTATION


        //  save message in conversation DBs
        await conversation.save();
        //SEND RESPONSE
        res.status(201).json(newMessage);
    }catch (err){
        res.status(404).json({error: err.message});
    }
};

exports.getMessage = async (req, res )=>{
    try{
        //  REQUEST PARAMETER
        const {id: receiver} = req.params;
        const sender = req.user._id;
        //  FIND CONVERSATION AND POPULATE MESSAGE
        const conversation = await Conversation.findOne({participants: {$all :[receiver, sender]}}).populate('messages');

        // RETURN EMPTY CONVERSATION
        if(!conversation) res.status(200).json([]);
        res.status(200).json(conversation.messages);
    }catch(err){
        res.status(404).json({error: err.message});
    }
};