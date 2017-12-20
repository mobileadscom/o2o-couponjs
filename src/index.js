import axios from 'axios'

class Coupon {
  async init () {
    const r = await axios.get('https://jsonplaceholder.typicode.com/posts/1')
    console.log(r)
  }
}

window.Coupon = Coupon