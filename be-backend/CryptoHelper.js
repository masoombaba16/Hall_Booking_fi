const crypto = require('crypto');
require('dotenv').config();

// Retrieve the secret key and algorithm from environment variables
const secretKey = process.env.SECRET_KEY;  // Make sure this key is set in .env file
const algorithm = process.env.ALGORITHM || 'aes-256-cbc';  // Default to 'aes-256-cbc'

// Create the key for AES
const key = crypto.createHash('sha256').update(secretKey).digest();  // Use the hashed key for AES

// Encryption function
// Encryption function
const encrypt = (text) => {
    if (!text || text.trim() === "") {
        throw new Error("Text cannot be empty.");
    }
    
    const iv = crypto.randomBytes(16);  // AES block size is 16 bytes
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return both encrypted content and IV (in hex format)
    return { encryptedContent: encrypted, iv: iv.toString('hex') };
};



// Decryption function
// Decryption function
const decrypt = (iv, encryptedText) => {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};


module.exports = { encrypt, decrypt };
