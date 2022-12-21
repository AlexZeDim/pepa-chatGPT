import { Client, Message } from 'discord.js';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import localeData from 'dayjs/plugin/localeData';
import locale_ru from 'dayjs/locale/ru';
import isBetween from 'dayjs/plugin/isBetween';

import {
  corpus,
  DiceInterface,
  PEPA_STORAGE_KEYS,
  PEPA_TRIGGER_FLAG,
  randInBetweenFloat,
  randInBetweenInt,
  weekdays,
} from '@app/shared';

@Injectable()
export class ChatService {
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
  ) { }

  initDayJs() {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(weekday);
    dayjs.extend(updateLocale);
    dayjs.extend(localeData);
    dayjs.extend(isBetween);

    dayjs.tz.setDefault('Europe/Moscow');

    dayjs.locale(locale_ru);

    dayjs.updateLocale('ru', { weekdays });
  }

  /**
   * @description Use random react with emojis between 1 and 5 reactions
   * @description for maximum user behavior
   */
  async chatPepeReaction (client: Client, message: Message, min: number, max: number) {
    const anchorRandomElement = randInBetweenInt(min, max);
    const rangeAnchorElement = randInBetweenInt(min, 4);
    const emojiPepeArrayId = await this.redisService.lrange(PEPA_STORAGE_KEYS.EMOJIS, (anchorRandomElement - rangeAnchorElement), anchorRandomElement);
    for (const emojiId of emojiPepeArrayId) {
      const emoji = await client.emojis.cache.get(emojiId);
      await message.react(emoji);
    }
  }

  /**
   * @description Don't to understand@feel it
   * @description This is vegas
   */
  async diceRollerFullHouse (
    isText: boolean = false,
    hasAttachment: boolean = false,
    isMentioned: boolean = false,
    isTest: boolean = false,
  ): Promise<DiceInterface> {
    try {
      const localTime = dayjs();
      const triggerChance = randInBetweenFloat(0, 1, 2);

      if (isTest) {
        return { flag: PEPA_TRIGGER_FLAG.TEST, context: `Привет, я Пепа` };
      }

      if (!isText && !hasAttachment && !isMentioned) {
        /**
         * @description DID YOU FORGET TO DEPLETE YOUR KEY?
         */
        if (localTime.weekday() === 1) {
          const [startJoinQueueMythicKey, endLeavePugsDepleteKey] = [
            localTime.hour(21).minute(0),
            localTime.hour(23).minute(59),
          ];

          const timeToDepleteKey = localTime.isBetween(startJoinQueueMythicKey, endLeavePugsDepleteKey);
          const isTimeToDepleteKey = !!await this.redisService.exists(PEPA_TRIGGER_FLAG.DEPLETE_MYTHIC_KEY);
          if (timeToDepleteKey && !isTimeToDepleteKey) {
            await this.redisService.set(PEPA_TRIGGER_FLAG.DEPLETE_MYTHIC_KEY, 1 , 'EX', 1000 * 60 * 60 * 6);
            // TODO add interaction
            return { flag: PEPA_TRIGGER_FLAG.DEPLETE_MYTHIC_KEY };
          }
        }
        /**
         * @description If Wednesday check once only!
         * @description GREAT LETTER DAY
         */
        if (localTime.weekday() === 2) {
          const [
            startLootClownChest, endLootClownChest,
            startAnyGoodLoot, endAnyGoodLoot
          ] = [
            localTime.hour(10).minute(0),
            localTime.hour(10).minute(20),
            localTime.hour(11).minute(0),
            localTime.hour(11).minute(59),
          ];

          const timeToLoot = localTime.isBetween(startLootClownChest, endLootClownChest);
          const isTimeToLootTriggered = !!await this.redisService.exists(PEPA_TRIGGER_FLAG.LOOT_CLOWN_CHEST);
          if (timeToLoot && isTimeToLootTriggered) {
            await this.redisService.set(PEPA_TRIGGER_FLAG.LOOT_CLOWN_CHEST, 1 , 'EX', 1000 * 60 * 60 * 2);
            const context = corpus.chest.map(phrase => phrase.random()).join(' ');
            return { flag: PEPA_TRIGGER_FLAG.LOOT_CLOWN_CHEST, context };
          }

          const anyGoodLoot = localTime.isBetween(startAnyGoodLoot, endAnyGoodLoot);
          const isTimeAnyGoodLootTriggered = !!await this.redisService.exists(PEPA_TRIGGER_FLAG.ANY_GOOD_LOOT);
          if (anyGoodLoot && !isTimeAnyGoodLootTriggered) {
            await this.redisService.set(PEPA_TRIGGER_FLAG.ANY_GOOD_LOOT, 1 , 'EX', 1000 * 60 * 60 * 2);
            const loot = corpus.loot.random();
            const context = loot.random();
            return { flag: PEPA_TRIGGER_FLAG.ANY_GOOD_LOOT, context };
          }
        }
        /**
         * @description Every Mon Tue Wed Thur
         * @description TIME TO RAID BABE @ YES HONEY!
         */
        if (localTime.weekday() < 4) {
          const [startRaidHoney, endRaidHoney] = [
            localTime.hour(20).minute(0),
            localTime.hour(23).minute(59),
          ];

          const raidTimeHoney = localTime.isBetween(startRaidHoney, endRaidHoney);
          const isTimeToRaidHoney = !!await this.redisService.exists(PEPA_TRIGGER_FLAG.TIME_TO_RAID_HONEY);
          if (raidTimeHoney && isTimeToRaidHoney) {
            const isRaidTriggerHappy = !!await this.redisService.exists(PEPA_TRIGGER_FLAG.RAID_TRIGGER_HAPPY);
            if (!isRaidTriggerHappy) return { flag: PEPA_TRIGGER_FLAG.RAID_TRIGGER_HAPPY };
          }

          if (raidTimeHoney && !isTimeToRaidHoney) {
            await this.redisService.set(PEPA_TRIGGER_FLAG.TIME_TO_RAID_HONEY, 1 , 'EX', 1000 * 60 * 60 * 4);

            const context = [];

            for (const [index, phrase] of corpus.raiding.entries()) {
              if (index === 4) {
                const elIndex = randInBetweenInt(1 , phrase.size);
                const raid = phrase.at(elIndex);
                const action = corpus.raiding.get(elIndex + 9).random();

                context.push(`${raid} ${action}`);
              }

              if (index > 4) break;

              context.push(phrase.random());
            }

            return { flag: PEPA_TRIGGER_FLAG.TIME_TO_RAID_HONEY, context: context.join(' ') };
          }
        }
      }

      if (!isText && hasAttachment && triggerChance > 0.70) {
        return { flag: PEPA_TRIGGER_FLAG.EMOJI };
      }

      if ((isText && triggerChance <= 0.12) || isMentioned) {
        return { flag: PEPA_TRIGGER_FLAG.MESSAGE };
      }

      if (isText && triggerChance >= 0.94) {
        return { flag: PEPA_TRIGGER_FLAG.EMOJI };
      }

      return { flag: PEPA_TRIGGER_FLAG.EMPTY };
    } catch (e) {
      console.log(e);
      return{ flag: PEPA_TRIGGER_FLAG.EMPTY };
    }
  }

  public whoAmIContext (authorName: string): string[] {
    return [
      `${authorName}: Тебя зовут Пепа.`,
      `Пепа: Меня зовут Пепа.`,
      `${authorName}: You like to play World of Warcraft for monk class.`,
      `Пепа: I like to play World of Warcraft for monk class.`,
      // `${authorName}: You like to push mythic plus, raid with friends and loot gear from weekly chests.`,
      // `Пепа: I like to push mythic plus, raid with friends and loot gear from weekly chest!`,
    ];
  }

  public didYouKnowThat (authorName: string): string[] {
    return [
      `${authorName}: Тебя зовут Пепа.`,
      `Пепа: Меня зовут Пепа.`,
      // `${authorName}: You like to play World of Warcraft for monk class.`,
      // `Пепа: I like to play World of Warcraft for monk class.`,
      // `${authorName}: You like to push mythic plus, raid with friends and loot gear from weekly chests.`,
      // `Пепа: I like to push mythic plus, raid with friends and loot gear from weekly chest!`,
    ];
  }

  public prepareChatText = (context: string): string => {
    let userPrettyText = context.replace(/\n/g, ' ').replace(/\\n/g, ' ');
    if (!userPrettyText.endsWith(".") || !userPrettyText.endsWith("?") || !userPrettyText.endsWith("!")) {
      userPrettyText = `${userPrettyText}.`
    }
    return userPrettyText;
  }
}
