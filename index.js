const HttpClient = require('./HttpClient')
const { sendMsg } = require("./sendMsg"); //发送通知

const A_JSON = process.env.A_JSON;

const client = new HttpClient({
    Origin: 'http://he.sx.chinamobile.com',
    DefaultRequestHeaders: {},
    Timeout: 5000
});

main();

async function main() {
    await setCookie();
    let signMsg = await sign();
    let coinMsg = await goldCoinReceive();
    let msg = `山西移动-签到:${signMsg};收金币:${coinMsg}`;
    sendMsg(msg, '');
    console.log(msg);
}

async function sign() {
    //签到前必须要先查询一次，否则签到会失败：签到请求异常
    await client.PostAsync('h/rest/v1/sign/signQuery', { 'Content-Type': 'application/json;charset=UTF-8' }, `{"channel":"heapp"}`);
    let rsp = await client.PostAsync('h/rest/v1/sign/sign', { 'Content-Type': 'application/json;charset=UTF-8' }, `{"channel":"heapp"}`);
    let obj = client.ReadAsObj(rsp);
    console.dir(obj);

    let msg;
    if (obj.retCode == 0) {
        msg = `成功`;
    } else {
        msg = `失败:${obj.retMsg}`;
    }
    return msg;
}

async function goldCoinReceive() {
    let rsp = await client.PostAsync('h/rest/v1/activity/goldCoinReceive', { 'Content-Type': 'application/json;charset=UTF-8' }, `{}`);
    let obj = client.ReadAsObj(rsp);
    console.dir(obj);

    let msg;
    if (obj.retCode == 0) {
        msg = obj.data.receiveNum;
    } else {
        msg = obj.retMsg;
    }
    return msg;
}

async function setCookie() {
    let rsp = await client.PostAsync('h/home/rest/v1/l/a', { 'Content-Type': 'application/json;charset=UTF-8' }, A_JSON);
    client.SetCookieByRsp(rsp);
}