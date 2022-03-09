const https = require("https");
const url = require('url');

module.exports = class HttpClient {
    //Origin: https://qq.com
    //DefaultRequestHeaders: { 'user-agent': 'curl/7.22.0', 'user-agent': 'curl/7.22.0' }
    constructor({ Origin = '', DefaultRequestHeaders = {}, Timeout = 60000 }) {
        this.Origin = Origin;
        this.DefaultRequestHeaders = DefaultRequestHeaders;
        this.Timeout = Timeout;
    }

    async SendAsync(url, method = "GET", headers = {}, postData = null) {
        const urlObj = new URL(url, this.Origin);
        for (var key in headers) {
            this.DefaultRequestHeaders[key] = headers[key];
        }

        const params = {
            method: method.toUpperCase(),
            host: urlObj.host,
            port: urlObj.port,
            path: urlObj.pathname,
            headers: this.DefaultRequestHeaders,
            timeout: this.Timeout,
        };
        return new Promise((resolve, reject) => {
            const req = https.request(params, res => {

                // Response object.
                let response = {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: []
                };

                res.on("data", chunk => {
                    response.body.push(chunk);
                });
                res.on("end", () => resolve(response));
            });
            req.on("error", reject);
            if (postData) {
                req.write(postData);
            }
            req.end();
        });
    }

    async GetStringAsync(url, headers = {}) {
        let rsp = await this.SendAsync(url, 'GET', headers);
        return rsp.body.join();
    }

    async PostAsync(url, headers = {}, postData = null) {
        return await this.SendAsync(url, 'POST', headers, postData);
    }

    ReadAsString(response) {
        return response.body.join();
    }

    ReadAsObj(response) {
        return JSON.parse(this.ReadAsString(response));
    }

    GetCookie(response) {
        return response.headers['set-cookie'].join(';');
    }

    SetCookieByStr(cookie) {
        this.DefaultRequestHeaders['Cookie'] = cookie;
    }

    SetCookieByRsp(response) {
        this.SetCookieByStr(this.GetCookie(response));
    }
};
