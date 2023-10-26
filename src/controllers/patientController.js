import patientService from "../services/patientService";
let postBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let postPatient = async (req, res) => {
  try {
    let infor = await patientService.postPatient(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let putPatient = async (req, res) => {
  let data = req.body;
  let message = await patientService.putPatient(data);
  return res.status(200).json({
    message,
  });
};

let postVerifyBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postVerifyBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let getAllAppointments = async (req, res) => {
  try {
    let infor = await patientService.getAllAppointments();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
module.exports = {
  postBookAppointment,
  postVerifyBookAppointment,
  getAllAppointments,
  postPatient,
  putPatient,
};
