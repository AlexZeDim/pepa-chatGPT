import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Client } from 'discord.js';
import { chromium, firefox } from 'playwright-extra'
import { setTimeout } from 'node:timers/promises';
import qs from 'qs';

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

    const header = {
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9",
      "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhbGV4emVkaW1AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJLWiJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItaW9SOHFKWmxtakpxcnlwQ21wcnExZk1FIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2Mzk1OWNmMWRhMGE5ZDNkNTdkOWM0ZmUiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2NzEwNDQxNDAsImV4cCI6MTY3MTA4NzM0MCwiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.1QevseaXLtBwQFkPMlZYH1vgXY9K8HTs-KKma_vrvLDoWOm9CSrtCD9Kwq5THtjUTtjDR7htrqq1s76lFxfDzzn8kWrnl0_ZekwWymIgmJu_Wp5yhXlmAgMlAq477pFDw-0zGUqiJtGOSCVyEXGBFnkYlX4SWxk_4aj6LVFsmc_NzxcFdKa8BhDPOEktegq9fEi0Rc3n9p_ohVwK_M0bFwDpU9BWEm2BAlNwSFUm-DKVf4JY9gHS6VMSffPYUYHNtr5FCLic9w5xVNshKA4bOxoahdQ1zLIdVSi8d-lg2ghmqSIEsJrgAB8q6QP9GfCBIiz0hrnsGBxQ0HvXJlv5Fg",
      "content-type": "application/json",
      "cookie": "cf_clearance=TjimrzAObOHpnUJP9vn4zdEKCHDRLwBGAi1NAK_u2gM-1671044123-0-1-1d486ff5.d6c481f7.f7f388fd-160; __Host-next-auth.csrf-token=74df784be72424850a7270d2c60c904ff6b154fdbece699ecdb24aa53fe00ece|41620db1fe540dae339be74515517822c1d20f574f3d61ad0a80dcf1a9da8f6b; __Secure-next-auth.callback-url=https://chat.openai.com/; __cf_bm=x_ExE0gtQ_ClITBJE7KjmEQB78hZ9zZbd6qjndrf5w0-1671046185-0-AWJn579jZS1CriHkZwI9GhRSh/Wk/VujQK/nbCZgttZZp7zrzZbjJCkbSq2E76T/7q6HR28FmLbt99kxWUx/MHRGnh+ehTu2lXktMwfneh92RWH9hcX4jTLBXdikAWMAYh3N0J8y09vDkwrT11W05izQCu/5IJrojVV1+04nUkDEQj+Rw9/HOvgGvRgMYktR8A==; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ytwLWtPvgPayFlV-.j3lZgREJQDEnHF2TkOrucUB_s98LP_L8S5hc6xiZna_Uphtx2ow7kzBtV-tZkMsW6IUlohEsHsyl1GS-xpOzYGu7T754jUDpAMr2fqcxfq6C9_uBTW_BIsSA8NXlArtAQm5OOeC1rloaJ6JcNhT8Wyr0OPaTJdr7uXbiJ7I3D2uLMq3xqeljgWnv_qCbQLxhv9nrUEJmXO_My6yBVPxVFj7E5pAzjiXuOWLuJw9NG7hDHpc6iVP125ujaewwArCOcj9CPgGneJ3_iYyDSCo5eNUQ2gSyQSvauPP4Fwp0mwremdwJjLkKrOPKMCmRE2Db3xmcDxNUHgIhMNapeVJDp8-3vyecefSKayIb_Jl5BZrXki4e-blHT0uwMSwoCDjSaVhSMk3jy82JkpCbXN0nL9p0_i3VsBc3nAhHxxHWgdvbJxOAO85vqFsWlqHmn6sCVbd_lSVwCuex5lzIXPJ9JrQjLJ88O2zwM-ytvDo32WirsGTuUVvgK1Tm7E36NiHuDVJFlwxQN_ajsAvtCAkvbDMYlT5Onv6uXXrMSQbpdw_q4O1MfE8YGxD2pXHJa-Ah3Xdh9Ch4go79OF_D4q76Cjx8M7IRgIZI6LG6Y-oNIVBUJSPTNk4jf09qHobzsfvgndkE_gD68SDfDVHiMKpkkt4WivnDZHkst7aJtUsDEsbPIRdyQQvH_MJL9ls2Z3yVIpNxnIH4KjhE7QHcw4cLn2Xxg_ySTVmYJyZhPOyaz6aghOFJ44H1WSs3fAMs1zXI0WGj16nvN2pXcNlF6n91hfi1rcce6R--EIBPxyrsDZAyTdGIQrwHuAZxNIqESmpHhTnQ0Of8pVNUDO3OEYhkAKeyuy4kLzalMUWqPsvp_SLbODAA29Fpwi0N3Ij8UFEOokT1h9_xhWH3_x9W_x7shqWMh7m9TH17a7ZhOErertaBat2-0lkaNSAzJffP4NSctx5vcQ13c2QjAJ6ej1-ITKWglE1UUGW79GgbLtI2IgIty9zJFjv5Se8APoGMUnoIWrEcmuzDWKk0Gv5GCdqCTCTnkqHO7Q5bdf7ssG0yZYcbL-GsLD37XtPfzNmcYyVTH_A7otWjZRfpEmmmnDPUrjllJcjMFACt_R3BJtNfPUDtLAR8ka3wnaF5MeS-VNc0LRAXhWKnqP2xH_L8jCcLbF1zZfmDLm9GugSZmxW1JmF8DvFEvKRv7dIXIdr3zyFCWmjfxAe_kSTxRkMdKz_64coD2JQv7B052w023pRtGEyXbh56RJTfOLyAjHCsoLXW94yCnuMMxKJOXZjdukitOJA1gzt4UngwRmPrhZpRdGBRS9NPYSxvd2n0zXKdhv3WV-k9E8WbY7VjGLz3WGN-5fg2Ck4jwtmDnnuNlkh58hrunbgjqqeQeG9n3xZpJsNe4Nd3ZfpzSaRn4grwHZoX9jyVc0cK_E__b19vkIxsvh_vEXJCdQryueqtHajGbtW6XLWMcJt38DLf0TJRrmTyxDWw5uO1f6HP55FcX6h2Ho48efS25YEio7kgT1e57uR-UnnSwuq2uVyq3a7knmtyvqKvzZnx_v0LWbt7mCQsm3zVyqv5owYx1Ny0y7FR1Yzj4PKehtU-Oh3pUe3phGuetx8yI_dqgcE1tY01E8F0OwCec4CTooNfByeUiJrZy71lN61wZehWm9GTuLGVd88WXMemuDI1pbkQjFHedX19A7ecGyVaBZ5DdoX0hiKvzU1lsIUhtxS3fnZJTkM31CmQw9NmzzaSSrAQ-DY6MqYBtWcX6K71c5tcq21A3j8tmJ5JZc4uZ5xuOFss9-SxrSkLe76M73wCQaqurni9ziP2lkN4DG0jVHeZVTx_q1-1hfJynEL89pqAEO3RYqS7FVt1pw8uEA4bkeYznbigQW5iSSMF0AvDCBCpuJLA-FSsFerCFKETIJ4CKnShRfbXFm16l6UNKaSxs6zBg8DYfY70CipFlBYFMty2d_4Nv1tkOc-tiXsUOxZ2Coi-aYUMNQh59mhUmslf4MmiO3nTFtFvSHx82qJU-r9OmDW2NdY7fYUmkDuQqjpOnrL4jQSF7Urxe1z5EBSnuWUoA-VRrbzBtlOwvimYdobdSonf7XsY2Dqe2YgBIZYartlpTgJVY6KYpEFeM19tXqunLScwdcRdfGUFYbV1Bf2mKeBLsXA0s-fn95gN_1JhAPSkmEQ8BRuWk5dAXHkW-Zv5FdidF9FOSv3ukxgPc1qZfNHtGnmxyp8ZZTwwYCqPlaEjnzEzAtb4mjnV8HKy4VaXKqOKXks4NqmdyzmJQQeQyWxL4M3JWmXSos6Mrd1cLZmETtxGeuUFFoGiA_sRe_I0pIzk7Pxfkw.Nn6N7BDh38giGnNOROBRcg",
      "origin": "https://chat.openai.com",
      "referer": "https://chat.openai.com/chat",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    };

    const postData = {
      input: 'Got any creative ideas for a 10 year old’s birthday?',
      model: 'text-moderation-playground',
    };

    // That's it, the rest is playwright usage as normal 😊
    chromium.launch({ headless: false }).then(async browser => {
      const page = await browser.newPage({
        serviceWorkers: "allow",
        extraHTTPHeaders: header,
      })

      console.log('Testing the stealth plugin..')
      await page.goto('https://chat.openai.com/chat', { waitUntil: 'networkidle' })

      await setTimeout(30_000);

      const response = await page.request.post('https://chat.openai.com/chat',
        {
          data: qs.stringify(postData),
          headers: header
        }
      );
      console.log(response);

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
