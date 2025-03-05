const db = require("../models");
import bcrypt from "bcrypt";
const saltRounds = 10;
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

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        // User already exists
        let user = await db.User.findOne({
          where: { email: email },
          attributes: [
            "id",
            "email",
            "roleId",
            "password",
            "firstName",
            "lastName",
          ],
          raw: true,
        });
        let userAccountant = await db.Accountant.findOne({
          where: { email: email },
          attributes: [
            "id",
            "email",
            "roleId",
            "password",
            "firstName",
            "lastName",
            "doctorId",
          ],
          raw: true,
        });
        // Compare password
        if (user || userAccountant) {
          let check = await bcrypt.compareSync(
            password,
            user?.password || userAccountant?.password
          );
          if (check) {
            userData.errCode = 0;
            userData.errMessage = "OK";
            delete user?.password;
            delete userAccountant?.password;
            userData.user = user || userAccountant;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Email hoặc mật khẩu không chính xác";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = `User's not found!`;
        }
      } else {
        // Return error
        userData.errCode = 1;
        userData.errMessage = `Email hoặc mật khẩu không chính xác`;
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {

      let user = await db.User.findOne({
        where: { email: email },
      });


      let userAccountant = await db.Accountant.findOne({
        where: { email: email },
      });

      if (user || userAccountant) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Allcode,
              as: "timeTypePatient",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      users.password = users.password;
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
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

        await db.User.create({
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
        });
        console.log("hashPasswordFromBcrypt: ", hashPasswordFromBcrypt)

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

let importUsersCSV = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email is exist ?
      let check = false;
      for (let i = 0; i < data.length; i++) {
        check = await checkUserEmail(data[i].email);
        if (check) {
          check = data[i];
          break;
        }
      }

      if (check) {
        resolve({
          errCode: 1,
          errMessage: `Your email: "${check.email}" is already, Please try another email`,
        });
      } else {
        for (let i = 0; i < data.length; i++) {
          data[i].password = await hashUserPassword(data[i].password);
        }
        await db.User.bulkCreate(data);
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

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId },
      });
      if (user) {
        await db.User.destroy({
          where: { id: userId },
        });
        resolve({
          errCode: 0,
          message: "User has been deleted",
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: "User does not exist",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.roleId || !data.positionId || !data.gender) {
        resolve({
          errCode: 2,
          errMessage: "Missing required parameters",
        });
      }

      let user = null;
      if (data?.typeUser !== "R4") {
        user = await db.User.findOne({
          where: { id: data.id },
          raw: false,
        });
      } else {
        user = await db.Accountant.findOne({
          where: { id: data.id },
          raw: false,
        });
      }

      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.phoneNumber = data.phoneNumber;
        user.gender = data.gender;
        user.roleId = data.roleId;
        user.positionId = data.positionId;
        if (data?.password && data?.oldPassword) {
          let check = await bcrypt.compareSync(
            data?.oldPassword,
            user?.password
          );
          if (check) {
            user.password = await hashUserPassword(data?.password);
          } else {
            resolve({
              errCode: 2,
              message: "Mật khẩu cũ không chính xác",
            });
          }
        }
        if (data.avatar) {
          user.image = data.avatar;
        }

        await user.save();
        resolve({
          errCode: 0,
          message: "User update successful",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "User not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        let res = {};
        let allcode = await db.Allcode.findAll({
          where: { type: typeInput },
        });
        res.errCode = 0;
        res.data = allcode;
        resolve(res);
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getDetailUserById = (inputId) => {
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
          attributes: [
            "id",
            "email",
            "password",
            "firstName",
            "lastName",
            "phoneNumber",
            "address",
            "image",
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

let getDetailAccountantById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Accountant.findOne({
          where: { id: inputId },
          attributes: [
            "id",
            "email",
            "password",
            "firstName",
            "lastName",
            "phoneNumber",
            "address",
            "image",
            "gender",
            "roleId",
          ],
          include: [
            {
              model: db.User,
              as: "doctorManagement",
              attributes: ["firstName", "lastName", "positionId"],
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
module.exports = {
  handleUserLogin,
  getAllUsers,
  createNewUser,
  updateUserData,
  deleteUser,
  getAllCodeService,
  importUsersCSV,
  getDetailUserById,
  getDetailAccountantById,
};
