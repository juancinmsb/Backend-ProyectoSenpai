const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = require("../middleware/jwt-validate");
const registro = async (req, res, next) => {
  try {
    if (req.body.mail && req.body.name && req.body.password) {
      // Formato del mail
      if (/^\S+@\S+\.\S+$/.test(req.body.mail) === false) {
        res
          .status(400)
          .json({ success: false, message: "Formato de mail incorrecto" });
        return;
      }

      const existeUser = usuarios.find((u) => {
        return u.mail === req.body.mail;
      });

      if (existeUser) {
        res.status(400).json({ success: false, message: "Mail repetido" });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      console.log("Salt", salt);
      const password = await bcrypt.hash(req.body.password, salt);

      const newUser = {
        name: req.body.name,
        mail: req.body.mail,
        password: password,
      };

      usuarios.push(newUser);

      return res.status(200).json({ success: true, newUser });
    } else {
      return res.status(400).json({
        success: false,
        message: "Faltan datos (requeridos: mail, name, password)",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = usuarios.find((u) => u.mail === req.body.mail);
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña no válida" });
    }

    // Crear el token
    const token = jwt.sign(
      {
        name: user.name,
        mail: user.mail,
      },
      TOKEN_SECRET
    );

    console.log("Login en auth");
    res.status(200).json({
      error: null,
      data: "Login exitoso",
      token,
    });
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    return res.json({ error: null, usuarios });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registro,
  login,
  getUsers,
};

const usuarios = [
  {
    name: "Cosopere",
    mail: "cosopere@mail.com",
    password: "$2b$10$ELh4b8VXjgcby0wJF0ad/.mO.SYyvul2mZcGitL61LHtNymcZcdcq",
  },
];
