<template>
  <div class="template">
    <div class="header">
      <div>
        <h1><span class="hide-in-print">INTERACTIVE </span>INVOICE</h1>
        <div class="hide-in-print" style="margin-bottom:10px">This page is rendered from a "template" Vue.js component.<br>You can modify the fields highlighted in green and interact with the buttons without having them in the print. Check out <a href="https://github.com/motla/vue-document-editor/blob/master/src/Demo/InvoiceTemplate.ce.vue" target="_blank">InvoiceTemplate.ce.vue</a></div>
      </div>
      <div><img src="../../img/vue-logo.png" style="width:80px"></div>
    </div>
    <table>
      <thead>
        <tr>
          <td>OUR DETAILS</td>
          <td style="text-align:right">INVOICE DETAILS</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td contenteditable="true">
            <div><b>MyCompany</b></div>
            <div>24 Poazkz Pazoek</div>
            <div>89232 Oijzrazro</div>
            <div>FRIGNEDRY</div>
            <div>AB251648730890</div>
          </td>
          <td style="min-width: 250px; text-align:right">
            <div><b>Invoice number:</b> <span contenteditable="true" @keydown="preventLineBreaks">{{modelValue.invoice_number}}</span></div>
            <div><b>Invoice date:</b> <span contenteditable="true" @keydown="preventLineBreaks">{{today}}</span></div>
            <div><b>Order number:</b> <span contenteditable="true" @keydown="preventLineBreaks">W210984204</span></div>
            <div><b>Order date:</b> <span contenteditable="true" @keydown="preventLineBreaks">{{today}}</span></div>
            <div><b>Your client number:</b> <span contenteditable="true" @keydown="preventLineBreaks">120948</span></div>
          </td>
        </tr>
      </tbody>
    </table>
    <table style="margin:10px 0 35px 0">
      <thead>
        <tr>
          <td style="width:50%">BILLING ADDRESS</td>
          <td>SHIPPING ADDRESS
            <label class="hide-in-print" style="margin-left: 10px">
              <input type="checkbox" v-model="is_shipping_identical"> Identical
            </label>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td ref="billing_address" contenteditable="true" @input="(e) => this.billing_address = e.target.innerHTML"></td>
          <td v-if="is_shipping_identical" v-html="billing_address" contenteditable="false"></td>
          <td v-else contenteditable="true">Insert custom shipping address</td>
        </tr>
      </tbody>
    </table>
    <h2>Your order</h2>
    <table style="margin-top:10px" class="order-table">
      <thead>
        <tr style="font-size: 13px">
          <td>ITEM #</td>
          <td>REFERENCE</td>
          <td>DESIGNATION</td>
          <td>QUANTITY</td>
          <td>UNIT PRICE</td>
          <td style="text-align:right">TOTAL PRICE</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) of items" :key="item.key">
          <td><div class="left-btn hide-in-print" @click="() => items.splice(i, 1)">➖</div>{{i+1}}</td>
          <td contenteditable="true">{{item.ref}}</td>
          <td contenteditable="true">{{item.desc}}</td>
          <td style="padding:0; text-align:center"><input type="number" min="1" style="width:3em" v-model="item.qty"></td>
          <td style="padding:0">€ <input type="number" step="0.01" style="width:4em" v-model="item.price"></td>
          <td style="text-align:right">€ {{(item.qty * item.price).toFixed(2)}}</td>
        </tr>
        <tr>
          <td><div v-if="items.length < 5" class="left-btn hide-in-print" @click="() => items.push({ key: Math.random(), ref: 'MyRef', desc: 'My description', qty: 1, price: 0 })">➕</div></td>
          <td colspan="5" style="text-align:right">Sub-total: € {{sub_total.toFixed(2)}}</td>
        </tr>
        <tr>
          <td colspan="6" style="text-align:right">Taxes: <span ref="tax_percent" contenteditable="true" @input="(e) => this.tax_percent = parseFloat(e.target.innerText)"></span>%</td>
        </tr>
        <tr>
          <td colspan="6" style="text-align:right">Shipping: € <span ref="shipping" contenteditable="true" @input="(e) => this.shipping = parseFloat(e.target.innerText)"></span></td>
        </tr>
        <tr>
          <td colspan="6" style="text-align:right; font-weight:bold">Order total: € {{total.toFixed(2)}}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-bottom:20px">Thank you for your order.</div>
    <div><b>Payment method:</b> <span contenteditable="true" @keydown="preventLineBreaks">Bank transfer</span></div>
    <div><b>Payment term:</b> <span contenteditable="true" @keydown="preventLineBreaks">{{next_month}}</span></div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: Object
  },
  data () {
    return {
      is_shipping_identical: true,
      billing_address: "<b>M. John Doe</b><br>98 Ooezfjefoi Laozdij<br>09823 Ljeiznr<br>FOPKSOFOF<br>AC310592815039",
      items: [{ key: Math.random(), ref: "X3000", desc: "My great product", qty: 1, price: 299 }],
      tax_percent: 20,
      shipping: 15
    }
  },
  mounted () {
    // initialize contenteditable="true" fields manually
    this.$refs.billing_address.innerHTML = this.billing_address;
    this.$refs.tax_percent.innerHTML = this.tax_percent;
    this.$refs.shipping.innerHTML = this.shipping+".00";
  },
  computed: {
    today () {
      var date = new Date();
      return date.toJSON().slice(0,10).replace(/-/g,'.');
    },
    next_month () {
      var date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toJSON().slice(0,10).replace(/-/g,'.');
    },
    sub_total () {
      return this.items.reduce((acc, item) => acc += item.qty * item.price, 0);
    },
    total () {
      return this.sub_total * (1 + this.tax_percent/100) + this.shipping;
    }
  },
  methods: {
    preventLineBreaks (e) { if(e.which == 13) e.preventDefault(); }
  }
}
</script>

<style scoped>
  table {
    width: 100%;
    border-spacing: 0;
  }
  table td {
    position: relative;
    padding: 6px;
    vertical-align: top;
  }
  table.order-table td {
    vertical-align: middle;
  }
  table thead td {
    font-weight: bold;
  }
  table tbody td {
    border-top: solid 1px #CCC;
  }
  input[type=number] {
    border: none;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background: rgba(200, 250, 230, 0.4);
    padding: 6px;
  }
  *[contenteditable="true"] {
    background: rgba(200, 250, 230, 0.4);
    cursor: text;
    transition: padding 0.05s linear;
  }
  span[contenteditable="true"]:focus {
    padding: 0 4px;
  }
  @media print {
    *[contenteditable="true"], input {
      background: none;
    }
    .hide-in-print {
      display: none;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
      background: none;
    }
  }
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .order {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .left-btn {
    position: absolute;
    left: -40px;
    top: 2px;
  }
  .left-btn:hover {
    opacity: 0.6;
  }
</style>