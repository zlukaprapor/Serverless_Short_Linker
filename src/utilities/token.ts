import * as jose from "jose";
import { createSecret, getSecret } from "./secret";

const ALG = "RSA-OAEP-256";

/**
 * Генерує токен шляхом шифрування об'єкта за допомогою отриманого публічного ключа.
 *
 * @param item Об'єкт, який потрібно зашифрувати
 * @returns Зашифрований токен
 */
export const genToken = async (item: Record<string, unknown>): Promise<string> => {
  try {
    // Отримання публічного ключа з сховища
    let _publicKey = await getSecret("PUBLIC_KEY");

    // Якщо публічний ключ відсутній, генеруємо нові ключі та зберігаємо їх
    if (!_publicKey) {
      const { publicKey, privateKey } = await jose.generateKeyPair(ALG);

      const pkcs8Pem = await jose.exportPKCS8(privateKey);
      const spkiPem = await jose.exportSPKI(publicKey);

      await createSecret("PRIVATE_KEY", pkcs8Pem);
      await createSecret("PUBLIC_KEY", spkiPem);
    }

    // Отримання публічного ключа після його збереження
    _publicKey = await getSecret("PUBLIC_KEY");

    // Імпортування та використання публічного ключа для шифрування токену
    const publicKeyLike = await jose.importSPKI(_publicKey as string, ALG);

    return await new jose.CompactEncrypt(new TextEncoder().encode(JSON.stringify(item)))
        .setProtectedHeader({ alg: ALG, enc: "A256GCM" })
        .encrypt(publicKeyLike);
  } catch (error) {
    throw error;
  }
};

/**
 * Розшифровує токен за допомогою приватного ключа.
 *
 * @param token Зашифрований токен для розшифрування
 * @returns Розшифрований текст
 */
export const decryptToken = async (token: string): Promise<string> => {
  try {
    // Отримання приватного ключа з сховища
    const _privateKey = await getSecret("PRIVATE_KEY");
    const privateKeyLike = await jose.importPKCS8(_privateKey as string, ALG);

    // Розшифрування токену за допомогою приватного ключа
    const decryptResult = await jose.compactDecrypt(token, privateKeyLike);


    return new TextDecoder().decode(decryptResult.plaintext);
  } catch (error) {
    throw error;
  }
};