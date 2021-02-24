import JsBarcode from 'jsbarcode';
import _ from 'lodash';

export const getLogoBase64Str = (logoImg) => {
  let dataUrl = null;
  if (logoImg !== null) {
    const canvas = document.createElement("canvas");
    canvas.width = logoImg.width;
    canvas.height = logoImg.height;
    const context = canvas.getContext("2d");
    context.drawImage(logoImg, 0, 0);
    dataUrl = canvas.toDataURL("image/png", 1.0);
  }

  return dataUrl;
}

export const wrapText = (context, text, x, y, maxWidth, lineHeight, maxCharPerLine) => {
  let words = text.split(' ');
  let line = '';

  let shortenedWords = [];
  for (let m = 0; m < words.length; m++) {
    if (words[m].length <= maxCharPerLine) {
      shortenedWords.push(words[m]);
    } else {
      let lastCharIndex = 0;
      for (let n = 0; n < words[m].length; n++) {
        if (n % (maxCharPerLine + 1) === 0 && n > 0) {
          shortenedWords.push(words[m].substring(lastCharIndex, n));
          lastCharIndex = n;
        }
      }
      shortenedWords.push(words[m].substring(lastCharIndex, words[m].length));
    }
  }

  for (let n = 0; n < shortenedWords.length; n++) {
    let testLine = line + shortenedWords[n] + ' ';
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = shortenedWords[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  context.fillText(line, x, y);
}

export const getDoc = (combine, listLength, docList, doc, item, services, shipperDetails) => {
  console.log("getDoc")
  let trackingNo = item.tracking_no;
  let pickupAddress = item.pickup_address;
  let pickupCountry = item.pickup_country;
  let shipperName = shipperDetails.shipper_name;
  let consigneeCountry = item.consignee_country;
  let consigneeCurrency = item.consignee_currency;
  let consigneeName = item.consignee_name;
  let consigneeAddress = item.consignee_address;
  let consigneePostal = item.consignee_postal ? item.consignee_postal : '';
  let consigneeCity = item.consignee_city ? item.consignee_city : '';
  let consigneeProvince = item.consignee_province ? item.consignee_province : '';
  let consigneeState = item.consignee_state ? item.consignee_state : '';
  let orderWeight = item.order_weight;
  let shipperOrderId = item.shipper_order_id ? item.shipper_order_id : 'N/A';
  let notes = item.delivery_note ? item.delivery_note : 'N/A';
  let paymentType = item.payment_type;
  let itemList = item.items;
  let itemCategory = '';
  let itemQuantity = 0;
  if (itemList.length === 1) {
    itemCategory = itemList[0].item_category;
    itemQuantity = itemList[0].item_quantity;
  } else {
    _.map(itemList, (item, i) => {
      if (i !== itemList.length - 1) {
        if (!itemCategory.includes(item.item_category))
          itemCategory += item.item_category + ', ';
      } else {
        if (!itemCategory.includes(item.item_category))
          itemCategory += item.item_category;
      }
      itemQuantity += item.item_quantity;
    });
  }

  let serviceName = '';
  _.forEach(services, service => {
    if (service.service_id === item.service_id) {
      serviceName = service.service_name;
    }
  })

  doc.setLineWidth(0.8);
  doc.line(52, 20, 5, 6);
  doc.setLineWidth(0.8);
  doc.line(100, 6, 52, 20);
  doc.setLineWidth(0.8);
  doc.line(5, 145, 5, 6);
  doc.setLineWidth(0.8);
  doc.line(100, 145, 100, 6);
  doc.setLineWidth(0.8);
  doc.line(5, 145, 100, 145);

  const logoImg = document.querySelector('#logo');
  const logoBase64Str = getLogoBase64Str(logoImg);
  const partnerLogoImgList = document.querySelectorAll("[id^='partnerLogo']");

  let x = 0;
  let x2 = 0;
  let x3 = 0;
  if (partnerLogoImgList.length > 0) {
    if (partnerLogoImgList.length === 1) {
      x = 16;
      x2 = 27;
      x3 = 65;
    }
    doc.addImage(logoBase64Str, 'PNG', x, 22, 40, 11, '', 'FAST');
    doc.setFontSize(8);
    doc.text('www.janio.asia', x2, 38);

    _.map(partnerLogoImgList, (item, i) => {
      const partnerLogoBase64Str = getLogoBase64Str(item);
      doc.addImage(partnerLogoBase64Str, 'PNG', x3, 21, 22, 13, '', 'FAST');
    });
  } else {
    doc.addImage(logoBase64Str, 'PNG', 32, 22, 40, 11, '', 'FAST');

    doc.setFontSize(8);
    doc.text('www.janio.asia', 42, 38);
  }

  doc.setLineWidth(0.3);
  doc.line(5, 40, 100, 40);

  doc.setFontSize(8);
  doc.setFontType('bold');
  doc.text(`FROM: ${pickupCountry}`, 10, 45);
  doc.setFontSize(6);
  doc.setFontType('normal');
  if (pickupAddress.length > 15) {
    pickupAddress = pickupAddress.substring(0, pickupAddress.split(',', 2).join(',').length + 1) + '\n' + pickupAddress.substring(pickupAddress.split(',', 2).join(',').length + 1).trim();
  }

  const fromAddressText = shipperName + ', ' + pickupCountry + ', ' + pickupAddress + '\n' + serviceName;
  const fromAddressTextMatchResult = fromAddressText.match(/^[\w\s!@#$%^&*()'--=,.?/]+$/g);
  if (fromAddressTextMatchResult === null) {
    const canvas = document.querySelector("#canvas");
    canvas.width = 2400;
    canvas.height = 500;
    const context = canvas.getContext("2d");
    context.font = "9em Arial";
    wrapText(context, fromAddressText, 1, 95, 2300, 130, 33);
    const img64 = canvas.toDataURL("image/png", 1.0);
    doc.addImage(img64, "PNG", 10, 47, 40, 10, '', 'FAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const fromAddressTextSplitText = doc.splitTextToSize(fromAddressText, 35);
    doc.text(fromAddressTextSplitText, 10, 49);
  }

  doc.setLineWidth(0.3);
  doc.line(52, 68, 52, 40);

  doc.setFontSize(8);
  doc.setFontType('bold');
  doc.text(`TO: ${consigneeCountry}`, 55, 45);
  doc.setFontSize(6);
  doc.setFontType('normal');
  let fullAddress = '';
  let address = consigneeName + '\n' + consigneeAddress + ', ' + consigneePostal + ',\n';
  let address2 = '';
  if (!_.isEmpty(consigneeProvince)) {
    fullAddress = consigneeName + '\n' + consigneeAddress + ', ' + consigneePostal + ', ' + consigneeCity + ', ' + consigneeProvince + ', ' + consigneeState;
    address2 = consigneeCity + ', ' + consigneeProvince + ', ' + consigneeState;

    if (address2.length > 15) {
      if (consigneeState.length > 15) {
        address2 = consigneeCity + ',\n' + consigneeProvince + ',\n' + consigneeState.substring(0, consigneeState.split(',', 2).join(',').length + 1) + '\n' + consigneeState.substring(consigneeState.split(',', 2).join(',').length + 1).trim();
      }
    }
  } else {
    fullAddress = consigneeName + '\n' + consigneeAddress + ', ' + consigneePostal + ', ' + consigneeCity + ', ' + consigneeState;
    address2 = consigneeCity + ', ' + consigneeState;

    if (address2.length > 15) {
      if (consigneeState.length > 15) {
        address2 = consigneeCity + ',\n' + consigneeState.substring(0, consigneeState.split(',', 2).join(',').length + 1) + '\n' + consigneeState.substring(consigneeState.split(',', 2).join(',').length + 1).trim();
      }
    }
  }
  const toAddressText = consigneeName + ',\n' + consigneeCountry + ',\n' + fullAddress.length < 20 ? fullAddress : address + address2;
  const toAddressTextMatchResult = toAddressText.match(/^[\w\s!@#$%^&*()'--=,.?/]+$/g);
  if (toAddressTextMatchResult === null) {
    const canvas = document.querySelector("#canvas");
    canvas.width = 2400;
    canvas.height = 500;
    const context = canvas.getContext("2d");
    context.font = "9em Arial";
    wrapText(context, toAddressText, 1, 95, 2300, 130, 33);
    const img64 = canvas.toDataURL("image/png", 1.0);
    doc.addImage(img64, "PNG", 55, 47, 40, 10, '', 'FAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const toAddressTextSplitText = doc.splitTextToSize(toAddressText, 35);
    doc.text(toAddressTextSplitText, 55, 49);
  }

  doc.setLineWidth(0.3);
  doc.line(5, 68, 100, 68);

  doc.setFontSize(8);
  doc.setFontType('bold');
  doc.text('ITEM DESCRIPTION: ', 10, 73);
  doc.setFontType('normal');
  if (itemCategory.length > 15) {
    itemCategory = itemCategory.substring(0, itemCategory.split(',', 2).join(',').length + 1) + '\n' + itemCategory.substring(itemCategory.split(',', 2).join(',').length + 1).trim();
  }
  const itemCategorySplitText = doc.splitTextToSize(itemCategory, 50);
  doc.text(itemCategorySplitText, 10, 79);

  doc.setFontType('bold');
  doc.text('PAYMENT TYPE: ', 10, 86);
  const incoterm = item.incoterm;
  if (paymentType === 'prepaid') {
    doc.setFontType('normal');
    doc.text('prepaid', 10, 91);

    if (incoterm !== null) {
      doc.setFontSize(15);
      doc.text(incoterm, 86, 18);
    }
  } else {
    doc.setFontType('normal');
    doc.setFontSize(15);
    doc.text('COD', 86, 18);

    if (incoterm !== null) {
      doc.text(incoterm, 86, 25);
    }

    const codAmtToCollect = item.cod_amt_to_collect;
    // const itemPriceCurrency = itemList[0].item_price_currency;
    doc.setFontType('bold');
    doc.setFontSize(8);
    doc.text('COD - please collect\n' + codAmtToCollect + ' ' + consigneeCurrency + ' from consignee.', 10, 90);
  }

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('SHIPPER ORDER ID: ', 10, 98);
  doc.setFontType('normal');
  doc.text(shipperOrderId, 39, 98);

  doc.setFontType('bold');
  doc.text('NOTES: ', 10, 105);
  doc.setFontType('normal');
  const notesSplitText = doc.splitTextToSize(notes, 70);
  doc.text(notesSplitText, 22, 105);

  doc.setFontType('bold');
  doc.text('ITEM QUANTITY: ', 55, 73);
  doc.setFontType('normal');
  doc.setFontSize(12);
  doc.text(itemQuantity.toString(), 55, 80);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('TOTAL WEIGHT: ', 55, 86);
  doc.setFontType('normal');
  doc.setFontSize(12);
  doc.text(orderWeight + 'KG', 55, 93);

  doc.setLineWidth(0.3);
  doc.line(5, 118, 100, 118);

  JsBarcode('#barcode', trackingNo, {
    // format: "CODE39",
    width: 3,
    fontSize: 50
  });
  const img = document.querySelector('#barcode');
  const imgData = img.src;
  doc.addImage(imgData, "PNG", 11, 120, 85, 22, '', 'FAST');

  doc.addPage();

  let result = null;
  if (!combine) {
    doc.deletePage(listLength + 1);
    result = doc;
  } else {
    if (listLength === 1) {
      doc.deletePage(3);
    } else {
      doc.deletePage(listLength * 2 + 1);
    }
    docList.push(doc);
    result = docList;
  }

  return result;
}

export const getCommercialInvoiceDoc = (combine, listLength, docList, doc, item, shipperDetails) => {
  console.log("getCommercialInvoiceDoc")
  let trackingNo = item.tracking_no;
  let consigneeName = item.consignee_name;
  let consigneeNumber = item.consignee_number;
  let consigneeAddress = item.consignee_address;
  let consigneePostal = item.consignee_postal ? item.consignee_postal : '';
  let consigneeCountry = item.consignee_country ? item.consignee_country : '';
  // let consigneeCurrency = item.consignee_currency;
  let consigneeState = item.consignee_state ? item.consignee_state : '';
  let consigneeCity = item.consignee_city ? item.consignee_city : '';
  let consigneeProvince = item.consignee_province ? item.consignee_province : '';
  let shipperName = shipperDetails.shipper_name;
  let itemList = item.items;

  doc.setLineWidth(0.8);
  doc.line(52, 6, 5, 6);
  doc.setLineWidth(0.8);
  doc.line(100, 6, 52, 6);
  doc.setLineWidth(0.8);
  doc.line(5, 145, 5, 6);
  doc.setLineWidth(0.8);
  doc.line(100, 145, 100, 6);
  doc.setLineWidth(0.8);
  doc.line(5, 145, 100, 145);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Waybill Number', 10, 10.2);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text(trackingNo, 10, 13.8);

  JsBarcode('#barcode', trackingNo, {
    // format: "CODE39",
    width: 3,
    fontSize: 50,
    displayValue: false
  });
  const img = document.querySelector('#barcode');
  const imgData = img.src;
  doc.addImage(imgData, "PNG", 50, 7.5, 45, 7, '', 'FAST');

  doc.setLineWidth(0.3);
  doc.line(5, 16, 100, 16);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Category of Item', 9, 21);

  doc.setLineWidth(0.3);
  doc.line(40, 16, 40, 24);

  doc.setLineWidth(0.3);
  doc.line(52, 16, 52, 24);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text('Document', 54, 21);

  doc.setLineWidth(0.3);
  doc.line(68, 16, 68, 79);

  doc.setLineWidth(0.3);
  doc.line(81, 16, 81, 79);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text('Other', 86, 21);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text('x', 73, 21);

  doc.setLineWidth(0.3);
  doc.line(5, 24, 100, 24);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Full Description', 27, 29);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Number\nof Pieces', 69, 28);

  doc.setFontType('bold');
  doc.setFontSize(8);
  let itemPriceCurrency = itemList[0].item_price_currency;
  doc.text('Unit Value\n(' + itemPriceCurrency + ')', 83, 28);

  doc.setLineWidth(0.3);
  doc.line(5, 33, 100, 33);

  let totalItemQuantity = 0;
  let totalItemPriceValue = 0;
  let itemPositionY = 0;
  let linePositionY = 0;
  let remainingItemDescription = '';
  let showRemainingItems = false;

  // item list
  if (itemList.length <= 4) {
    _.map(itemList, (item, i) => {
      let itemDesc = item.item_desc !== null ? item.item_desc : '';
      let itemQuantity = item.item_quantity;
      let itemPriceValue = parseFloat(item.item_price_value, 10);
      let sumOfItemValue = itemQuantity * itemPriceValue;

      totalItemQuantity += itemQuantity;
      totalItemPriceValue += sumOfItemValue;

      switch (i) {
        case 0:
          itemPositionY = 37;
          linePositionY = 43;
          break;
        case 1:
          itemPositionY = 47;
          linePositionY = 53;
          break;
        case 2:
          itemPositionY = 57;
          linePositionY = 63;
          break;
        case 3:
          itemPositionY = 67;
          linePositionY = 73;
          break;
        default:
          itemPositionY = 0;
          linePositionY = 0;
      }

      doc.setFontType('normal');
      doc.setFontSize(8);
      if (itemDesc !== null && itemDesc.length > 35) {
        itemDesc = `${itemDesc.substring(0, 35)}\n${itemDesc.substring(35).length > 35 ? itemDesc.substring(35, 70) + '...' : itemDesc.substring(35)}`;
      }
      doc.text(itemDesc, 9, itemPositionY);

      doc.setFontType('normal');
      doc.setFontSize(8);
      doc.text(itemQuantity.toString(), 73, itemPositionY);

      doc.setFontType('normal');
      doc.setFontSize(8);
      // doc.text(sumOfItemValue.toFixed(2), 83, itemPositionY);
      doc.text(itemPriceValue.toFixed(2), 83, itemPositionY);

      doc.setLineWidth(0.3);
      doc.line(5, linePositionY, 100, linePositionY);
    });
  } else {
    _.map(itemList, (item, i) => {
      let itemDesc = item.item_desc !== null ? item.item_desc : '';
      let itemQuantity = item.item_quantity;
      let itemPriceValue = parseFloat(item.item_price_value, 10);
      let sumOfItemValue = itemQuantity * itemPriceValue;

      totalItemQuantity += itemQuantity;
      totalItemPriceValue += sumOfItemValue;

      switch (i) {
        case 0:
          itemPositionY = 37;
          linePositionY = 43;
          break;
        case 1:
          itemPositionY = 47;
          linePositionY = 53;
          break;
        case 2:
          itemPositionY = 57;
          linePositionY = 63;
          break;
        case 3:
          itemPositionY = 67;
          linePositionY = 73;
          break;
        default:
          itemPositionY = 0;
          linePositionY = 0;
      }

      if (i <= 3) {
        doc.setFontType('normal');
        doc.setFontSize(8);
        if (itemDesc !== null && itemDesc.length > 35) {
          itemDesc = `${itemDesc.substring(0, 35)}\n${itemDesc.substring(35).length > 35 ? itemDesc.substring(35, 70) + '...' : itemDesc.substring(35)}`;
        }
        doc.text(itemDesc, 9, itemPositionY);

        doc.setFontType('normal');
        doc.setFontSize(8);
        doc.text(itemQuantity.toString(), 73, itemPositionY);

        doc.setFontType('normal');
        doc.setFontSize(8);
        // doc.text(sumOfItemValue.toFixed(2), 83, itemPositionY);
        doc.text(itemPriceValue.toFixed(2), 83, itemPositionY);
      } else if (i >= 4) {
        // remaining item
        let itemQuantity = item.item_quantity;
        let itemDesc = item.item_desc !== null ? item.item_desc : '';
        let itemPriceCurrency = item.item_price_currency;
        let itemPriceValue = parseFloat(item.item_price_value, 10);
        showRemainingItems = true;

        if (itemDesc !== null && itemDesc.length > 20) {
          itemDesc = itemDesc.substring(0, 20) + '...';
        }
        let combineStr = `${itemQuantity} x ${itemDesc} (${itemPriceCurrency} ${itemPriceValue.toFixed(2)}/pc)\n`;
        remainingItemDescription += combineStr;
      }

      doc.setLineWidth(0.3);
      doc.line(5, linePositionY, 100, linePositionY);
    });
  }

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Total', 34, 77);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text(totalItemQuantity.toString(), 72, 77);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text(totalItemPriceValue.toFixed(2), 83, 77);

  doc.setLineWidth(0.3);
  doc.line(5, 79, 100, 79);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Consignee Name', 9, 82);

  doc.setFontType('normal');
  doc.setFontSize(8);

  const consigneeNameMatchResult = consigneeName.match(/^[\w\s!@#$%^&*()'--=,.?/]+$/g);
  if (consigneeNameMatchResult === null) {
    const canvas = document.querySelector('#canvas');
    canvas.width = 3600;
    canvas.height = 150;
    const context = canvas.getContext("2d");
    context.font = "9.2em Arial";
    wrapText(context, consigneeName, 1, 110, 2300, 130, 47);
    const img64 = canvas.toDataURL("image/png", 1.0);
    doc.addImage(img64, "PNG", 43, 79.5, 70, 3.8, '', 'FAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    doc.text(consigneeName, 43, 82);
  }

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Consignee No.', 9, 87);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text(consigneeNumber, 43, 87);

  doc.setLineWidth(0.3);
  doc.line(40, 79, 40, 89);

  doc.setLineWidth(0.3);
  doc.line(5, 84, 100, 84);

  doc.setLineWidth(0.3);
  doc.line(5, 89, 100, 89);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Address:', 9, 93);

  doc.setFontType('normal');
  doc.setFontSize(8);

  const fullAddress = `${consigneeAddress}, ${consigneePostal}, ${consigneeProvince}, ${consigneeCity}, ${consigneeState}, ${consigneeCountry}`;
  const fullAddressMatchResult = fullAddress.match(/^[\w\s!@#$%^&*()'--=,.?/]+$/g);
  if (fullAddressMatchResult === null) {
    const canvas = document.querySelector('#canvas');
    canvas.width = 5000;
    canvas.height = 400;
    const context = canvas.getContext("2d");
    context.font = "9.2em Arial";
    wrapText(context, fullAddress, 1, 95, 4000, 130, 180);
    const img64 = canvas.toDataURL("image/png", 1.0);
    doc.addImage(img64, "PNG", 9, 94, 90, 10, '', 'FAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const fullAddressSplitText = doc.splitTextToSize(fullAddress, 80);
    doc.text(fullAddressSplitText, 9, 97);
  }

  doc.setLineWidth(0.3);
  doc.line(5, 106, 100, 106);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Post Code', 9, 110);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text(consigneePostal, 42, 110);

  doc.setLineWidth(0.3);
  doc.line(40, 106, 40, 113);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Country', 69, 110);

  doc.setFontType('normal');
  doc.setFontSize(8);
  doc.text(consigneeCountry, 83, 110);

  doc.setLineWidth(0.3);
  doc.line(68, 113, 68, 106);

  doc.setLineWidth(0.3);
  doc.line(81, 113, 81, 106);

  doc.setLineWidth(0.3);
  doc.line(5, 113, 100, 113);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('Shipper Name: ', 9, 117);
  doc.setFontType('normal');
  doc.text(shipperName, 30, 117);

  if (showRemainingItems) {
    doc.setFontType('bold');
    doc.setFontSize(8);
    doc.text('Remaining Items: ', 9, 121);
    doc.setFontType('normal');
    doc.text(remainingItemDescription, 9, 125);
  }

  doc.addPage();

  let result = null;
  if (!combine) {
    doc.deletePage(listLength + 1);
    result = doc;
  } else {
    if (listLength === 1) {
      doc.deletePage(3);
    } else {
      doc.deletePage(listLength * 2 + 1);
    }
    docList.push(doc);
    result = docList;
  }

  return result;
}
