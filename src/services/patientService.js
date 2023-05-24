import db from "../models/index";
import _ from "lodash";
import emailService from "./emailService";
require("dotenv").config();
import { v4 as uuidv4 } from "uuid";
const { Op } = require("sequelize");

let buildUrlEmail = (doctorId, token) => {
  let result = "";
  result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let postBookAppointment = (data) => {
  console.log(data);
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address ||
        !data.phoneNumber ||
        !data.reason
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        // Update patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            address: data.address,
            gender: data.selectedGender,
            firstName: data.fullName,
          },
        });

        // Create a booking record
        console.log("check user: ", user[0]);

        if (user && user[0]) {
          let token = uuidv4();
          let booking = await db.Booking.findOne({
            where: {
              patientId: user[0].id,
              [Op.or]: [{ statusId: "S1" }, { statusId: "S2" }],
            },
          });

          if (!booking) {
            await db.Booking.findOrCreate({
              where: { patientId: user[0].id, statusId: { [Op.not]: "S3" } },
              defaults: {
                statusId: "S1",
                doctorId: data.doctorId,
                patientId: user[0].id,
                date: data.date,
                timeType: data.timeType,
                token: token,
                phoneNumberPatient: data.phoneNumber,
                reason: data.reason,
              },
            });
            await emailService.sendSimpleEmail({
              reciverEmail: data.email,
              patientName: data.fullName,
              time: data.timeString,
              doctorName: data.doctorName,
              phoneNumber: data.phoneNumber,
              language: data.language,
              reason: data.reason,
              redirectLink: buildUrlEmail(data.doctorId, token),
            });
            resolve({
              errCode: 0,
              errMessage: "Save infor patient successfully",
            });
          } else {
            resolve({
              errCode: 2,
              errMessage: "Appointment already exists",
            });
          }
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.doctorId || !data.token) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: { doctorId: data.doctorId, token: data.token, statusId: "S1" },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            message: "Update the appointment successfully",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllAppointments = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Booking.findAll({
        where: {
          [Op.or]: [{ statusId: "S1" }, { statusId: "S2" }],
        },
        attributes: ["date", "timeType"],
      });
      resolve({
        errCode: 0,
        message: "Ok",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  postBookAppointment,
  postVerifyBookAppointment,
  getAllAppointments,
};
