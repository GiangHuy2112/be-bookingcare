import doctorService from "../services/doctorService";
let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) {
    limit = 10;
  }
  try {
    let response = await doctorService.getTopDoctorHome(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...???",
    });
  }
};
let getAllDoctors = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctors();
    return res.status(200).json(doctors);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let getAllDoctorsIncludeImage = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctorsIncludeImage();
    return res.status(200).json(doctors);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let postInforDoctor = async (req, res) => {
  try {
    let response = await doctorService.saveDetailInforDoctor(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let getDetailDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getDetailDoctorById(req.query.id);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let bulkCreateSchedule = async (req, res) => {
  try {
    let infor = await doctorService.bulkCreateSchedule(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let editSchedule = async (req, res) => {
  let data = req.body;
  let message = await doctorService.editSchedule(data);
  return res.status(200).json({
    message,
  });
};
let getScheduleByDate = async (req, res) => {
  try {
    let infor = await doctorService.getScheduleByDate(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let getExtraInforDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getExtraInforDoctorById(req.query.doctorId);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let getProfileDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getProfileDoctorById(req.query.doctorId);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let getListMedicalBillForDoctor = async (req, res) => {
  try {
    let infor = await doctorService.getListMedicalBillForDoctor(
      req.query.doctorId,
      req.query.date,
      req.query.type
    );
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let sendRemedy = async (req, res) => {
  try {
    let response = await doctorService.sendRemedy(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let cancelRemedy = async (req, res) => {
  try {
    let response = await doctorService.cancelRemedy(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let getAllAccountants = async (req, res) => {
  try {
    console.log("controller: ", req.query.doctorId);
    let infor = await doctorService.getAllAccountants(req.query.doctorId);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};

let handleCreateNewAccountant = async (req, res) => {
  let message = await doctorService.handleCreateNewAccountant(req.body);
  return res.status(200).json({
    message,
  });
};
let handleEditAccountant = async (req, res) => {
  let data = req.body;
  let message = await doctorService.updateAccountantData(data);
  return res.status(200).json({
    message,
  });
};
let handleDeleteAccountant = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await doctorService.deleteAccountant(req.body.id);
  return res.status(200).json({
    message,
  });
};
let putBookAppointment = async (req, res) => {
  let data = req.body;
  let message = await doctorService.putBookAppointment(data);
  return res.status(200).json({
    message,
  });
};
let handleDeleteBookAppointment = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await doctorService.deleteBooking(req.body.id);
  return res.status(200).json({
    message,
  });
};
let handleConfirmExaminedAppointment = async (req, res) => {
  console.log(req.body);
  if (!req.body.data) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await doctorService.confirmExaminedAppointment(
    req.body.data?.id?.bookingId
  );
  return res.status(200).json({
    message,
  });
};

module.exports = {
  getTopDoctorHome,
  getAllDoctors,
  postInforDoctor,
  getDetailDoctorById,
  bulkCreateSchedule,
  getScheduleByDate,
  getExtraInforDoctorById,
  getProfileDoctorById,
  getListMedicalBillForDoctor,
  sendRemedy,
  getAllDoctorsIncludeImage,
  cancelRemedy,
  editSchedule,
  getAllAccountants,
  handleCreateNewAccountant,
  handleEditAccountant,
  handleDeleteAccountant,
  handleDeleteBookAppointment,
  putBookAppointment,
  handleConfirmExaminedAppointment,
};
