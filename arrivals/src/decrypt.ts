// Based on https://github.com/mprimi/portable-secret

type SecretConfig = {
  saltSize: number,
  blockSize: number,
  keySize: number,
  iterations: number,
  saltHex: string,
  ivHex: string,
  cipherHex: string
}

// Invoked when the 'Decrypt' button is pressed
export async function decrypt(secretConfig: SecretConfig, passwordInput: string): Promise<string> {
  try {
    setMessage("Generating key from password...")

    // Load salt, convert hex string to byte array
    let salt = hexStringToBytes(secretConfig.saltHex)
    if (salt.length != secretConfig.saltSize) {
      throw new Error(`Unexpected salt size: ${salt.length}`)
    }

    // Load IV, convert hex string to byte array
    let iv = hexStringToBytes(secretConfig.ivHex)
    if (iv.length != secretConfig.blockSize) {
      throw new Error(`Unexpected IV size: ${iv.length}`)
    }

    // Load password, as byte array
    console.log(passwordInput)
    let password = new TextEncoder().encode(passwordInput)
    if (password.length == 0) {
      throw new Error(`Empty password`)
    }

    // Wrap password into a Key object, as required by cryptography APIs
    let passwordKey = await window.crypto.subtle.importKey(
      "raw", // Array of bytes
      password,
      { name: "PBKDF2" }, // What algorithm uses the key
      false, // Cannot be extracted
      ["deriveKey"] // What the key is used for
    )

    // Derive a key from the password, using PBKDF2
    let key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2", // https://en.wikipedia.org/wiki/PBKDF2
        salt: salt,
        iterations: secretConfig.iterations,
        hash: "SHA-1", // As per standard v2.0
      },
      passwordKey, // Wrapped password
      {
        name: "AES-GCM", // What algorithm uses the key
        length: secretConfig.keySize * 8, // Key bitsize
      },
      false, // Cannot be extracted
      ["decrypt"] // What the derived key is used for
    )

    setMessage("Decrypting...")

    // Load ciphertext, convert hex string to byte array
    let cipher = hexStringToBytes(secretConfig.cipherHex)

    // Decrypt with AES-GCM
    // https://en.wikipedia.org/wiki/Galois/Counter_Mode
    let decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM", // Name of block cipher algorithm
        iv: iv, // Initialization vector
      },
      key, // Derived key
      cipher // Ciphertext
    )

    // Remove padding (added as necessary for block cipher)
    // https://en.wikipedia.org/wiki/Padding_(cryptography)#PKCS#5_and_PKCS#7
    let decrypted = removePadding(new Uint8Array(decryptedBuffer))

    let plainText = new TextDecoder().decode(decrypted)
    return plainText;
  } catch (err) {
    console.error(JSON.stringify(err));
    // TODO better handle failing promises
    setMessage(`Decryption failed: ${err}`)
    return
  }
}

// Transform hexadecimal string to Uint8Array
function hexStringToBytes(input) {
  for (var bytes = [], c = 0; c < input.length; c += 2) {
    bytes.push(parseInt(input.substr(c, 2), 16));
  }
  return Uint8Array.from(bytes);
}

// The cleartext input must be padded to a multiple of the block size
// for encryption. This function removes the padding, expected to be
// compatible with PKCS#7 described in RFC 5652.
// https://en.wikipedia.org/wiki/Padding_(cryptography)#PKCS#5_and_PKCS#7
function removePadding(input) {
  // Last byte is the amount of padding
  let padAmount = input[input.length - 1]
  let unpaddedSize = input.length - padAmount
  return input.slice(0, unpaddedSize)
}

// Update page with status of decryption
function setMessage(msg) {
  console.log(msg)
}


