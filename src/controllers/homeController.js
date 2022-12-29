import db from "../models/index";
import CRUDService from "../services/CRUDService";
const getHomePage = async (req, res) => {
  try {
    // let data = await db.User.findAll();
    return res.render("homePage.ejs", {
      data: JSON.stringify({}),
    });
  } catch (e) {
    console.log(e);
  }
};

const getCRUD = async (req, res) => {
  return res.render("crud.ejs");
};

const postCRUD = async (req, res) => {
  let message = await CRUDService.createNewUser(req.body);
  console.log(message);
  return res.send(req.body);
};

const displayGetCRUD = async (req, res) => {
  let data = await CRUDService.getAllUser();
  return res.render("displayCRUD.ejs", {
    dataTable: data,
  });
};

const getEditCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    let userData = await CRUDService.getUserInfoById(userId);

    // check user data not found
    // if()
    return res.render("editCRUD.ejs", { user: userData });
  } else {
    return res.send("User not found");
  }
};

const putCRUD = async (req, res) => {
  let data = req.body;
  let allUser = await CRUDService.updateUserData(data);
  return res.render("displayCRUD.ejs", {
    dataTable: allUser,
  });
};

const deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    let allUser = await CRUDService.deleteUserById(id);
    if (allUser) {
      return res.render("displayCRUD.ejs", {
        dataTable: allUser,
      });
    } else {
      return res.send("User not found");
    }
  } else {
    return res.send("User not found");
  }
};

module.exports = {
  getHomePage,
  getCRUD,
  postCRUD,
  displayGetCRUD,
  getEditCRUD,
  putCRUD,
  deleteCRUD,
};
