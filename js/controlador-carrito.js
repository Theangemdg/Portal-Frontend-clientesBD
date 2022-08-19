var clienteActivo = JSON.parse(sessionStorage.getItem("Usuario activo"));
console.log(clienteActivo);
var tipoEntrega;
listaOrdenes();

function entregaDomicilio() {
  tipoEntrega = 1;
}

function entregaRestaurante() {
  tipoEntrega = 2;
}

function listaOrdenes() {
  document.getElementById("contedor-ordenes").innerHTML = "";

  let subtotal = 0;
  let ISV = 0.15;

  axios({
    method: "get",
    url:
      "http://localhost/Backend-portalBD/api/carrito.php?id=" +
      clienteActivo.id_usuario,
    responseType: "json",
  })
    .then((res) => {
      console.log(res.data);

      for (let i = 0; i < res.data.length; i++) {
        document.getElementById("contedor-ordenes").innerHTML += `
                <div id="contenido-producto" class="shadow-lg p-3 mb-3 bg-body">
                    <img id="icono-producto" class="rounded-circle" src="${res.data[i].imagen}" alt="">
                    <div >
                        <h2>${res.data[i].nombre}</h2>
                        <h5>${res.data[i].descripcion}</h5>
                        <div class="flex-center">
                            <h2>cantidad</h2>
                            <h2>${res.data[i].cantidad}</h2>
                        </div>
                    </div>
                    <div>
                        <p>$${res.data[i].precio}</p>
                        <button class="fa-regular fa-trash-can" onclick="eliminarOrden('${res.data[i].id_producto}')"></button>
                    </div>
                </div>
                `;
        subtotal += parseFloat(res.data[i].precio);
      }

      let total = ISV * subtotal + subtotal;
      //AQUI PONER EL IF PARA VER SI ES POR ENVIO A DOMICILIO O PARA COMER EN EL RESTAURANTE

      document.getElementById("contedor-ordenes").innerHTML += `
            <div id="contenedor-detalleCompra">
                <div class="compra">
                    <h2>Sub Total</h2>
                    <p>$${subtotal}</p>
                </div>
                <div class="compra">
                    <h2>ISV</h2>
                    <p>$${ISV * subtotal}</p>
                </div>
                <div class="compra">
                    <h2>TOTAL</h2>
                    <p>$${total}</p>
                </div>
                <button id="btn-procesar" type="button" data-bs-toggle="modal" data-bs-target="#modaltipopago">Procesar Orden</button>
            </div>
            `;
      if (res.data.length !== 0) {
        document
          .getElementById("btn-procesar")
          .classList.add("aparece-btnProcesar");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function eliminarOrden(product) {
  axios({
    url:
      "http://localhost/Backend-portalBD/api/carrito.php?id=" +
      clienteActivo.id_usuario +
      "&idO=" +
      product,
    method: "delete",
    responseType: "json",
  })
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
  listaOrdenes();
}

function crearOrden() {
  let txtnombreTargeta = document.getElementById("inputNombre").value;
  let txtnumerTargeta = document.getElementById("inputNumero").value;
  let txtfechaExpiracion =
    document.getElementById("select-mes").value +
    "/" +
    document.getElementById("select-year").value;
  let txtcvv = document.getElementById("inputCVV").value;

  const hora = Date.now();
  let fecha = new Date(hora);
  
  let orden = {
    id_usuario: clienteActivo.id_usuario,
    id_empleado: parseInt((Math.random()*(8-1)+1)),
    id_tipoEntrega: 1,
    id_tipoPago: 1,
    id_estado: 1,
    fecha_orden: fecha,
  };

  if (txtnombreTargeta && txtfechaExpiracion && txtcvv && txtnumerTargeta) {
    axios({
      url: "http://localhost/Backend-portalBD/api/ordenes.php",
      method: "post",
      responseType: "json",
      data: orden
    })
      .then((res) => {
        console.log(res.data);
        let ordenAprovado = parseInt(res.data.last_id_value);

        axios({
          url:
            "http://localhost/Backend-portalBD/api/carrito.php?id=" +
            clienteActivo.id_usuario,
          method: "get",
          responseType: "json",
        })
          .then((res) => {
            let productosOd = [];
            for (let i = 0; i < res.data.length; i++) {
              productosOd.push({
                id_orden: ordenAprovado,
                id_producto: res.data[i].id_producto,
                cantidad: res.data[i].cantidad,
              });
            }

            let ordenDetallada = {
              productos: productosOd,
            };

            axios({
              url: "http://localhost/Backend-portalBD/api/ordenDetallada.php",
              method: "post",
              responseType: "json",
              data: ordenDetallada,
            })
              .then((res) => {
                console.log(res);
                vaciarCarrito();
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "debes rellenar todos los campos",
      confirmButtonColor: "#4c4175",
    });
  }
}

function crearOrdenEfectivo() {
  let hora = Date.now();
  let fecha = new Date(hora);

  let orden = {
    id_usuario: clienteActivo.id_usuario,
    id_empleado: parseInt((Math.random()*(8-1)+1)),
    id_tipoEntrega: 1,
    id_tipoPago: 1,
    id_estado: 1,
    fecha_orden: fecha,
  };

  axios({
    url: "http://localhost/Backend-portalBD/api/ordenes.php",
    method: "post",
    responseType: "json",
    data: orden,
  })
    .then((res) => {
      console.log(parseInt(res.data.last_id_value));
      let ordenAprovado = parseInt(res.data.last_id_value);

      axios({
        url:
          "http://localhost/Backend-portalBD/api/carrito.php?id=" +
          clienteActivo.id_usuario,
        method: "get",
        responseType: "json",
      })
        .then((res) => {
          let productosOd = [];
          for (let i = 0; i < res.data.length; i++) {
            productosOd.push({
              id_orden: ordenAprovado,
              id_producto: res.data[i].id_producto,
              cantidad: res.data[i].cantidad,
            });
          }

          let ordenDetallada = {
            productos: productosOd,
          };

          axios({
            url: "http://localhost/Backend-portalBD/api/ordenDetallada.php",
            method: "post",
            responseType: "json",
            data: ordenDetallada,
          })
            .then((res) => {
              console.log(res);
              vaciarCarrito();
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
     
    })
    .catch((err) => {
      console.log(err);
    });
}


function vaciarCarrito(){
  axios({
    url: "http://localhost/Backend-portalBD/api/carrito.php?id="+clienteActivo.id_usuario,
    method: "Delete",
    responseType: "json",
  })
    .then((res) => {
      console.log(res);
      window.location = "../htmls/menu-cliente.html";
    })
    .catch((err) => {
      console.log(err);
    });
}
//HERRAMIENTAS PARA LA LOCALIZACION

//FIN HERRAMIENTAS DE LOCALIZACION

//*Select para llenar el mes
for (let i = 1; i <= 12; i++) {
  let opcion = document.createElement("option");
  opcion.value = i;
  opcion.innerText = i;
  document.getElementById("select-mes").appendChild(opcion);
}

//*select para el año
const yearActual = new Date().getFullYear();
for (let i = yearActual; i < yearActual + 8; i++) {
  let opcion = document.createElement("option");
  opcion.value = i;
  opcion.innerText = i;
  document.getElementById("select-year").appendChild(opcion);
}

document.getElementById("inputNumero").addEventListener("keyup", (e) => {
  let valorInput = e.target.value;
  document.getElementById("inputNumero").value = valorInput
    //*elimina espacios
    .replace(/\s/g, "")
    //*eliminar letras
    .replace(/\D/g, "")
    // Ponemos espacio cada cuatro numeros
    .replace(/([0-9]{4})/g, "$1 ")
    // Elimina el ultimo espaciado
    .trim();
});

document.getElementById("inputNombre").addEventListener("keyup", (e) => {
  let valorInputNombre = e.target.value;
  document.getElementById("inputNombre").value = valorInputNombre.replace(
    /[0-9]/g,
    ""
  );
});

document.getElementById("inputCVV").addEventListener("keyup", (e) => {
  document.getElementById("inputCVV").value = document
    .getElementById("inputCVV")
    .value // Eliminar los espacios
    .replace(/\s/g, "")
    // Eliminar las letras
    .replace(/\D/g, "");
});
