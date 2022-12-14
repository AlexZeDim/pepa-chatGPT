import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Client } from 'discord.js';
import { chromium, firefox } from 'playwright-extra'
import { setTimeout } from 'node:timers/promises';

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

    // Load the stealth plugin and use defaults (all tricks to hide playwright usage)
    // Note: playwright-extra is compatible with most puppeteer-extra plugins
    const stealth = require('puppeteer-extra-plugin-stealth')()

    // Add the plugin to playwright (any number of plugins can be added)
    chromium.use(stealth)

    // That's it, the rest is playwright usage as normal 😊
    chromium.launch({ headless: false }).then(async browser => {
      const page = await browser.newPage({
        serviceWorkers: "allow",
        extraHTTPHeaders: {
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "en-US,en;q=0.9",
          "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhbGV4emVkaW1AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJLWiJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItaW9SOHFKWmxtakpxcnlwQ21wcnExZk1FIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2Mzk1OWNmMWRhMGE5ZDNkNTdkOWM0ZmUiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2NzEwNDQxNDAsImV4cCI6MTY3MTA4NzM0MCwiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.1QevseaXLtBwQFkPMlZYH1vgXY9K8HTs-KKma_vrvLDoWOm9CSrtCD9Kwq5THtjUTtjDR7htrqq1s76lFxfDzzn8kWrnl0_ZekwWymIgmJu_Wp5yhXlmAgMlAq477pFDw-0zGUqiJtGOSCVyEXGBFnkYlX4SWxk_4aj6LVFsmc_NzxcFdKa8BhDPOEktegq9fEi0Rc3n9p_ohVwK_M0bFwDpU9BWEm2BAlNwSFUm-DKVf4JY9gHS6VMSffPYUYHNtr5FCLic9w5xVNshKA4bOxoahdQ1zLIdVSi8d-lg2ghmqSIEsJrgAB8q6QP9GfCBIiz0hrnsGBxQ0HvXJlv5Fg",
          "content-type": "application/json",
          "cookie": "cf_clearance=TjimrzAObOHpnUJP9vn4zdEKCHDRLwBGAi1NAK_u2gM-1671044123-0-1-1d486ff5.d6c481f7.f7f388fd-160; __Host-next-auth.csrf-token=74df784be72424850a7270d2c60c904ff6b154fdbece699ecdb24aa53fe00ece%7C41620db1fe540dae339be74515517822c1d20f574f3d61ad0a80dcf1a9da8f6b; __Secure-next-auth.callback-url=https%3A%2F%2Fchat.openai.com%2F; __cf_bm=Bg42RTQotk4_zlnhMoPErWHTdd7FbPT2kMk8Vg_7roo-1671045062-0-AVkP4VdABWiE5H8exHrDlkTWr56lYIMa7CGazDGIO4p8pb0vbS+rkcK/DrPFib9NIRSTBJ9oxE0tlXUdc0N+FvRTDXobzeBicJurFZoF/1Bl1FjiZLzIp1REbV0KvdwrfQcjhJof0CJVIblqYwas31v9KYY5NLs9pmz60MjtG4GQKz1grDWs1BoeggxWn8ih+w==; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..2MV6MeUAl8SNalVS.sHeD2m8cdCzZTSselG3Gz6UbA2q7o9VG9wZ_5IoIq-4JOu5srhPVQ_DHUSkq91aM1N5_Ow3G5j4ENBun7uNiBwXQ_zTsLfepBIIFe4QoSAoXw1tDJD6vPZG_K7-i-XuHHckKclw_zJu3IJ7akZuqHFpaiPTcdukxpMBR-X33GcZncVhggy-YTjnyoWHY310AOYrlxxsSQnQ-yiR57H7vx60e4kWbhlFn6uehXdYQ2Q7Fd3zWbL9Vwvu1s5QRf-HUGA7yJ8KJa_Sv4MPtIQ1SX2HmguevYgeE83Sx53SXoP---I8cpCcEEcPH2IarsPhmWR5S2iDktJ3svo01ctZWvcEi6jPV_B_ovCHqQPQ8R8iMHc6qdUT4Ydsiy5-gy25zEvzLrKYORy0TExCibPKc3eeePwsvryHhwubXxFz7MPM3r6ns_7FfVpEWMg3HTOTtXpC6BSGAvNvoxaC9fHVsu79OJwLB0bWdVIlBXu7TUGbHqedxukM72jwEiqluXLtWXP9f1mwIASfMcN4T-TSw3bccKZs259ZDU7q3Q0AJSdGb0TFgWLAfRlVelJ1btAKTb-yg6gJnkAkifZGB3B8cLerGB-n_I_Rh2eQdck6vI3mQQFTsTNbciLTQbaRNlShrfPyrj-sEBnE4d6Y1szeFqLky1s0_bSwfO21hdzL8TTxGx8yv2fFhJ_K_DEh5O9PI4w1bLl9ewXmL6JCdK7sneDOSuAghzl5z77kbubktepcTaalw5lnU6ccmzWq9qMfjvpXb1BRrJmYuqD5pLyk8G0MZMdtikoYPStz8NJ4DJc7UBAaypv6z3Qfhk00DItJiGjgQHllTtexdhen9o4BEOESr44dlXW2adXL24DtV1sdBDlwyBbtfo2E7hFue15hYYdnpySbDrcqQryP6x8_y8T4Vwfh8MQnr5N-uKO0r-SJOdOlVUbZJkJFIKh89KK2283phC_3JcPaLD0lgiK7AgHQ-3P6g5ByjM6M-C_EqlJ_YJKr6klX7tyUshm9YsN29kfeZYy4gblDTOctGBpkVPci1q6rHTqR34gDXfFEBLjUHXHys0CLm6G3ZfgKqpSVBAcTS9wMYe3OSsNdbI4CRrNVuXNJ34VOetaPh022tonbfgEQIlRtf_Jz8nvZitN44SUJK80afs3cvshV81KmD-7OnVtCtGo2-FaSFd4d459Z7kJ7SN8GMnab0MDFAkiy1mvyqAZIqHlD5RhgrdRDJNjNjsRsmjB4WQ3P7VpVmn0te-aC-senb-REyyywf-HEYnBbmosnVODR2qFxq7o_UnBG-faRZSRSrco6zVLbDWBCXtUbkjWtmvisXk7HjRMs3ulkmZViNnyM_8GsTSvWUvZRlGT6SrttByG-p_YkBvYypz8Bg_Y2B-bB9wt0RUmeNiyoZqotjamtX8wIMYc1JIpeXqhji4bAhbbtWgrwziUaCc13mwRSYIh2ZmvLm3TKouamRleucEA5Aysk2GC1S3iqac8Vrab-ct7WpfshkAF4KdfD3SRoMOyrFI_aTkaYVBJfmpz0qCp4os9WUKBTQYyAA4ge5E9xrxEd4Aw4Vlu0MX5L0OFWb0L_PE_EdOrILuNS0THzVJHr8O3lTmCe4Uo6rAG3bRyRuFgPGXUUr5eCpoyPxW2ody2rDJFy3MvAuqVE4PlPw_R1yrVMrnEhTmJeyVCeNBkcmed60sbVa6rva3TpUe8uDwa96o0ljuzIx7WFSPNPjC2Mx-4DmYTLfCCchVLCF7m8YNKcHgHHgZWT7JAur0ECOY_3PWwXYMSxXo_CfvVnpM_D12zjvMBHCacxa-pO9N94qNKlxH6L7uZYvWrwusNlYaZvFSk2J0oYtZefOQiRDW7OHBRtd3DSPFLtEISr1R7qSJnIPlHFE_FWVrGvUBkFz6dS46UmpURlPDMSz-eTqacW8bCKSD-HVRTo4G52XdyyidGZeDLpdY6iXxBSecIKT1rpkZBA41ZFKnFbZ5SiOIX2i9pwpJ44Tdgwpf2GMUYwxyTgYkidNiGbUp3C2k90_aqypOVfuvWS_LS9DAztzb_Yo0DaYEEwu_UlIl2lKBNjF3mI45pDAI6jv6oOg25ZjVQwyPYtw5ux5HMJ-zGUjzxNvHqfXHWuD8W-pHDENEmRLJYAzdrhgT7BEXsyaDYbcera8f_yg-Dpw75eWK3DFhpA3GrWx_Ho1TcsQzA1kYIZUwYuHdQRzOIicv3_nlHTwv-_0xZN49i7hWBoMNQ9bJrVwU2U3l1uBXDY4h_fnuevKmfb6ZRj9IZspQPRkZ1O78pUNCI-1B6wFErW8e5X3bLFEQv0s0XUScEsrQ6lMqNNHOT2XrDTbyQ.tF0yx0p438aNQbCJgT7zUA",
          "origin": "https://chat.openai.com",
          "referer": "https://chat.openai.com/chat",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
      })

      console.log('Testing the stealth plugin..')
      await page.goto('https://chat.openai.com/chat', { waitUntil: 'networkidle' })

      await setTimeout(30_000);

      await page.on('response', (page) => {
        const h = page.allHeaders();
        console.log(h);
      })

      console.log('All done, check the screenshot. ✨')
      // await browser.close()
    });

    /*const browser = await puppeteer
      .launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Mozilla Firefox\\Firefox.exe',
        ignoreHTTPSErrors: true,
        dumpio: false
      });

    puppeteer.use(StealthPlugin());
    puppeteer.use(
      AdblockerPlugin({
        // Optionally enable Cooperative Mode for several request interceptors
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
      })
    )

    const page = await browser.newPage();

    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 3000 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0)
    // Request intercept handler... will be triggered with
    // each page.goto() statement
    // Navigate, trigger the intercept, and resolve the response
    const response = await page.goto('https://chat.openai.com/chat');
    console.log('Visit page');
    console.log(response);

    const postData = {
      input: 'Got any creative ideas for a 10 year old’s birthday?',
      model: 'text-moderation-playground',
    }*/


/*
    page.once("request", async interceptedRequest => {
      console.log(interceptedRequest);
      await interceptedRequest.continue({
        method: "POST",
        postData: qs.stringify(postData),
        headers: {
          ...interceptedRequest.headers(),
          "Content-Type": "application/json",
          "Connection": "keep-alive",
          "Authorization": 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhbGV4emVkaW1AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJERSJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItaW9SOHFKWmxtakpxcnlwQ21wcnExZk1FIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2Mzk1OWNmMWRhMGE5ZDNkNTdkOWM0ZmUiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92…IjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.tkwXOIVKMDQWWKTucfEB9HVgPQ6ScaKs2ZJN8L1XVAUa0H7ZCXoworWqHscGZoiQmEMYHGX9RvmFiOdV9ZMfSBwfSbe6j85_5d9bZRhqlVG8UGxU15KxdbKqExF3I0aBNxpf9Oev9bwpAvsDICv4uX2XEejorxZTduuwyEmcJGENlImyWHKfa-XeMMs6lhZkLO3mErHyR3ZUwDqmIddXx2LVGao7kRYiRVhiTQQHACps-oDVvLGhM3Z-408z4nXvPbmQH3om74gcNSmaxepLiewwD02-Fpbo-3IMSi41fO3KqsrZiwRbAmLLHGDTj9gCT8gAGGI_SqAWkajOtSSOvg',
          "Cookie": 'intercom-session-dgkjq2bp=OUNXMkNvSXhaUmZwQ1FlbnZ6Y2VGTWgvR3Y0TTdaNndLL0RoYnFzd2UwNDJBeHlLN0ZhcVBkWUlreGNSMXBDRS0tYmU1bkFDUjRDWjE1T3N6T2FVWXQ0UT09--54e831e9c81ae6f8d6ec6c1fee8e5da88c1cf2e4; intercom-device-id-dgkjq2bp=f518b7e1-c42a-40c4-b6f2-0dacdde2e72c; __cf_bm=AaEx7ewf3lT.CMZ_KxaD7stbL2mCiwvi7yTCGjyvlOk-1671039691-0-Ab/0DsSAvpze9AXty1bmSQ4A79GJroo7Bho9d6m9gT5cxHc7fboRkvgI2n0kes0pUhYhWcw+LEfRMFzHHYhKjWnOBn0Fl/IWdPQawKVM5LR1SK1MjW+FelHxfMlGJ8hZz97toRDJorxox/mMOajrX35nF1VCG9pLO9MnggI/ZyMWEIzWphCDS/6bN0lz60nJYg==; cf_clearance=OVFOs16fzyO9yX0XKwrzxNtCtsbyf8P0fCqe5fgcRe4-1671037511-0-1-c20ebeb1.a7aa42af.b1dd9052-160; __Host-next-auth.csrf-token=2a4d64af269853597590bffdc2ba593a3b13cf595b53168d0148d917f88f297a%7C2264974722287057b62c3848d24c4cffd3ca8f36c30da5fc6486c64c2715f701; __Secure-next-auth.callback-url=https%3A%2F%2Fchat.openai.com%2F; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..D0Q-pHVAL9bQ-vdo.waIN-V2mD3V_6Y2MofZA-zvNprDFhIcjcgkAcH42gdO3kuY8jtuxmxkmMnLyB4LHd5QEeu0yYAaQL1dU8IZpsjgvXwHqXQ6HcLEBIv86ZxbjX1lCxQCsSjBc6b9g0sTxw3PaQFn9n54K99YnK3ZO0dKg6BDJqOlHA5y7CgXakGunWx2UKrfA6JgObVeB0E1NWA_QPTdTc6bNk6emvgzYm6TrGWE94HLRlzopz0-ylh6i9GLCcF-cwJOjroTGcAXxiMxOU00POF7_EQPpDLqN4hu3_HQv2Ol0RQcOCELH8D8btMHmWWlHjjmu1LwNUD74fsIp1RuCDpvSRzK70A_aHlCc3m5VBp6D0kfzVnW0ELu8HKHD3EhEqrHC1w6j1pDA5m8gJJeLpMQ2DVGDBblU2sy2-6iD9yZviQ8ESJB3h99Dls9aGtErUzbnxOTOkvKfP-UGJweAOX6lchWOX2Do3RThnB_0JR6qFaPN7d2MthqQ5ttDQZ8i6vtmQa9BfZhsiFz4Ktg4QtfK3NZ7hlbiXfhMH73lZzPrjnaXlqGxlpdoAS35X-wQhrpNe3AKWUOJ73jQXKOtAdpVb5sFJ-TCQR0q97x5EIWMWeP4Iq0EQ6EenzzYRfTOuhdsXjsX7o2zreKWgxgrchHgO3ZFCUtiNE-4VEBN_6nBRm6cWkfoekK4EfrnD-nydlmmHpLUWjrFVbnGgdPt0G4weFNTY-XZygxW2-0HaheetRkxawmyQ8WMfgy6WVOjDcL-hYsgD_EvPtu6GuG-2MgIc2FioV7_VUuV8MNJcnVuf708TCfReeb2yydErQ-EOSh0yJdGlOapBOq-EKIFrY5pD_pfr4MWpjFiuIJpXTtR9accmjeRPxXTPPOcknRLOcbHRdQXfpFORmLqLQutYYmBl1pqBj2UX0cfiFi8DTtYwi6XKyF3juQi92rfTYY1eePFvloYO7d3qGBpLXCQQbzllin1X03pUBR0Et1C0_6-BuQ2VkepumXxl40PGRqsHkYYd3nVQrPhX5M4EPo4S1423KrwEMQqGG4RfTsCF1PKW-YioEeHTlyW5i7hj-bYNkEdjDNzE_JZZ-CivJ27GfoNcLduUggMoVYebkKgVEwMFCpgoVmQ2PmiClC_zCfKG47t0CrtlFXRkiYAMEeYWOwCJjGETFb6GoR3-36NrSbW9v9HhGcprfgerlaoyEBJoG9WBis9_BIPp4Ad1zjCFyxq1MEu9kBX7EGpnIdXXK5q2Y_UKmtm3mtU9LkAAR1h5XxvoNScna7H5f-u6iKax57P8yTBtuW5dmIqhUu2Nv2qgqMlrSKeB0oMU3d3ktzH25FlfzrkC1n46ls0FJ6sDxdqtxaNASxUVn9APLqhUf4k7oyhvK76UeiLFXwNstcOZ0J_o0VSSQXSXb6nkmJGrJWTmP7VBgwAz53iXbFiOahRmLADvCyGq4fCuhhKkOIMa5906mmyuJ0VutCtX6_hhqzc5wF5BLs_BE2l2-RlBd-9e4WjvVqo0Q5Prv7AaFBzf0YBWLDkEh1ksP6JK5Ci9ZLNCg8G5tMbcM9MiA7tTuZutHkTLpqeNBdVkSadz61yLNKkSf9xIFEwNt5CN-1JidOzA4BGO9waYVvaBVE3NM-G0dyDVbpmUTgwVyMR1Mk17Krdssp8TdAsIsT9lQjjkotpX07X7mrONVE221fpiQQ_lSlaLZBbCg2yKLj7AzP20Gt8txVZBhLT5fe8nsWgCi7-T2J2DNz096F_7t9hQP0iHMlXQVKs3C0PPkmQxEFf4uBk96oFftmfp2kIyPg8mz3MaSxTezSe1X0qHMTw2ICzm5O3wnN65RD3VwyIn_8xntCT2Spki4UtgYW3sxKPVw9JUJT9uB7DfRRYAGr6D7XRXWc2yrGYzM7Vsx7IRaDiYdGP2X7hFoZONrfWeDkZg5c4HI7BuIeQz7HLsUFUv5g7xNiEaEPRU3CzKYZKezUDnSEJ6DQqP6iZ7hliudJvq_o2ZLWktzX5qYOsPB1q6lmSUCRK0OQIvhRt9Vcucf1r10laqyvIBqRNeXwP-5F0MTVjWFbw051gc2VC_h5aU9xYNFSWVbAfxolpZ3xIkWIbiCIihSii6xfP--aoYHWrl0n5qNafnXKmMQp6AO56TAP3IyekClNL0Ny3wydSlzEmxJppRkabieuTuJrHK1Gc0ZU7grD59cBkO-Fvd4mEmBl8XZWHyMAODmpkXCiWY0uxuD9NXfnPHppOw91sVu4POgRDpBe30DKqYuiOTX_sX32xS5W-PScz4ixuUy1msEAlSBCWSWBe6aACvkijPbL-CO42KgcNVUal7FVHUVWLgdAh_SY1bi_cnQ.I0I5exBAfSSknpLMdPp0jQ',
        }
      });

    });
*/

    // const responseBody = await response.text();
    // console.log(responseBody);

    // Close the browser - done!
    // await browser.close();

    /*
    console.log(process.env.SESSION_TOKEN, '\n',process.env.CLEARANCE_TOKEN);
    // use puppeteer to bypass cloudflare (headful because of captchas)
    const api = new ChatGPTAPI({
      sessionToken: process.env.SESSION_TOKEN,
      clearanceToken: process.env.CLEARANCE_TOKEN,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0'
    })

    await api.ensureAuth()*/
  }
}
