import axios from 'axios'

const LoadJS = (url) => {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script')
      script.src = url
      document.getElementsByTagName('head')[0].appendChild(script)
      script.onload = () => {
        resolve(true)
      }
    } catch(e) {
      reject(e)
    }
  })
}

const imgTrack = (urls) => {
  for (let i = 0; i < urls.length; i += 1) {
    const t = document.createElement('img');
    t.src = urls[i];
    t.style.display = 'none';
    document.body.appendChild(t);
  }
}

class Coupon {
  constructor({
    userId, // User Id
    studioId, // Studio Id
    tabId,  // Tab Id
    trackId, // Track Id
    form, // Form object required id property
    uniqueCode, // Unique code input name
    store, // Store - Default 1
    trackers, //[Optional] Trackers object
    landing, // [Optional] Landing object
    recipients, // [Optional] List of email to receive data
    referredUrl, // [Optional] Referred Url or extra data want to include/track
    redirectUrl, // [Optional] Coupon success redirect url
    multiple // [Optional] if multiple store
  }) {
    try {
      this.config = {
        userId,
        studioId,
        tabId,
        trackId,
        form,
        uniqueCode
      }
      
      // Check every config that it is existing / this are the required fields
      const configCheck = Object.keys(this.config).filter(key => this.config[key] === undefined || !this.config[key])
      if (configCheck.length > 0) {
        const neededConfig = configCheck.reduce((msg, config, index) => {
          msg += config + (index === (configCheck.length-1) ? '' : ', ')
          return msg
        }, '')
        throw new Error('The following are needed in Coupon instance: ' + neededConfig)
      }
  
      if (form.id) {
        this.form = window.document.getElementById(form.id);  
      } else {
        throw new Error('We need id property for form object. Please enter the id for your form.')
      }

      if (!this.form.querySelector('[type=submit]')) {
        throw new Error('We need at least one type=submit in your form.')
      }
  
      let fieldCheck = [];
      this.fields = Object.values(this.form.elements).filter(elem => {
        if (!elem.name && elem.nodeName === 'INPUT') throw new Error('We need name attribute for every input field in your form. Check every input.')
        if ((elem.name === 'name' || elem.name === 'phoneNo' || elem.name === 'email') && elem.nodeName === 'INPUT') {
          if (!elem.placeholder) elem.placeholder = elem.name === 'phoneNo' ? 'Phone Number' : elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
          fieldCheck.push(elem.name)
        }
        return elem.nodeName === 'INPUT'
      });

      if (fieldCheck.length < 3) {
        const diff = (a, b) => a.filter((i) => b.indexOf(i) < 0);
        const missing = diff(['name', 'phoneNo', 'email'], fieldCheck)
        throw new Error('We need the required fields named by (name, phoneNo, email) and you\'re missing ' + missing.join(','))
      }
  
      this.recipients = recipients || ''
      this.referredUrl = referredUrl || ''
      this.trackers = trackers || false
      this.landing = landing || false
      this.redirectUrl = redirectUrl || false
      this.store = store || 1;
      this.multiple = multiple

      if (this.trackers.impression) {
        imgTrack(this.trackers.impression);
      }

      if (this.landing && this.landing.id && this.landing.url) {
        const btn = document.getElementById(this.landing.id)
        btn.onclick = () => {
          window.location = this.landing.url
          if (this.trackers.landing) {
            imgTrack(this.trackers.landing)
          }
        }
      }
  
      this.form.onsubmit = this.submit.bind(this)
      window.leadGenCallback = this.handleLeadgenCallback.bind(this)
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  getQrCode (size) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size || '130x130'}&data=${this.form.elements[this.config.uniqueCode]}`
        img.id = 'qrcode'
        img.onload = () => {
          resolve(img)
        }
      } catch(e) {
        reject(e)
      }
    })
  }

  async submit (e) {
    try {
      let submissionUrl = `https://www.mobileads.com/api/save_lf?contactEmail=${this.recipients || ''}&gotDatas=1`

      const elements = '[' + this.fields.reduce((result, field, index) => {
        if (field.value === '') throw new Error(`No value from '${field.name}' field`)
        return result + `
          {
            %22fieldname%22:%22text_${index+1}%22,
            %22value%22:%22${field.value}%22,
            %22required%22:%22required%22
          }${index === this.fields.length - 1 ? '' : ','}
        `.replace(/\n|\s/g, '')
      }, '') + ']'

      submissionUrl += `&elements=${elements}`
      submissionUrl += `&user-id=${this.config.userId}`
      submissionUrl += `&studio-id=${this.config.studioId}`
      submissionUrl += `&tab-id=${this.config.tabId}`
      submissionUrl += `&trackid=${this.config.trackId}`
      if (this.referredUrl) submissionUrl += `&referredURL=${this.referredUrl}`
      submissionUrl += `&callback=leadGenCallback`

      e.preventDefault();

      const leadgenSubmission = await LoadJS(submissionUrl);
      return await false;
    } catch(err) {
      e.preventDefault();
      console.error(err)
      return await false;
    }
  }

  async handleLeadgenCallback (res) {
    try {
      if (res.status) throw new Error('Failed to submit leadgen data.')

      const { data } = await axios.post(`https://www.mobileads.com/api/coupon/generate_coupon?phoneNo=${this.form.elements['phoneNo'].value}&userId=${this.config.userId}&studioId=${this.config.studioId}&email=${this.form.elements['email'].value}&name=${this.form.elements['name'].value}`)

      if (data.status) {
        if (data.code) {
          if (this.trackers.submit) {
            imgTrack(this.trackers.submit)
          }
          
          if (this.redirectUrl) {
            if (this.trackers.redirect) {
              imgTrack(this.trackers.redirect)
            }
            window.location = `${this.redirectUrl}?phoneNo=${data.code === this.form.elements['phoneNo'].value && this.multiple ? data.code.toString() + this.store : data.code }`
          }
        } else {
          window.alert(data.message)
        }
        
      } else {
        throw new Error(data.message)
      }

    } catch(err) {
      console.error(err)
    }
  }
}
window.Coupon = Coupon
