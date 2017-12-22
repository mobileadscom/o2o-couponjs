# CouponJS

```javascript
const coupon = new Coupon({
      userId: 3213, // Required: User Id
      studioId: 95, // Required: Studio Id
      tabId: 1, // Required: Tab Id
      trackId: 2612, // Required: Track Id
      form: { // Required form must have name, email, phoneNo named inputs and 1 submit button
        id: 'myForm', // Required: form element id
        callback: function(err, result) { // [Optional] Callback
          if (err) throw new Error(err);
          console.log(result)
        }
      },
      store: 1, // [Optional] Default: 1
      multiple: true, // [Optional] Default: false (If store are multiple)
      uniqueCode: 'phoneNo', // Required name of the input you wanted to use for unique code
      trackers: { // [Optional] For trackers
        impression: ['http://google.com'], // When user sees the ad
        submit: ['http://google.com'], // When user click submit
        landing: ['http://google.com'], // When user click on a special 
        redirect: ['http://google.com'] // When user sucessfully submitted the form and redirected to claim/redeem page
      },
      landing: { // [Optional]
        id: 'btn-landing', // Element button/img Id
        url: 'http://google.com' // Where the user will be redirected when they click the button or image
      },
      redirectUrl: 'http://google.com', // Claim/Redeem page
      preview: true // [Optional] If not set the coupon is live/on production Default: false
    });
```

## Development
```bash
$ npm install
$ npm run dev
```

### Build
```bash
$ npm install
$ npm run build
```