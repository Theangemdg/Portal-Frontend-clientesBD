var clienteActivo = JSON.parse(sessionStorage.getItem("Usuario activo"));
console.log(clienteActivo);

function regresarAlandingPage() {
  sessionStorage.setItem("Usuario activo", "");
  window.location = "../Htmls/index.html";
}

function obtenerCliente() {
  document.getElementById("inicarss").innerHTML =
    "Bienvenido/a " + clienteActivo.nombre;
  document.getElementById("presentacion").innerHTML =
    "Hola, " + clienteActivo.nombre;
}
obtenerCliente();

function generarCategorias() {
  axios({
    url: "http://localhost/Backend-portalBD/api/categorias.php",
    method: "get",
    responseType: "json",
  })
    .then((res) => {
      console.log(res.data);
      document.getElementById("contenedor-categorias").innerHTML = "";
      for (let i = 0; i < res.data.length; i++) {
        document.getElementById("contenedor-categorias").innerHTML += `
            <button type="button" id="Carta-categoria" class="col-5 col-sm-5 col-md-4 col-lg-3 col-xl-2" onclick="productosCategoria(${i})"  data-bs-toggle="modal" data-bs-target="#productosModal">
                <img id="icono-categoria" src="${res.data[i].icono}" class="card-img-top rounded-circle" alt="...">
                <div class="card-body">
                    <p class="card-text">${res.data[i].nombreCategoria}</p>
                </div>
            </button>
        `;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
generarCategorias();

function productosCategoria(codigocategoria) {
  document.getElementById("contenedor-productos").innerHTML = "";
  document.getElementById("productosModalLabel").innerHTML = "PORTAL";
  axios({
    url:
      "http://localhost/Backend-portalBD/api/categorias.php?id=" +
      codigocategoria,
    method: "get",
    responseType: "json",
  })
    .then((res) => {
      document.getElementById(
        "productosModalLabel"
      ).innerHTML = `${res.data.nombreCategoria}`;
      for (let i = 0; i < res.data.productos.length; i++) {
        document.getElementById("contenedor-productos").innerHTML += `
                <div id="producto">
                    <div id="btn-productos">
                        <img id="banner-producto" src="${res.data.productos[i].imgProducto}"alt="...">
                        <div id="body-producto" class="card-body">
                            <img id="logo-producto" src="${res.data.productos[i].imgProducto}" class="rounded-circle " alt="...">
                            <div>
                                <h2>${res.data.productos[i].nombreProducto}</h2>
                                <p>${res.data.productos[i].descripcion}</p>
                                <p>$${res.data.productos[i].precio}</p>
                                <button id="btn-pedir" class="rounded-pill" onclick="abrirformularioPedir(${codigocategoria},${i});">Pedir</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function abrirformularioPedir(categoria, producto) {
  document
    .getElementById("contenedor-orden1")
    .classList.toggle("abrir-categorias");
  document.getElementById("contenedor-orden1").innerHTML = "";

  axios({
    url:
      "http://localhost/Backend-portalBD/api/productos.php?id=" +
      categoria +
      "&idP=" +
      producto,
    method: "get",
    responseType: "json",
  })
    .then((res) => {
      let Pproduct = res.data.nombreProducto;
      let Pdescripcion = res.data.descripcion;
      let Pprecio = res.data.precio;
      let imagen = res.data.imgProducto;

      document.getElementById("contenedor-orden1").innerHTML = `
            <div id="contenedor-orden2">
                <div id="titulo-orden">
                    <h4 style="margin-right: 10px">${Pproduct}</h4>
                    <p style="margin-left: 10px;">${Pprecio}</p>
                </div>
                <div class="flex-orden" style="justify-content: center;">
                    <h5>Ingrese la cantidad</h5>
                    <input id="input-orden" class="rounded-pill" type="text" placeholder="123">
                </div>
                <div class="flex-orden">
                    <button id="btn-cerrarOrden" class="rounded-pill" type="button" onclick="cerrarFormulario()">Cancelar</button>
                    <button id="btn-procesarOrden" class="rounded-pill" type="button" onclick="procesarOrden('${Pproduct}','${Pdescripcion}','${Pprecio}','${imagen}')">Procesar orden</button>
                </div>
            </div>
            `;
    })
    .catch((err) => {
      console.log(err);
    });
}

function cerrarFormulario() {
  document
    .getElementById("contenedor-orden1")
    .classList.remove("abrir-categorias");
  document.getElementById("input-orden").value = "";
}

function procesarOrden(nombrePro, descriProd, Precio, imagenP) {
  let cantidad = document.getElementById("input-orden").value;
  console.log(cantidad);

  axios({
    url: "http://localhost/Backend-portalBD/api/usuarios.php",
    method: "get",
    responseType: "json",
  })
    .then((res) => {
      console.log(res);
      for (let i = 0; i < res.data.length; i++) {
        if (cantidad == "") {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Introduce la cantidad antes de prcesar la orden",
            confirmButtonColor: "#4c4175",
          });
          break;
        } else {
          if (res.data[i].nombre == clienteActivo.nombre) {
            let orden = {
              nombreProducto: nombrePro,
              imgProducto: imagenP,
              cantidad: parseInt(cantidad),
              descripcion: descriProd,
              precio: Precio * cantidad,
            };

            axios({
              method: "POST",
              url: "http://localhost/Backend-portalBD/api/ordenes.php?id=" + i,
              responseType: "json",
              data: orden,
            })
              .then((res) => {
                console.log(res.data);
              })
              .catch((err) => {
                console.log(err);
              });
            Swal.fire({
              icon: "success",
              title: "Producto agregado correctamente",
              showConfirmButton: false,
              timer: 1500,
            });
            sessionStorage.setItem(
              "Usuario activo",
              JSON.stringify(res.data[i])
            );
            cerrarFormulario();
          }
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
