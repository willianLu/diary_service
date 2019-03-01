import crypto from 'crypto';

class Token {
    key: '68star.cn';
    iv = '';

    ParseToken(token: string) {
        var desToken = this.decryption(token);
        var arr = desToken.split('|');
        if (arr.length == 4) {

            return { AccessToken: arr[0], UserId: arr[1], lastTime: new Date(parseInt(arr[2])), expires: (arr[3] == "0" ? undefined : new Date(parseInt(arr[3]))) }
        }
        return undefined;
    }

    CreateToken(userId: string, openId: string, createTime: Date, expires: Date | undefined): string {
        let signToken = [userId, openId, createTime.getTime(), expires && expires.getTime() || 0].join('|');
        return this.encryption(signToken);
    }

    private encryption(data: string) {
        let cipherChunks = [];
        let cipher = crypto.createCipheriv('aes-128-ecb', this.key, this.iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
        cipherChunks.push(cipher.final('base64'));
        return cipherChunks.join('');
    }

    private decryption(data: string) {
        let cipherChunks = [];
        let decipher = crypto.createDecipheriv('aes-128-ecb', this.key, this.iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        return cipherChunks.join('');
    }
}

export default new Token();