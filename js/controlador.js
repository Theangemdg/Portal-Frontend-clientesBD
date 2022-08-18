//FUNCIONES PARA EVALUAR LOS FORMULARIOS
const formulario = document.getElementById("modalBodyR");
const inputs = document.querySelectorAll("#modalBodyR input");
var numeroUsers = "";

const expresiones = {
  usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, numeros, guion y guion_bajo
  nombre: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // Letras y espacios, pueden llevar acentos.
  apellido: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // Letras y espacios, pueden llevar acentos.
  password: /^.{4,12}$/, // 4 a 12 digitos.
  correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
  telefono: /^\d{7,14}$/, // 7 a 14 numeros.
  edad: /^\d{1,3}$/, // 1 a 3 numeros.
};

function limpiarInputs() {
  document.getElementById("txt-nombre").value = "";
  document.getElementById("txt-apellido").value = "";
  document.getElementById("txt-edad").value = "";
  document.getElementById("txt-telefono").value = "";
  document.getElementById("txt-correo").value = "";
  document.getElementById("txt-contraseña").value = "";
  document.getElementById("txt-correoI").value = "";
  document.getElementById("txt-contraS").value = "";
}
limpiarInputs();

const validarFormulario = (e) => {
  switch (e.target.name) {
    case "nombre":
      validarCampo(expresiones.nombre, e.target, "nombre");
      break;
    case "correo":
      validarCampo(expresiones.correo, e.target, "correo");
      break;
    case "contraseña":
      validarCampo(expresiones.password, e.target, "contraseña");
      break;
    case "apellido":
      validarCampo(expresiones.apellido, e.target, "apellido");
      break;
    case "edad":
      validarCampo(expresiones.edad, e.target, "edad");
      break;
    case "telefono":
      validarCampo(expresiones.telefono, e.target, "telefono");
      break;
  }
};

const validarCampo = (expresion, input, campo) => {
  if (expresion.test(input.value)) {
    document
      .getElementById(`txt-${campo}`)
      .classList.remove("cajainfo-R-Texto-incorrecto");
    document
      .getElementById(`txt-${campo}`)
      .classList.add("cajainfo-R-Texto-correcto");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.remove("input-error-activo");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.remove("input-error-activo");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.remove("input-error-activo");
  } else {
    document
      .getElementById(`txt-${campo}`)
      .classList.remove("cajainfo-R-Texto-correcto");
    document
      .getElementById(`txt-${campo}`)
      .classList.add("cajainfo-R-Texto-incorrecto");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.add("input-error-activo");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.add("input-error-activo");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.add("input-error-activo");
    document
      .querySelector(`#grupo-${campo} .input-error`)
      .classList.add("input-error-activo");
  }
};

axios({
  method: "GET",
  url: "http://localhost/Backend-portalBD/api/usuarios.php?numeroUser="+0,
  responseType: "json",
})
  .then((res) => {
    numeroUsers = res.data.usuarios;
    console.log(parseInt(numeroUsers));
  })
  .catch((err) => {
    console.log(err);
  });

inputs.forEach((input) => {
  input.addEventListener("keyup", validarFormulario);
  input.addEventListener("blur", validarFormulario);
});
//FIN EVALUAR FORMULARIO

//AGREGAR USUARIOS
function agregarUsuario() {
  let txtNombre = document.getElementById("txt-nombre").value;
  let txtCorreo = document.getElementById("txt-correo").value;
  let txtApellido = document.getElementById("txt-apellido").value;
  let txtEdad = document.getElementById("txt-edad").value;
  let txtTelefono = document.getElementById("txt-telefono").value;
  let txtContraseña = document.getElementById("txt-contraseña").value;

  if (
    txtNombre &&
    txtCorreo &&
    txtContraseña &&
    txtApellido &&
    txtEdad &&
    txtTelefono
  ) {
    let usuario = {
      id_usuario: parseInt(numeroUsers)+1,
      nombre: txtNombre,
      apellido: txtApellido,
      edad: txtEdad,
      telefono: txtTelefono,
      correo: txtCorreo,
      contraseña: txtContraseña,
    };

    axios({
      method: "POST",
      url: "http://localhost/Backend-portalBD/api/usuarios.php",
      responseType: "json",
      data: usuario,
    })
      .then((res) => {
        console.log(res.data);
        iniciarUsuarioRegistrado();
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Debes rellenar todos los campos!",
      confirmButtonColor: "#4c4175",
    });
  }
}

//FUNCION PARA INGRESAR AL MENU PRINCIPAL
function ingresar() {
  var ucorreo = "";
  var contraseña = "";
  let bAcceso = false;

  ucorreo = document.getElementById("txt-correoI").value;
  contraseña = document.getElementById("txt-contraS").value;

  console.log(ucorreo);
  console.log(contraseña);

  axios({
    url: "http://localhost/Backend-portalBD/api/usuarios.php",
    method: "get",
    responseType: "json",
  })
    .then((res) => {
      console.log(res.data.length);
      for (let i = 0; i < res.data.length; i++) {
        if (
          res.data[i].correo == ucorreo &&
          res.data[i].contraseña == contraseña
        ) {
          bAcceso = true;
          sessionStorage.setItem("Usuario activo", JSON.stringify(res.data[i]));
          break;
        }
      }
      if (bAcceso) {
        window.location = "../Htmls/menu-cliente.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Credenciales erroneas!",
          confirmButtonColor: "#4c4175",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(bAcceso);
}

function iniciarUsuarioRegistrado() {
  var ucorreo = "";
  var contraseña = "";
  let bAcceso = false;

  ucorreo = document.getElementById("txt-correo").value;
  contraseña = document.getElementById("txt-contraseña").value;
  console.log(ucorreo);
  console.log(contraseña);

  axios({
    url: "http://localhost/Backend-portalBD/api/usuarios.php",
    method: "get",
    responseType: "json",
  })
    .then((res) => {
      console.log(res.data.length);
      for (let i = 0; i < res.data.length; i++) {
        if (
          res.data[i].correo == ucorreo &&
          res.data[i].contraseña == contraseña
        ) {
          bAcceso = true;
          sessionStorage.setItem("Usuario activo", JSON.stringify(res.data[i]));
          break;
        }
      }
      if (bAcceso == true) {
        window.location = "../Htmls/menu-cliente.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Credenciales erroneas!",
          confirmButtonColor: "#4c4175",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(bAcceso);
}

//FIN INICIAR SESION O REGISTRO
