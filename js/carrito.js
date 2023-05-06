//Variable para detectar si existen valores previos en el storage
let carrito = cargarCarrito();

//Variable para trabajar con la función obtenerJSON
let productosJSON = [];

//Variable para almacenar datos al refrescar la ventana
let cantidadTotalCompra = carrito.length;

//Dentro del document ready se agrega el código generado por dom
$(document).ready(function () {
  $("#cantidad-compra").text(cantidadTotalCompra);
  //Configuración del selector para ordenar productos
  $("#seleccion option[value='pordefecto']").attr("selected", true);
  $("#seleccion").on("change", ordenarProductos);

  //Llamado a las funciones que necesitan renderizarse
  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  obtenerJSON();
  renderizarProductos();
  mostrarEnTabla();

  //Evento para que alertar si el carrito se encuentra vacío
  $("#btn-continuar").on('click', function (e) {
    if (carrito.length == 0){
      e.preventDefault();
      Swal.fire({
        icon: 'Error',
        title: 'No hay ningun ítem en el carrito',
        text: 'Agrega algún producto para continuar',
        confirmButtonColor: "#444444"
      })
    }
  });
});

//Función para el renderizado de los productos en cards
function renderizarProductos() {
  for (const producto of productosJSON) {
    $("#section-productos").append(`<div class="card-product"> 
                                    <div class="img-container">
                                    <img src="${producto.foto}" alt="${producto.nombre}" class="img-product"/>
                                    </div>
                                    <div class="info-producto">
                                    <p class="font">${producto.nombre}</p>
                                    <strong class="font">$${producto.precio}</strong>
                                    <button class="botones" id="btn${producto.id}"> Agregar al carrito </button>
                                    </div>
                                    </div>`);

    $(`#btn${producto.id}`).on('click', function () {
      agregarAlCarrito(producto);
    });
  }
};

//Función con AJAX para obtener información de los productos creados en el archivo json
function obtenerJSON() {
  $.getJSON("../json/productos.json", function (respuesta, estado) {
    if (estado == "success") {
    productosJSON = respuesta;
    renderizarProductos();
    }
  });
}

//Función para ordenar productos según precio y orden alfabético
function ordenarProductos() {
  let seleccion = $("#seleccion").val();
  if (seleccion == "menor") {
    productosJSON.sort(function (a, b) {
      return a.precio - b.precio
    });
  } else if (seleccion == "mayor") {
    productosJSON.sort(function (a, b) {
      return b.precio - a.precio
    });
  } else if (seleccion == "alfabetico") {
    productosJSON.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }
  //Nuevo renderizado luego del reordenamiento
  $(".card-product").remove();
  renderizarProductos();
}

//Clase para cargar productos en el carrito y modificar sus cantidades
class ProductoCarrito {
  constructor(prod) {
    this.id = prod.id;
    this.foto = prod.foto;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.cantidad = 1;
  }
}

//Función para agregar productos al carrito, modificando el modal con el detalle del carrito
function agregarAlCarrito(productoAgregado) {
  let encontrado = carrito.find(p => p.id == productoAgregado.id);
  if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
    Swal.fire({
      icon: 'success',
      title: 'Nuevo producto agregado al carrito',
      text: productoAgregado.nombre,
      confirmButtonColor: "#444444"
    });

    //Agregado de nueva fila a la tabla de carrito en caso de que el producto no se encontrara 
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);

  } else {
    //Busco en el carrito la posición del producto y despues incremento su cantidad
    let posicion = carrito.findIndex(p => p.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
    Swal.fire({
      icon: 'success',
      title: 'Nuevo producto agregado al carrito',
      text: productoAgregado.nombre,
      confirmButtonColor: "#444444"
    });
  }

  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarEnTabla();
}

//Función para rehacer la tabla del modal cada vez que se refresca la página y se eliminen productos del carrito
function mostrarEnTabla() {
  $("#tablabody").empty();
  for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                            <td> ${prod.nombre}</td>
                            <td id='${prod.id}'> ${prod.cantidad}</td>
                            <td> ${prod.precio}</td>
                            <td><button class='btn btn-light' id="eliminar${prod.id}">🗑️</button></td>
                            </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
      let eliminado = carrito.findIndex(p => p.id == prod.id);
      carrito.splice(eliminado, 1);
      console.log(eliminado);
      $(`#fila${prod.id}`).remove();
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })
  }
};

//Función para calcular el monto total del carrito y la cantidad
function calcularTotalCarrito() {
  let total = 0;
  for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
  }
  $("#montoTotalCompra").text(total);
  $("#cantidad-compra").text(carrito.length);
  return total;
}

//Función para traer el carrito cargado cada vez que se refresca la página
function cargarCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (carrito == null) {
    return [];
  } else {
    return carrito;
  }
}
