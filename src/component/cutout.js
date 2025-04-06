import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css"; // Ensure this is imported
import { registerAllModules } from "handsontable/registry";
import axios from "axios";
import { HyperFormula } from "hyperformula";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { download } from "../utiles/download";
// import { SetColumnOrderUndoEntry } from "hyperformula/typings/UndoRedo";

registerAllModules();

const CutOut = () => {
  const [data, setData] = useState([]);
  const [plantName, SetPlantName] = useState("Select Plant");
  const [isUpdatable, SetIsUpdatable] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [bull, setBull] = useState(0);
  const [heifer, setHeifer] = useState(0);
  const [cow, setCow] = useState(0);
  const [euRate, setEURate] = useState(0);
  const [lotNum, setLotNum] = useState("");
  const [isGetAll, setIsGetAll] = useState(1);
  useEffect(() => {
    SetPlantName("Select Plant");
    setBull(0);
    setHeifer(0);
    setCow(0);
    setEURate(0);
    setLotNum(0);
    // setSelectedFileName("");
  }, [data]);

  const hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: "internal-use-in-handsontable",
  });

  const handleChangeOnPlant = (e) => {
    SetPlantName(e.target.value);
  };
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name); // Save the file name
      // Proceed with your upload logic
    }
    const file = e.target.files[0];
    if (file) {
      e.target.value = null;

      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        // Get the first sheet
        const sheetName =
          workbook.SheetNames.length > 1
            ? workbook.SheetNames[1]
            : workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Ensure data has 52 columns by padding empty values
        const paddedData = jsonData.map((row) => {
          const newRow = [...row];
          while (newRow.length < 52) {
            newRow.push(null);
          }
          return newRow;
        });
        setData(paddedData);
        SetIsUpdatable(0);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleGet = () => {
    if (lotNum === "" || lotNum === 0) {
      console.log(lotNum);
      toast.error("You didn't type Lot Number!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return 0;
    }
    axios
      .get(`api/cutout/${lotNum}`)
      .then((res) => {
        setData(res.data.msg);
        setIsGetAll(0);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Server error!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
  };

  const handleGetAll = () => {
    axios
      .get(`api/cutout`)
      .then((res) => {
        setData(res.data.msg);
        setIsGetAll(1);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Server error!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
  };

  const handleDelete = () => {
    if (lotNum === "" || lotNum === 0) {
      console.log(lotNum);
      toast.error("You didn't type Lot Number!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return 0;
    }
    if (isGetAll === 1) {
      toast.error("You can't clear table!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return 0;
    }
    axios
      .delete(`api/cutout/${lotNum}`)
      .then((res) => {
        if (res.data.msg > 0) {
          toast.success("Deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
        } else {
          toast.error("No records found to delete", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Server error!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
  };

  const uploadExcel = () => {
    if (plantName === "Select Plant") {
      toast.error("You didn't select the correct Plant Name!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    } else {
      // Convert data back to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      // Convert workbook to binary and create a Blob
      const workbookBinary = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const workbookBlob = new Blob([workbookBinary], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      var formData = new FormData();
      formData.append("cutout", workbookBlob, "cutout.xlsx"); // Provide a filename
      const dataObject = {
        plant_name: plantName,
        bull_amount: bull,
        heifer_amount: heifer,
        cow_amount: cow,
        eu_rate: euRate,
      };
      formData.append("data", JSON.stringify(dataObject));
      formData.append("plant_name", plantName);
      formData.append("bull_amount", bull);
      formData.append("heifer_amount", heifer);
      formData.append("cow_amount", cow);
      formData.append("eu_rate", euRate);
      axios
        .post(`/api/cutout/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (typeof res.data.msg == "string") {
            toast.error(res.data.msg, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: true,
            });
            return 0;
          }
          setData(res.data.msg);
          SetIsUpdatable(1);
          setIsGetAll(0);

          toast.success(
            "You uploaded this data successfully! Please check your uploaded result",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
            }
          );
        })
        .catch((error) => {
          console.error(error);
          toast.error("Something was wrong data!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
        });
    }
  };

  const updateExcel = () => {
    if (isUpdatable !== 2) {
      toast.error("You didn't anything change!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return 0;
    } else {
      if (isGetAll === 1) {
        toast.error(
          "You can't update in this Mode! Please try it getting data with single Lot Number.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          }
        );
        return 0;
      }
      axios
        .put(`/api/cutout/`, { data: data })
        .then((res) => {
          toast.success("Your data was updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
          SetIsUpdatable(0);
        })
        .catch((error) => {
          console.error(error);
          toast.error("Something was wrong!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
          });
          SetIsUpdatable(1);
        });
    }
  };
  const handleBull = (e) => {
    setBull(e.target.value);
  };
  const handleHeifer = (e) => {
    setHeifer(e.target.value);
  };
  const handleCow = (e) => {
    setCow(e.target.value);
  };
  const handleEURate = (e) => {
    setEURate(e.target.value);
  };
  const handleLotNum = (e) => {
    setLotNum(e.target.value);
  };
  return (
    <div style={{ padding: "20px" }}>
      {data.length > 0 ? (
        <>
          <ToastContainer />
          <div className="table-wrapper">
            <HotTable
              licenseKey="non-commercial-and-evaluation"
              data={data}
              colHeaders={true}
              rowHeaders={true}
              filters={true}
              dropdownMenu={true}
              multiColumnSorting={true}
              width="100%"
              height="100%"
              manualColumnResize={true}
              formulas={{
                engine: hyperformulaInstance,
              }}
              afterChange={(changes) => {
                if (changes) {
                  const updatedData = [...data];
                  changes.forEach(([row, col, oldValue, newValue]) => {
                    updatedData[row][col] = newValue;
                  });
                  setData(updatedData);
                  if (isUpdatable > 0) {
                    SetIsUpdatable(2);
                  }
                }
              }}
            />
          </div>
          <div className="container">
            <div className="header">
              {/* File Upload */}
              <div className="flex-group">
                <label htmlFor="fileInput" className="btn btn-outline-success">
                  Choose
                </label>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
                {/* <div className="form-control" style={{width: "50%", height: "10%"}}>
                  {selectedFileName || "No file chosen"}
                </div> */}
              </div>

              {/* Upload Button */}
              <button
                className="btn btn-outline-success btn-md"
                style={{ height: "38px" }}
                onClick={uploadExcel}
              >
                Upload
              </button>
              {/* Dropdown and Inputs */}
              <select
                value={plantName}
                onChange={handleChangeOnPlant}
                className="form-select"
              >
                <option value="Select Plant">Select Plant</option>
                <option value="CPM">CPM</option>
                <option value="BMP">BMP</option>
                <option value="PFF">PFF</option>
                <option value="BVY">BVY</option>
                <option value="LNTZ">LNTZ</option>
              </select>

              <div className="flex-group">
                <label>Bull:</label>
                <input
                  type="number"
                  onChange={handleBull}
                  value={bull}
                  className="form-control"
                />
                <label>Heifer:</label>
                <input
                  type="number"
                  onChange={handleHeifer}
                  value={heifer}
                  className="form-control"
                />
                <label>Cow:</label>
                <input
                  type="number"
                  onChange={handleCow}
                  value={cow}
                  className="form-control"
                />
              </div>

              <div className="flex-group">
                <label>EU Rate:</label>
                <input
                  type="number"
                  step="0.01"
                  onChange={handleEURate}
                  value={euRate}
                  className="form-control"
                />
              </div>
            </div>

            <div className="actions">
              <div className="flex-group">
                <label>Lot Number:</label>
                <input
                  type="text"
                  onChange={handleLotNum}
                  value={lotNum}
                  className="form-control"
                />
                <button className="btn btn-outline-success" onClick={handleGet}>
                  Get
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={updateExcel}
                >
                  Update
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>

              <div className="flex-group">
                <button
                  className="btn btn-outline-success"
                  onClick={handleGetAll}
                >
                  Get All
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => download(data)}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="input-group mb-3">
          <label
            className="input-group-text btn btn-primary"
            htmlFor="fileInput"
          >
            Choose 1aCutOut
          </label>
          <input
            type="file"
            id="fileInput"
            className="form-control"
            style={{ display: "none" }} // Hide the default file input
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <div className="form-control" style={{ pointerEvents: "none" }}>
            {selectedFileName || "No file chosen"}
          </div>
        </div>
      )}
    </div>
  );
};

export default CutOut;
