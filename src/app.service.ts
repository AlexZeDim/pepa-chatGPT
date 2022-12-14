import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ButtonStyle, GatewayIntentBits, Routes } from 'discord-api-types/v10';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Client } from 'discord.js';


@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name, { timestamp: true });
  private client: Client;

  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
  ) {
  }

  async onApplicationBootstrap() {
    await this.test();
  }

  async test() {
     console.log(process.env.OPENAI_EMAIL, process.env.OPENAI_PASSWORD);
    // use puppeteer to bypass cloudflare (headful because of captchas)
    // To use ESM in CommonJS, you can use a dynamic import
    const { ChatGPTAPI, getOpenAIAuth } = await import('chatgpt')

    const openAIAuth = await getOpenAIAuth({
      email: process.env.OPENAI_EMAIL,
      password: process.env.OPENAI_PASSWORD
    })

    const api = new ChatGPTAPI({ ...openAIAuth })
    await api.ensureAuth()

    const response = await api.sendMessage('Hello World!')
    console.log(response)
  }
}
