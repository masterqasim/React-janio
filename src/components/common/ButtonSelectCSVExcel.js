import React, { useState } from "react";
import csv from "csvtojson";
// import readXlsxFile from "read-excel-file";
import XLSX from "xlsx";
import ReactFileReader from "react-file-reader";

const ButtonSelectCSVExcel = ({ handleResult, text, disabled, className }) => {
  const textLower = text && text.toLowerCase()
  const [state, setState] = useState({
    fileLoaded: false,
    fileName: ""
  });

  const readCSVFile = file => {
    const reader = new FileReader();
    reader.onload = () => {
      setState({
        fileLoaded: true
      });

      const jsonObjects = [];

      csv()
        .fromString(reader.result)
        .on("json", obj => {
          jsonObjects.push(obj);
        })
        .on("done", error => {
          handleResult(jsonObjects, file);
        });
    };
    reader.readAsText(file);
  };
  const readExcelFile = async file => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = () => {
      setState({
        fileLoaded: true
      });

      const bstr = reader.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA : true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonObjects = XLSX.utils.sheet_to_json(ws, {defval: ''});
      handleResult(jsonObjects, file);
    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    };
  };

  const handleFiles = files => {
    const file = files[0];
    const filenameLower = file.name.toLowerCase()

    if (filenameLower.endsWith(".csv")) {
      readCSVFile(file);
    } else if (filenameLower.endsWith(".xlsx")) {
      readExcelFile(file);
    }
  };

  return (
    <div>
      <ReactFileReader
        handleFiles={handleFiles}
        fileTypes={[".csv", ".xlsx"]}
        multipleFiles={false}
      >
        <button
          type="button"
          style={{ background: "#050593", paddingLeft: 30, paddingRight: 30 }}
          className={className || "btn btn-primary"}
          disabled={disabled}
        >
          {state.fileName || text || "Select CSV"}
          {textLower.endsWith(".csv") || textLower.endsWith(".xlsx") ? (<i style={{ paddingLeft: 8 }} className="fas fa-upload"></i>) : "" }
        </button>
      </ReactFileReader>
    </div>
  );
};

export default ButtonSelectCSVExcel;
