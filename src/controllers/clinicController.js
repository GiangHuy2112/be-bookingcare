import clinicService from "../services/clinicService";
let createClinic = async (req, res) => {
  try {
    let response = await clinicService.createClinic(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let editClinic = async (req, res) => {
  try {
    let response = await clinicService.editClinic(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let deleteClinic = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await clinicService.deleteClinic(req.body.id);
  return res.status(200).json({
    message,
  });
};

let getAllClinic = async (req, res) => {
  try {
    let response = await clinicService.getAllClinic();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let getDetailClinicById = async (req, res) => {
  try {
    let response = await clinicService.getDetailClinicById(req.query.id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
module.exports = {
  createClinic,
  getAllClinic,
  getDetailClinicById,
  editClinic,
  deleteClinic,
};
