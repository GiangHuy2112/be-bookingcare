import userService from "../services/userService";
const jwt = require("jsonwebtoken");
let arrRefreshTokens = [];
const generateAccessToken = (userData) => {
  return jwt.sign(
    {
      id: userData?.id || userData?.user?.id,
      roleId: userData?.roleId || userData?.user?.roleId,
    },
    process.env.JWT_ACCESS_KEY,
    {
      expiresIn: "1h",
    }
  );
};

const generateRefreshToken = (userData) => {
  return jwt.sign(
    {
      id: userData?.id || userData.user.id,
      roleId: userData?.roleId || userData.user.roleId,
    },
    process.env.JWT_REFRESH_KEY,
    {
      expiresIn: "365d",
    }
  );
};

const requestRefreshToken = async (req, res) => {
  const refreshToken = req?.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json("You're not authenticated");
  }
  if (!arrRefreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid");
  }
  jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
    if (err) {
      console.log(err);
    }
    arrRefreshTokens = arrRefreshTokens.filter(
      (token) => token !== refreshToken
    );
    let newAccessToken = null;
    let newRefreshToken = null;
    if (user) {
      newAccessToken = generateAccessToken(user);
      newRefreshToken = generateRefreshToken(user);

      arrRefreshTokens.push(newRefreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true, // Chỉ cho phép truy cập thông qua HTTP và JavaScript không thể truy cập được
        // secure: false, // Sử dụng HTTPS để truyền cookie
        // sameSite: "none", // Giới hạn cookie chỉ được gửi trong cùng một nguồn gốc (same-site)
        // path: "/",
      });
    }
    res.status(200).json({ accessToken: newAccessToken });
  });
};

let handleLogout = async (req, res) => {
  res.clearCookie("refreshToken");
  arrRefreshTokens = arrRefreshTokens.filter(
    (token) => token !== req.cookies.refreshToken
  );
  res.status(200).json({
    status: 200,
    message: "Logged out!",
  });
};

let handleLogin = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(500).json({
      errCode: 1,
      message: "Missing inputs parameter!",
    });
  }

  let userData = await userService.handleUserLogin(email, password);
  let refreshToken = "";
  if (userData?.user?.id) {
    const accessToken = generateAccessToken(userData);
    refreshToken = generateRefreshToken(userData);
    userData.user.accessToken = accessToken;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Chỉ cho phép truy cập thông qua HTTP và JavaScript không thể truy cập được
      // secure: false, // Sử dụng HTTPS để truyền cookie
      // sameSite: "none", // Giới hạn cookie chỉ được gửi trong cùng một nguồn gốc (same-site)
      // path: "/",
    });
    arrRefreshTokens.push(refreshToken);
  }
  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData.user ? userData.user : {},
  });
};

let handleGetAllUsers = async (req, res) => {
  let id = req?.query?.id; // All, id
  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters",
      users: [],
    });
  }
  let users = await userService.getAllUsers(id);

  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

let handleCreateNewUser = async (req, res) => {
  let message = await userService.createNewUser(req.body);
  return res.status(200).json({
    message,
  });
};

let handleImportUsersCSV = async (req, res) => {
  let message = await userService.importUsersCSV(req.body);
  return res.status(200).json({
    message,
  });
};

let handleEditUser = async (req, res) => {
  let data = req.body;
  let message = await userService.updateUserData(data);
  return res.status(200).json({
    message,
  });
};
let handleDeleteUser = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await userService.deleteUser(req.body.id);
  return res.status(200).json({
    message,
  });
};

let getAllCode = async (req, res) => {
  try {
    let data = await userService.getAllCodeService(req.query.type);
    return res.status(200).json(data);
  } catch (e) {
    console.log("Get all code error: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getDetailUserById = async (req, res) => {
  try {
    let infor = await userService.getDetailUserById(req.query.id);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server...",
    });
  }
};
let getDetailAccountantById = async (req, res) => {
  try {
    let infor = await userService.getDetailAccountantById(req.query.id);
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
  handleLogin,
  handleGetAllUsers,
  handleCreateNewUser,
  handleEditUser,
  handleDeleteUser,
  getAllCode,
  handleImportUsersCSV,
  requestRefreshToken,
  handleLogout,
  getDetailUserById,
  getDetailAccountantById,
};
