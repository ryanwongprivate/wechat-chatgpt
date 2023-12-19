import { WechatyBuilder } from "wechaty";
import QRCode from "qrcode";
import { ChatGPTBot } from "./bot.js";
import {config} from "./config.js";
const chatGPTBot = new ChatGPTBot();

const name = 'wechat-assistant';
let padLocalToken = '' // 如果申请了ipadlocal的token,可以直接填入

console.log('读取到ipad token 使用ipad协议启动');
const bot = WechatyBuilder.build({
    name, // generate xxxx.memory-card.json and save login data for the next login
    puppetOptions: {
        token: padLocalToken
    }, puppet: 'wechaty-puppet-padlocal',
});

async function main() {
  const initializedAt = Date.now()
  bot
    .on("scan", async (qrcode, status) => {
      //const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      const url = ['https://api.qrserver.com/v1/create-qr-code/?data=',encodeURIComponent(qrcode)].join('')
      console.log(`Scan QR Code to login: ${status}\n${url}`);
    })
    .on("login", async (user) => {
      chatGPTBot.setBotName(user.name());
      console.log(`User ${user} logged in`);
      console.log(`私聊触发关键词: ${config.chatPrivateTriggerKeyword}`);
      console.log(`已设置 ${config.blockWords.length} 个聊天关键词屏蔽. ${config.blockWords}`);
      console.log(`已设置 ${config.chatgptBlockWords.length} 个ChatGPT回复关键词屏蔽. ${config.chatgptBlockWords}`);
    })
    .on("message", async (message) => {
      if (message.date().getTime() < initializedAt) {
        return;
      }
      if (message.text().startsWith("/ping")) {
        await message.say("pong");
        return;
      }
      try {
        await chatGPTBot.onMessage(message);
      } catch (e) {
        console.error(e);
      }
    });
  try {
    await bot.start();
  } catch (e) {
    console.error(
      `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
    );
  }
}
main();
