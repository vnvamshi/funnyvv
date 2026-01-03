import CryptoJS from "crypto-js";
import { Token, Secret } from "@crmackey/fernet";



const keySize = import.meta.env.VITE_ENCRYPTION_KEYSIZE
//Key shared by service [SECRET_KEY,INITIALIZATION_VECTOR, MODE]
const key = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_ENCRYPTION_SECRET_KEY);
const iv = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_INITIALIZATION_VECTOR);
const mode = CryptoJS.mode.CBC;

const fileKey = import.meta.env.VITE_FILE_ENCRYPTION_SECRET_KEY;

const  isJsonString = (json:any) => {
  try {
      JSON.parse(json);
  } catch (e) {
      return false;
  }
  return true;
}

//Encrypt the given sting
export const encryptData = (encryptdata: any):any => {
  try {
    let data = encryptdata ? JSON.stringify(encryptdata) : '';
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      keySize: keySize,
      iv: iv,
      mode: mode,
    });
    return encrypted + "";
  } catch (err: any) {
    console.log('encryptData', err);
  }
};

//Decrypt the given sting
export const decryptData = (decryptdata: any):any => {
  try {
    let data = decryptdata ? decryptdata : '';
    const plainText = CryptoJS.AES.decrypt(data, key, {
      keySize: keySize,
      iv: iv,
      padding: CryptoJS.pad.Pkcs7
    });
    return JSON.parse(plainText.toString(CryptoJS.enc.Utf8));
  } catch (err: any) {
    console.log('decryptData', err);
  }
};

//Encrypt the Payload
export const encryptPayload = (payload: any):any => {
  try {
    // return { "data": encryptData(payload) };
    return payload;
  } catch (err: any) {
    console.log('encryptData', err);
  }
};


//Decrypt the Payload
export const decryptPayload = (response: any):any => {
  try {
    // return decryptData(response.data.data)
    return response.data;
  } catch (err: any) {
    console.log('decryptData', err);
  }
};

export const encryptFileData = (encryptdata: any):any => {
  try {

    // before creating a token, we must have a Secret()
    let secret = new Secret(fileKey);
    //Have to include time and iv to make it deterministic.
    //Normally time would default to (new Date()) and iv to something random.
    let token = new Token({
      secret: secret
    });
    return token.encode(encryptdata);

  } catch (err: any) {
    console.log('encryptFileData', err);
  }
};

export const decryptFileData = (decryptdata: any):any => {
  try {

    // before creating a token, we must have a Secret()
    let secret = new Secret(fileKey);
    //Have to include time and iv to make it deterministic.
    //Normally time would default to (new Date()) and iv to something random.
    let token = new Token({
      secret: secret,
      token: decryptdata,
      ttl: 0
    });
    return token.decode();
  } catch (err: any) {
    console.log('decryptFileData', err);
  }
};






