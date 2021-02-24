const errorMessageMap = {
  'A valid number is required.': 'This field accepts numbers only.',
  'Enter a valid email address.': 'The consignee’s email address is not valid.',
  'Ensure that there are no more than 2 decimal places.': 'Values in this field should have a maximum of 2 decimal places.',
  'Ensure this field has no more than 255 characters.': 'This field cannot exceed 255 characters.'
}

const choiceMessageMap = {
  'incoterm': 'For cross-border shipments, please key in ‘DDU’ or ‘DDP’ or leave it blank for domestic shipments.',
  'payment_type': 'Payment Type should be only either `Prepaid` or `COD`.',
  'item_category': 'This field only accepts a list of recognized values (please refer to http://apidocs.janio.asia/faq#item_category).',
  'item_price_currency': 'This field only accepts a list of recognized values (please refer to https://www.iban.com/currency-codes for a list of internationally recognized currency codes).'
}

const setDefault = (obj, key, value) => {
  // method to check if obj has property `key` if not set the default `value`
  if (obj[key]){
    return obj[key]
  }else{
    obj[key] = value
    return obj[key]
  }
}

const getLineNo = (identifier, locationArr) => {
  // method to get line no from error identifier and comparing with locatoin array
  return locationArr.reduce((totalLines, currentItem, index) => {
    if (identifier.includes('0')){
      if (currentItem.startsWith(identifier.charAt(0))){
        totalLines.push(index+1)
      }
    }else{
      if (currentItem === identifier){
        totalLines.push(index+1)
      }
    }
    return totalLines
    }, []) 
}

const mapErrorMessages = (field, msg) => {
  const choicesArray = ['incoterm', 'payment_type', 'item_category', 'item_price_currency']
  if (choicesArray.includes(field) && msg.includes('is not a valid choice.')){
    return choiceMessageMap[field]
  }else if (errorMessageMap[msg]){
    return errorMessageMap[msg]
  }else{
    return msg
  }
  
}

export const formatError = (original, errorMsg) => {
  // form list of obj with key order & item
  let locationIndex = original.map( function (row) {
    // check if shipper order id exists if it does not add corresponding order and find item no
    if (!row.shipper_order_id) {
      let item = `${this.orderNo}-1`
      this.orderNo +=1
      return item
    }else{ // else check if shipper order id has been added
      if (this.shipperOrderId[row.shipper_order_id]){ // if previously added increment the itemno
        let item = `${this.shipperOrderId[row.shipper_order_id].orderNo}-${this.shipperOrderId[row.shipper_order_id].itemNo}`
        this.shipperOrderId[row.shipper_order_id].itemNo +=1
        return item
      }else{ // else create new shipperorderid obj
        let item = `${this.orderNo}-1`
        this.shipperOrderId[row.shipper_order_id] = {orderNo: 0, itemNo: 0}
        this.shipperOrderId[row.shipper_order_id].itemNo = 2
        this.shipperOrderId[row.shipper_order_id].orderNo = this.orderNo
        this.orderNo +=1
        return item
      }
    }
  }, {orderNo:1, shipperOrderId: {}})
  // console.log('\nLocation of orders & items in csv:\n',locationIndex)

  // form list of error messages separated by order & item no
  let reducedError = errorMsg.orders.reduce((reducedObj, errorObject, orderIndex) => {
    Object.keys(errorObject).forEach(fieldName => {

      if (fieldName === 'items'){ // if error field is items need to iterate thru item errors and append item row no
        
        // iterate thru item errors per order
        errorObject.items.forEach((itemError, itemIndex) => {
          // iterate thru error messages for each item
          Object.keys(itemError).forEach(itemErrorField => {
            setDefault(reducedObj, itemErrorField, {})
            itemError[itemErrorField].forEach(errorMessage =>{
              setDefault(reducedObj[itemErrorField], errorMessage, {ident:[]}).ident.push(`${orderIndex+1}-${itemIndex+1}`)
            })    
          })
        })
      }else{ //else the errors will apply to all order rows
        setDefault(reducedObj, fieldName, {})
        console.log(errorObject[fieldName])
        errorObject[fieldName].forEach(error=>{
          setDefault(reducedObj[fieldName], error, {ident: []}).ident.push(`${orderIndex+1}-0`)
        })
      }
    }
    )
    return reducedObj
  }, {})
  // console.log('\nreduced error is:\n', JSON.stringify(reducedError, null, 4))

  // stitch the error messages with its line nos
  let finalError = []
  Object.keys(reducedError).forEach(fieldNames => {
    Object.keys(reducedError[fieldNames]).forEach(errorMessage => {
      let lines = reducedError[fieldNames][errorMessage].ident.reduce((combinedLines, ident)=>{
        return combinedLines.concat(getLineNo(ident, locationIndex))
      },[])
      finalError.push(`Oops, we have an error under ${fieldNames}. ${mapErrorMessages(fieldNames, errorMessage)} Please make the necessary changes at Line ${lines}.`)
    })
  })
  console.log('\nfinally the final thing is\n', finalError)
}

// DUMMY DATA
// const originalCSV = [
//   // order1 item1
//   {'pickup_country': 'Singapore', 'consignee_country': 'Indonesia', 'shipper_order_id': 'ABC', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': 'FIFTY DOLLARS', 'item_price_currency': 'SGD', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': 'SIX', 'order_width': 'TEN', 'order_height': 'TWO', 'order_weight': 'THREE', 'incoterm': 'DDP', 'payment_type': 'cod', 'cod_amt_to_collect': 'ELEVEN DOLLARS'},
//   // order2 item1
//   {'pickup_country': 'Indonesia', 'consignee_country': 'Singapore', 'shipper_order_id': '123', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': '50.12345', 'item_price_currency': 'SGD', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': '6.234', 'order_width': '10.34508', 'order_height': '2.5495', 'order_weight': '4.24085', 'incoterm': 'DDP', 'payment_type': 'cod', 'cod_amt_to_collect': '11.10934'},
//   // order2 item2
//   {'pickup_country': 'Indonesia', 'consignee_country': 'Singapore', 'shipper_order_id': '123', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': '50.5', 'item_price_currency': 'SGD23', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': '6.5', 'order_width': '10', 'order_height': '2.5', 'order_weight': '3', 'incoterm': 'DDU', 'payment_type': 'prepaid', 'cod_amt_to_collect': ''},
//   // order1 item2
//   {'pickup_country': 'Indonesia', 'consignee_country': 'Malaysia', 'shipper_order_id': 'ABC', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': '50.5', 'item_price_currency': 'SINGAPORE', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': '6.5', 'order_width': '10', 'order_height': '2.5', 'order_weight': '3', 'incoterm': 'DDU', 'payment_type': 'prepaid', 'cod_amt_to_collect': ''},
//   // order3 item1
//   {'pickup_country': 'Indonesia', 'consignee_country': 'Japan', 'shipper_order_id': '456', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': '50.5', 'item_price_currency': 'SGE', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': '6.5', 'order_width': '10', 'order_height': '2.5', 'order_weight': '3', 'incoterm': 'DDU', 'payment_type': 'prepaid', 'cod_amt_to_collect': ''},
//   // order3 item2
//   {'pickup_country': 'Indonesia', 'consignee_country': 'Japan', 'shipper_order_id': '456', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': '50.5', 'item_price_currency': 'SGD', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': '6.5', 'order_width': '10', 'order_height': '2.5', 'order_weight': '3', 'incoterm': 'FFI', 'payment_type': 'prepaid', 'cod_amt_to_collect': ''},
//   // order4 item1
//   {'pickup_country': 'Singapore', 'consignee_country': 'Indonesia', 'shipper_order_id': '', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': 'FIFTY DOLLARS', 'item_price_currency': 'SGD', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': 'SIX', 'order_width': 'TEN', 'order_height': 'TWO', 'order_weight': 'THREE', 'incoterm': 'DDP', 'payment_type': 'cod', 'cod_amt_to_collect': 'ELEVEN DOLLARS'},
//   // order2 item3
//   {'pickup_country': 'Singapore', 'consignee_country': 'Indonesia', 'shipper_order_id': '123', 'tracking_no': '', 'item_desc': 'sunglasses', 'item_quantity': '1', 'item_product_id': '', 'item_sku': '', 'item_category': 'Fashion Apparel', 'item_price_value': 'FIFTY DOLLARS', 'item_price_currency': 'SGD', 'consignee_name': 'Mary', 'consignee_number': '93274829', 'consignee_address': 'Blk 123 Jurong East Ave 4', 'consignee_postal': '924843', 'consignee_state': 'Jurong', 'consignee_city': 'Singapore', 'consignee_province': '', 'consignee_email': 'mary@email.com', 'order_length': 'SIX', 'order_width': 'TEN', 'order_height': 'TWO', 'order_weight': 'THREE', 'incoterm': 'DDP', 'payment_type': 'cod', 'cod_amt_to_collect': 'ELEVEN DOLLARS'},
// ]

// const errors = {
//   'orders': [
//     {'payment_type': ['something is not a valid choice.'], 'pickup_contact_name': ['This field is required.'], 'pickup_contact_number': ['This field is required.'], 'items': [{}, {'item_price_value': ['This field is required.']}, {}]},
//     {}, 
//     {'consignee_email':['Enter a valid email address.'],'pickup_contact_name': ['Cannot be blank.', 'This field is required.'], 'pickup_contact_number': ['This field is required.'], 'items': [{}, {'item_price_currency': ['Item Price Currency should match the currency of Indonesia if Payment Type is ‘cod’']}]},
//     {}
//   ]
// }
// formatError(originalCSV,errors)