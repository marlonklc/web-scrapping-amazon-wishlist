# web-scrapping-amazon-wishlist
I made this project to help me monitoring and alert myself when some products in my amazon's wishlist are on sale.

PS: Feel free to comment or forked this project to your country context.

### What was it used on this project ?
For this personal project I did use of four principal libs/frameworks:
- express: It made it easier for me provides APIs to trigger the job and running this project as a service.  
- puppeteer: It was used to "web scrapping" the e-commerce on headless browser.
- cheerio: It provides a simple way to navigate or create a DOM returned by puppeteer.
- resend: API-based email provider used to send the report email.

### How to run and what will this produce ?
1. Use Node.js 24 LTS (see `.nvmrc`) and install dependencies.

2. Create your env file (or copy from `.env.example`) and configure Resend credentials:
```
PORT=3000
RESEND_API_KEY=<YOUR_RESEND_API_KEY>
RESEND_FROM=<YOUR_VERIFIED_SENDER_EMAIL>
PUPPETEER_HEADLESS=true
PUPPETEER_SLOW_MO=0
PUPPETEER_TIMEOUT_MS=30000
PUPPETEER_DEBUG_DIR=debug-artifacts
```

`RESEND_FROM` must be a verified sender/domain in your Resend account. If omitted, the service falls back to `onboarding@resend.dev`.

For local debug with visible browser, set:
- `PUPPETEER_HEADLESS=false`
- `PUPPETEER_SLOW_MO=200`

If zipcode modal fails, the app now saves screenshot and HTML in `PUPPETEER_DEBUG_DIR` with timestamp.

3. Go to project folder and run `npm install && npm start`. It will install dependencies and run the project.

4. You need to send a http request (using postman, insomnia or curl) and define some params:
- POST to http://localhost:3000/wishlist-report
- body (json): 
```
{
    "url": "https://www.amazon.com.br/hz/wishlist/ls/37PMJQL2BBFJ6", -> wishlist url. Must be a public list! (required)
    "sendTo": "example.wishlist@email.com", ---------------------------> email to send report (required)
    "zipcode": ["95860", "000"], -------------------------------------> it define the right prices to your location (required)
    "minPromotionValue": 5.0, ----------------------------------------> minimum discount of promotion value (optional)
    "minPromotionPercentage": 10.0 -----------------------------------> minimum discount percentage of promotion (optional)
}
```

5. After a few seconds, you will recive an email like that image below:
<img width="1528" height="392" alt="image" src="https://github.com/user-attachments/assets/4a1da5b3-79d7-470f-8910-4b10ad1dfb40" />
