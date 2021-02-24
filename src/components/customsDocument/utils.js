export const createFormData = (params, file) => {
  const formData = new FormData();
  formData.append("api_key", "243466314222934");
  formData.append("file", file);
  for (let key in params) {
    formData.append(key, params[key]);
  }
  return formData;
};

export const documentTypeValidationMessage = {
  personal_identification_front: 'Please upload your front identification card',
  personal_identification_back: 'Please upload your back identification card',
  commercial_invoice: 'Please upload your proof of purchase',
  website_link: 'Please fill up the website address',
  personal_use_form: 'Please upload the personal use form'
}

export const documentTypeLabels = {
  personal_identification_front: {
    label: "Front Card",
  },
  personal_identification_back: {
    label: "Back Card",
  },
  website_link: {
    label: "Product URL",
    help: 'E.g. https://www.adidas.com.sg/vrct-jacket/EA0372.html'
  },
  commercial_invoice: {
    label: "Proof of Purchase",
    help: 'E.g. Purchase invoice or shopping receipt'
  },
  personal_use_form: {
    label: "Personal Use Form",
  },
}

export const getNormalizeData = data => {
  console.log(data)
  let normalizedData = {}
  data.customs_document_requests.forEach(d => {
    normalizedData[d.customs_document_type] = d
  })
  return normalizedData
}