import db from "../models/index";
import _ from "lodash";
import emailService from "../services/emailService";
import bcrypt from "bcrypt";
require("dotenv").config();
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
const CURRENT_NUMBER = process.env.CURRENT_NUMBER;
let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Doctor_Infor,
            attributes: ["specialtyId"],
            include: [
              {
                model: db.Specialty,
                attributes: ["name"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
        // raw: true
      });
      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctorsIncludeImage = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Doctor_Infor,
            attributes: ["specialtyId"],
            include: [
              {
                model: db.Specialty,
                attributes: ["name"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let checkRequiredFields = (inputData) => {
  let arrFields = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvince",
    "nameClinic",
    "addressClinic",
    "note",
    "specialtyId",
  ];
  let element = "";
  let isValid = true;
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};

let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkRequiredFields(inputData);
      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObj.element}`,
        });
      } else {
        // Upsert to Markdown
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });
          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;
            doctorMarkdown.updatedAt = new Date();
            // console.log(
            //   "doctorMarkdown -----------------------------------------------: " +
            //     doctorMarkdown
            // );
            await doctorMarkdown.save();
          }
        }

        // Upsert to Doctor_infor table
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: { doctorId: inputData.doctorId },
          raw: false,
        });
        // !inputData.selectedPrice ||
        // !inputData.selectedPayment ||
        // !inputData.selectedProvince ||
        // !inputData.nameClinic ||
        // !inputData.addressClinic ||
        // !inputData.note
        if (doctorInfor) {
          // Update
          doctorInfor.doctorId = inputData.doctorId;
          doctorInfor.priceId = inputData.selectedPrice;
          doctorInfor.provinceId = inputData.selectedProvince;
          doctorInfor.paymentId = inputData.selectedPayment;
          doctorInfor.nameClinic = inputData.nameClinic;
          doctorInfor.addressClinic = inputData.addressClinic;
          doctorInfor.note = inputData.note;
          doctorInfor.specialtyId = inputData.specialtyId;
          doctorInfor.clinicId = inputData.clinicId;
          // console.log(
          //   "doctorInfor: ------------------------------------------------: ",
          //   doctorInfor
          // );
          await doctorInfor.save();
        } else {
          // Create
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceId: inputData.selectedPrice,
            provinceId: inputData.selectedProvince,
            paymentId: inputData.selectedPayment,
            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId,
          });
        }

        resolve({
          errCode: 0,
          message: "Save infor doctor successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.User.findOne({
          where: { id: inputId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            item.currentNumber = CURRENT_NUMBER;
            return item;
          });
        }

        // Get all existing data
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: "" + data.formattedDate },
          attributes: [
            "timeType",
            "date",
            "doctorId",
            "maxNumber",
            "currentNumber",
          ],
          raw: true,
        });

        // Compare different
        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        // Create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }
        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let editSchedule = (data) => {
  console.log(data);
  return new Promise(async (resolve, reject) => {
    try {
      let schedule = await db.Schedule.findOne({
        where: { id: data.id },
        raw: false,
      });

      if (schedule) {
        schedule.currentNumber = data.currentNumber;
        await schedule.save();
        resolve({
          errCode: 0,
          message: "Schedule update successful",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Schedule not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: { doctorId: doctorId, date: date },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!dataSchedule) {
          dataSchedule = [];
        }
        resolve({
          errCode: 0,
          data: dataSchedule,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getExtraInforDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: { doctorId: doctorId },
          attributes: {
            exclude: ["id", "doctorid"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let data = await db.User.findOne({
          where: { id: inputId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch {
      reject(e);
    }
  });
};

let getListMedicalBillForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data;
        if (date !== "NaN") {
          data = await db.Booking.findAll({
            where: { doctorId: doctorId, date: date },
            include: [
              {
                model: db.User,
                as: "patientData",
                attributes: [
                  "email",
                  "firstName",
                  "address",
                  "gender",
                  "citizenIdentification",
                ],
                include: [
                  {
                    model: db.Allcode,
                    as: "genderData",
                    attributes: ["valueEn", "valueVi"],
                  },
                ],
              },
              {
                model: db.Allcode,
                as: "timeTypeDataPatient",
                attributes: ["valueEn", "valueVi"],
              },
            ],
            raw: false,
            nest: true,
          });
        } else {
          data = await db.Booking.findAll({
            where: { doctorId: doctorId },
            include: [
              {
                model: db.User,
                as: "patientData",
                attributes: ["email", "firstName", "address", "gender"],
                include: [
                  {
                    model: db.Allcode,
                    as: "genderData",
                    attributes: ["valueEn", "valueVi"],
                  },
                ],
              },
              {
                model: db.Allcode,
                as: "timeTypeDataPatient",
                attributes: ["valueEn", "valueVi"],
              },
            ],
            raw: false,
            nest: true,
          });
        }
        if (!data) {
          data = [];
        }
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // || !data.imgBase64
      if (!data.email || !data.patientId || !data.timeType || !data.conclude) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        // Update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: "S2",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S3";
          appointment.conclude = data.conclude;
          await appointment.save();
        }
        // Send email remedy
        await emailService.sendAttachment(data);
        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let cancelRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // || !data.imgBase64
      if (!data.email || !data.patientId || !data.timeType) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        // Update patient status
        let appointment = await db.Booking.destroy({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: "S2",
          },
          force: true,
        });
        // Send email cancel
        await emailService.cancelAttachment(data);
        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllAccountants = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.Accountant.findAll({
          where: { doctorId: doctorId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Allcode,
              as: "genderAccountantData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) {
          data = [];
        }
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let checkUserEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let accountant = await db.Accountant.findOne({
        where: { email: email },
      });
      if (accountant) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};
let saltRounds = 10;
let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassWord = await bcrypt.hashSync(password, saltRounds);
      resolve(hashPassWord);
    } catch (e) {
      reject(e);
    }
  });
};
let handleCreateNewAccountant = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email is exist ?
      let check = await checkUserEmail(data.email);
      if (check) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already, Please try another email",
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        let accountant = await db.Accountant.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          roleId: data.roleId,
          positionId: data.positionId,
          image: data.avatar,
          doctorId: data.doctorId,
        });
        resolve({
          errCode: 0,
          Message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateAccountantData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.roleId || !data.positionId || !data.gender) {
        resolve({
          errCode: 2,
          errMessage: "Missing required parameters",
        });
      }
      let accountant = await db.Accountant.findOne({
        where: { id: data.id },
        raw: false,
      });

      if (accountant) {
        accountant.firstName = data.firstName;
        accountant.lastName = data.lastName;
        accountant.address = data.address;
        accountant.phoneNumber = data.phoneNumber;
        accountant.gender = data.gender;
        accountant.roleId = data.roleId;
        accountant.positionId = data.positionId;
        if (data.avatar) {
          accountant.image = data.avatar;
        }
        await accountant.save();
        resolve({
          errCode: 0,
          message: "Accountant update successful",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Accountant not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let deleteAccountant = (accountantId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let accountant = await db.Accountant.findOne({
        where: { id: accountantId },
      });
      if (accountant) {
        await db.Accountant.destroy({
          where: { id: accountantId },
        });
        resolve({
          errCode: 0,
          message: "Accountant has been deleted",
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: "Accountant does not exist",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getTopDoctorHome,
  getAllDoctors,
  saveDetailInforDoctor,
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
  updateAccountantData,
  deleteAccountant,
};
