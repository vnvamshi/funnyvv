import { encryptData, decryptData } from "./crypto-helpers";
const Storage = {

    add(key: string, value: any) {
        if (value !== '') {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }
        return false;
    },
    remove(key: string) {
        if (Storage.get(key)) {
            localStorage.removeItem(key);
            return true;
        }
        return false;
    },
    get(key: string) {
        if (key !== '') {
            let stored = localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : false;
        }
        return false;
    },
    removeAll() {
        localStorage.clear();
        return true;
    }

};

export const CryptoStorage = {

    add(key: string, value: any) {
        if (value !== '') {
            value = encryptData(value);
            localStorage.setItem(key, value);
            return true;
        }
        return false;
    },
    remove(key: string) {
        let stored = localStorage.getItem(key);
        if (stored) {
            localStorage.removeItem(key);
            return true;
        }
        return false;
    },
    get(key: string) {
        if (key !== '') {
            let stored = localStorage.getItem(key);
            return stored !== null ? decryptData(stored) : false;
        }
        return false;
    },
    removeAll() {
        localStorage.clear();
        return true;
    }

};
export default Storage;