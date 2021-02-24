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

export const getKerryLogisticsDoc = (combine, listLength, docList, doc, item, services, shipperDetails) => {
  console.log("getKerryLogisticsDoc")
  let trackingNo = item.tracking_no;
  let pickupAddress = item.pickup_address;
  let pickupCountry = item.pickup_country;
  let shipperName = shipperDetails.shipper_name;
  let consigneeCountry = item.consignee_country;
  let consigneeName = item.consignee_name;
  let consigneeAddress = item.consignee_address;
  let consigneePostal = item.consignee_postal ? item.consignee_postal : '';
  let consigneeCity = item.consignee_city ? item.consignee_city : '';
  let consigneeProvince = item.consignee_province ? item.consignee_province : '';
  let consigneeState = item.consignee_state ? item.consignee_state : '';
  let orderWeight = item.order_weight;
  let shipperOrderId = item.shipper_order_id ? item.shipper_order_id : 'N/A';
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

  JsBarcode('#barcode', trackingNo, {
    // format: "CODE39",
    width: 3,
    fontSize: 50
  });
  const img = document.querySelector('#barcode');
  const imgData = img.src;
  doc.addImage(imgData, "PNG", 11, 43, 85, 18, '', 'FAST');

  doc.setLineWidth(0.3);
  doc.line(5, 64, 100, 64);

  doc.setFontSize(8);
  doc.setFontType('bold');
  doc.text(`FROM: ${pickupCountry}`, 10, 69);
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
    doc.addImage(img64, "PNG", 10, 71, 40, 10, '', 'FAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const fromAddressTextSplitText = doc.splitTextToSize(fromAddressText, 35);
    doc.text(fromAddressTextSplitText, 10, 73);
  }

  doc.setLineWidth(0.3);
  doc.line(52, 64, 52, 85);

  doc.setFontSize(8);
  doc.setFontType('bold');
  doc.text(`TO: ${consigneeCountry}`, 55, 69);
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
    doc.addImage(img64, "PNG", 55, 71, 40, 10, '', 'FAST');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const toAddressTextSplitText = doc.splitTextToSize(toAddressText, 35);
    doc.text(toAddressTextSplitText, 55, 73);
  }

  doc.setLineWidth(0.3);
  doc.line(5, 85, 100, 85);

  doc.setFontSize(8);
  doc.setFontType('bold');
  doc.text('ITEM DESCRIPTION: ', 10, 90);
  doc.setFontType('normal');
  if (itemCategory.length > 15) {
    itemCategory = itemCategory.substring(0, itemCategory.split(',', 2).join(',').length + 1) + '\n' + itemCategory.substring(itemCategory.split(',', 2).join(',').length + 1).trim();
  }
  const itemCategorySplitText = doc.splitTextToSize(itemCategory, 50);
  doc.text(itemCategorySplitText, 10, 96);

  doc.setFontType('bold');
  doc.text('PAYMENT TYPE: ', 10, 104);
  const incoterm = item.incoterm;
  if (paymentType === 'prepaid') {
    doc.setFontType('normal');
    doc.text('prepaid', 10, 110);

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
    const itemPriceCurrency = itemList[0].item_price_currency;
    doc.setFontType('bold');
    doc.setFontSize(8);
    doc.text('COD - please collect\n' + codAmtToCollect + ' ' + itemPriceCurrency + ' from consignee.', 10, 110);
  }

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('SHIPPER ORDER ID: ', 10, 118);
  doc.setFontType('normal');
  doc.text(shipperOrderId, 39, 118);

  doc.setFontType('bold');
  doc.text('ITEM QUANTITY: ', 55, 90);
  doc.setFontType('normal');
  doc.setFontSize(12);
  doc.text(itemQuantity.toString(), 55, 97);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('TOTAL WEIGHT: ', 55, 104);
  doc.setFontType('normal');
  doc.setFontSize(12);
  doc.text(orderWeight + 'KG', 55, 111);

  doc.setLineWidth(0.3);
  doc.line(5, 121, 100, 121);

  doc.setFontType('bold');
  doc.setFontSize(8);
  doc.text('For Kerry Logistics', 39, 125);

  const externalTrackingNosList = item.external_tracking_nos;
  const trackingNoForSecondBarcode = !_.isEmpty(externalTrackingNosList) ? externalTrackingNosList[0] : trackingNo;
  JsBarcode('#secondBarcode', trackingNoForSecondBarcode, {
    // format: "CODE39",
    width: 3,
    fontSize: 50
  });
  const secondBarcodeImg = document.querySelector('#secondBarcode');
  const secondBarcodeImgData = secondBarcodeImg.src;
  doc.addImage(secondBarcodeImgData, "PNG", 9, 127, 87, 15, '', 'FAST');

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
