import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { GatewayIntentBits } from 'discord-api-types/v10';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Client, Events, Message, Partials } from 'discord.js';

import * as process from 'process';
import { chatQueue, OPENAI_MODEL_ENGINE, randInBetweenInt } from '@app/shared';
import { BullQueueInject } from '@anchan828/nest-bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name, { timestamp: true });
  private client: Client;

  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @BullQueueInject(chatQueue.name)
    private readonly queue: Queue<Message, void>,
  ) {
  }

  async onApplicationBootstrap() {
    this.client = new Client({
      partials: [Partials.User, Partials.Channel, Partials.GuildMember],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
      },
    });

    await this.loadBot();

    await this.bot();

    // await this.test();
  }

  async loadBot() {
    await this.client.login(process.env.DISCORD_TOKEN);
  }

  async bot() {
    this.client.on(Events.ClientReady, async () =>
      this.logger.log(`Logged in as ${this.client.user.tag}!`),
    );

    this.client.on(Events.MessageCreate, async (message) => {
      this.logger.log(`Event: ${Events.MessageCreate} has been triggered by: ${message.id}`);
      if (message.content) await this.queue.add(message.id, message,{ jobId: message.id });
    });
  }

  async test() {
    /*const { data } = await this.chatEngine.createCompletion({
      model: OPENAI_MODEL_ENGINE.ChatGPT3,
      prompt: ["You: Привет, ты играешь в World of Warcraft?"],
      temperature: 0.5,
      max_tokens: randInBetweenInt(60, 999),
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stop: ["You:"],
    });

    console.log(data);
    const [choice] = data.choices;

    const response = await this.chatEngine.createCompletion({
      model: OPENAI_MODEL_ENGINE.ChatGPT3,
      // "You: What have you been up to?\nFriend: Watching old movies.\nYou: Did you watch anything interesting?\nFriend:"
      prompt: [`You: Привет, ты играешь в World of Warcraft?`, choice.text, `You: Здорово, я люблю играть на монахе, а ты?`],
      temperature: 0.5,
      max_tokens: randInBetweenInt(60, 999),
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stop: ["You:"],
    });

    console.log(response.data);*/
    await this.redisService.sadd('1', 1, 2);

    const a = await this.redisService.smembers('1');

    const e = !!await this.redisService.exists('1');
    const e1 = !!await this.redisService.exists('2');

    console.log(e, e1);
  }
}
