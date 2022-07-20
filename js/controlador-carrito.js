var clienteActivo = JSON.parse(sessionStorage.getItem('Usuario activo'));
console.log(clienteActivo);

listaOrdenes();


function listaOrdenes() {
    document.getElementById('contedor-ordenes').innerHTML = "";
    console.log(clienteActivo.ordenes.length)

    let subtotal = 0;
    let ISV = 0.15;

    axios({
        url: 'http://localhost/Backend-portalBD/api/usuarios.php',
        method: 'get',
        responseType: 'json'
    }).then((res) => {
        for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].nombre == clienteActivo.nombre) {
                axios({
                    method: 'get',
                    url: "http://localhost/Backend-portalBD/api/ordenes.php?id=" + i,
                    responseType: 'json'
                }).then(res => {
                    console.log(res.data);
                    
                    for (let i = 0; i < res.data.length; i++) {

                        document.getElementById('contedor-ordenes').innerHTML +=
                            `
                        <div id="contenido-producto" class="shadow-lg p-3 mb-3 bg-body">
                            <img id="icono-producto" class="rounded-circle" src="${res.data[i].imgProducto}" alt="">
                            <div >
                                <h2>${res.data[i].nombreProducto}</h2>
                                <h5>${res.data[i].descripcion}</h5>
                                <div class="flex-center">
                                    <h2>cantidad</h2>
                                    <h2>${res.data[i].cantidad}</h2>
                                </div>
                            </div>
                            <div>
                                <p>$${res.data[i].precio.toFixed(2)}</p>
                                <button class="fa-regular fa-trash-can" onclick="eliminarOrden('${i}')"></button>
                            </div>
                        </div>
                        `
                        subtotal += res.data[i].precio
                    }

                    let total = ISV * subtotal + subtotal;
                    //AQUI PONER EL IF PARA VER SI ES POR ENVIO A DOMICILIO O PARA COMER EN EL RESTAURANTE


                    document.getElementById('contedor-ordenes').innerHTML +=
                        `
                    <div id="contenedor-detalleCompra">
                        <div class="compra">
                            <h2>Sub Total</h2>
                            <p>$${subtotal.toFixed(2)}</p>
                        </div>
                        <div class="compra">
                            <h2>ISV</h2>
                            <p>$${(ISV * subtotal).toFixed(2)}</p>
                        </div>
                        <div class="compra">
                            <h2>TOTAL</h2>
                            <p>$${total.toFixed(2)}</p>
                        </div>
                        <button id="btn-procesar" type="button" data-bs-toggle="modal" data-bs-target="#modalTargeta">Procesar Orden</button>
                    </div>
                    `
                    if(res.data.length !== 0){
                        document.getElementById('btn-procesar').classList.add('aparece-btnProcesar');
                    }

                }).catch(err => {
                    console.log(err);
                })
            }
        }
    }).catch(err => {
        console.log(err);
    })

}

function eliminarOrden(product) {


    axios({
        url: 'http://localhost/Backend-portalBD/api/usuarios.php',
        method: 'get',
        responseType: 'json'
    }).then((res) => {
        for(let i=0; i<res.data.length; i++){
            if (res.data[i].nombre == clienteActivo.nombre){
                axios({
                    url: 'http://localhost/Backend-portalBD/api/ordenes.php?id='+i+'&idO='+product,
                    method: 'delete',
                    responseType: 'json'
                }).then((res) => {
                    
                }).catch(err => {
                    console.log(err);
                })
                listaOrdenes();
                sessionStorage.setItem('Usuario activo', JSON.stringify(res.data[i])); 
                break; 
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function crearOrden() {
    let ICV = 0.15;
    const fechaPago = new Date();
    let txtnombreTargeta = document.getElementById('inputNombre').value;
    let txtnumerTargeta = document.getElementById('inputNumero').value;
    let txtfechaExpiracion = document.getElementById('select-mes').value + "/"+ document.getElementById('select-year').value;
    let txtcvv = document.getElementById('inputCVV').value

    axios({
        url: 'http://localhost/Backend-portalBD/api/usuarios.php',
        method: 'get',
        responseType: 'json'
    }).then((res) => {
        if(txtnombreTargeta  && txtnumerTargeta && txtfechaExpiracion && txtcvv){
            for(let i=0; i<res.data.length; i++){
                if(res.data[i].nombre == clienteActivo.nombre){
                    let numeroPedido = res.data[i].pedidos.length + 1;
                    let subtotal = 0;
                    let pedido = {
                        numeroPedido: numeroPedido,
                        usuario: res.data[i].nombre,
                        correo: res.data[i].correo,
                        fechaPago:  fechaPago.toLocaleDateString(),
                        total: "",
                        icv: "",
                        subTotal: "",
                        productos: [],
                    }
                    //for para llenar el pedido con los productos de la orden que se visualizo en el carrito de compras
                    for(let j=0; j<res.data[i].ordenes.length; j++){
                        pedido.productos.push(
                            {
                                nombreProducto: res.data[i].ordenes[j].nombreProducto,
                                cantidad: res.data[i].ordenes[j].cantidad,
                                precio: res.data[i].ordenes[j].precio
                            }
                        );
                        subtotal += res.data[i].ordenes[j].precio
                    }
                   
                    pedido.icv = ICV * subtotal;
                    pedido.subTotal = subtotal;
                    pedido.total = ICV * subtotal + subtotal;
    
                    console.log(subtotal);
                    console.log(pedido);
    
    
                    //solicitud para agregar el pedido del usuario
                    axios({
                        url: 'http://localhost/Backend-portalBD/api/pedidos.php?id='+i,
                        method: 'post',
                        responseType: 'json',
                        data: pedido
                    }).then((res) => {
                        console.log(res);
                    }).catch(err => {
                        console.log(err);
                    })
    
                    //aqui se hace la solicirud para limpiar las ordenes del carrito cuando se complete la compra
                    axios({
                        url: 'http://localhost/Backend-portalBD/api/ordenes.php?id='+i,
                        method: 'delete',
                        responseType: 'json',
                    }).then((res) => {
                        console.log(res);
                    }).catch(err => {
                        console.log(err);
                    })  
                    
                    sessionStorage.setItem('Usuario activo', JSON.stringify(res.data[i]));
                    break;
                }
            }
            window.location = "../Htmls/menu-cliente.html"
            
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Debes rellenar todos los campos!',
                confirmButtonColor: '#44bae6',
            })
        }
        
    }).catch(err => {
        console.log(err);
    })
    

}

//HERRAMIENTAS PARA LA LOCALIZACION


//FIN HERRAMIENTAS DE LOCALIZACION

//*Select para llenar el mes
for (let i = 1; i <= 12; i++) {
    let opcion = document.createElement('option')
    opcion.value = i;
    opcion.innerText = i;
    document.getElementById('select-mes').appendChild(opcion);
}

//*select para el año
const yearActual = new Date().getFullYear();
for (let i = yearActual; i < yearActual + 8; i++) {
    let opcion = document.createElement('option');
    opcion.value = i;
    opcion.innerText = i;
    document.getElementById('select-year').appendChild(opcion);
}

document.getElementById('inputNumero').addEventListener('keyup', (e) => {
    let valorInput = e.target.value;
    document.getElementById('inputNumero').value = valorInput
        //*elimina espacios
        .replace(/\s/g, '')
        //*eliminar letras
        .replace(/\D/g, '')
        // Ponemos espacio cada cuatro numeros
        .replace(/([0-9]{4})/g, '$1 ')
        // Elimina el ultimo espaciado
        .trim();


})

document.getElementById('inputNombre').addEventListener('keyup', (e) => {
    let valorInputNombre = e.target.value
    document.getElementById('inputNombre').value = valorInputNombre
        .replace(/[0-9]/g, '')
})

document.getElementById('inputCVV').addEventListener('keyup', (e) => {
    document.getElementById('inputCVV').value = document.getElementById('inputCVV').value
        // Eliminar los espacios
        .replace(/\s/g, '')
        // Eliminar las letras
        .replace(/\D/g, '');
})


