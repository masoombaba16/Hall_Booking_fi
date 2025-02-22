const { encrypt, decrypt } = require('../CryptoHelper');

function getFormattedTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
const createThread = async (sender, receiver, messageCollections) => {
    const threadId = `${sender}-${receiver}-${new Date().getTime()}`;
    await messageCollections.insertOne({
        sender,
        receiver,
        threadId,
        messages: [] 
    });
    return threadId;
};
const sendMessage = async ({ sender, sentby, receiver, content, messageCollections, clubname }) => {
    if (!content || content.trim() === "") {
        throw new Error("Message content cannot be empty.");
    }

    // Encrypt the content
    const { encryptedContent, iv } = encrypt(content);

    // If the message is sent by the club itself, set 'sentby' as the club's username (clubname)
    const senderUsername = sentby || clubname;  // Use 'clubname' if 'sentby' is not provided
    const message = {
        sender,
        sentby: senderUsername,  // Set 'sentby' as the club's username when it's a club
        receiver,
        content: encryptedContent, // Store encrypted content
        iv, // Store the IV for decryption
        timestamp: getFormattedTimestamp(),
        status: "unread",
    };

    // Push the message to the messages array in the receiver's document
    const result = await messageCollections.updateOne(
        { username: sender }, // Locate the receiver's document
        { $push: { messages: message } }, // Push the message into the messages array
        { upsert: true } // Create the document if it doesn't exist
    );

    // Check if the update was successful
    if (result.modifiedCount === 0 && !result.upsertedId) {
        throw new Error("Failed to send message. Please try again.");
    }

    return {
        message: "Message sent successfully.",
        data: { ...message, content }, // Return original content for confirmation
    };
};

async function getMessages({ sender, receiver }, messageCollections) {
    try {
        const [senderDoc, receiverDoc] = await Promise.all([
            messageCollections.findOne({ username: sender }),
            messageCollections.findOne({ username: receiver }),
        ]);

        const allMessages = [
            ...(senderDoc?.messages || []),
            ...(receiverDoc?.messages || []),
        ];

        const filteredMessages = allMessages.filter(
            msg =>
                (msg.sender === sender && msg.receiver === receiver) ||
                (msg.sender === receiver && msg.receiver === sender)
        );
        if (filteredMessages.length === 0) {
            return { message: `No messages found between ${sender} and ${receiver}`, messages: [] };
        }

        filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const decryptedMessages = filteredMessages.map(msg => {
            if (!msg.iv || !msg.content) {
                return { ...msg, content: "Invalid message content" };
            }

            try {
                const decryptedContent = decrypt(msg.iv, msg.content);
                return { ...msg, content: decryptedContent };
            } catch (error) {
                console.error("Decryption error:", error);
                return { ...msg, content: "Failed to decrypt message" };
            }
        });

        return {
            message: `Messages retrieved successfully between ${sender} and ${receiver}`,
            messages: decryptedMessages,
        };
    } catch (error) {
        console.error("Error in getMessages:", error);
        throw new Error(`Error retrieving messages: ${error.message}`);
    }
}

module.exports={getMessages,sendMessage,createThread}