# web-scrapping-amazon-wishlist
I made this project to help me monitoring and alert myself when some products in my amazon's wishlist are on sale.

### What was it used on this project ?
For this personal project I did use of four principal libs/frameworks:
- express: It made it easier for me provides APIs to trigger the job and running this project as a service.  
- puppeteer: It was used to "web scrapping" the e-commerce on headless browser.
- cheerio: It provides a simple way to navigate or create a DOM returned by puppeteer.
- nodemailer: The principal nodejs' lib to send mail using SMTP servers.

### How to run and how this works ?
1. The first step is a little laborious. You need a smtp server to send the mail. You can provides for your own or you can use from gmail servers. I will try to simplify that step, but you can check those links to help you:
- https://nodemailer.com/usage/using-gmail/
- https://support.google.com/mail/answer/185833?hl=en

1.1. So to simply you need to open your gmail account and create an app password. It will create a password with 13 letters that you can need to set os environment variables:
```
SMTP_USER=<USER_EMAIL> --> your email
SMTP_PASS=<PASSWORD> ----> put the app password created before.
```

2. You need to send a http request and define some params:
- POST to http://localhost:3000/wishlist-report
- body (json): 
```
{
    "url": "https://www.amazon.com.br/hz/wishlist/ls/37PMJQL2BBFJ6", -> wishlist url. Must be a public list! (required)
    "sendTo": "example.wishlist@gmail.com", --------------------------> email to send report (required)
    "zipcode": ["95860", "000"], -------------------------------------> it define the right prices to your location (required)
    "minPromotionValue": 5.0, ----------------------------------------> minimum discount of promotion value (optional)
    "minPromotionPercentage": 10.0 -----------------------------------> minimum discount percentage of promotion (optional)
}
```

3. After a few seconds, you will recive an email like that image below:
![image](https://user-images.githubusercontent.com/9343013/173192258-07b585a4-fe4c-48f7-aa7c-af378213975d.png)
