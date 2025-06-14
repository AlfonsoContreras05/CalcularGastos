// variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const nombreInput = document.querySelector('#gasto');
const cantidadInput = document.querySelector('#cantidad');

const gastoListado = document.querySelector('#gastos tbody');
const categoriaInput = document.querySelector('#categoria');
const categoriaDatalist = document.querySelector('#lista-categorias');
const btnResetear = document.querySelector('#resetear');
const barraProgreso = document.querySelector('#barra-progreso');
const presupuestoForm = document.querySelector('#form-presupuesto');
const presupuestoInput = document.querySelector('#presupuesto-input');
const seccionPresupuesto = document.querySelector('#ingresar-presupuesto');

const gastoListado = document.querySelector('#gastos ul');
const categoriaInput = document.querySelector('#categoria');
const btnResetear = document.querySelector('#resetear');


//eventos
eventListeners();

function eventListeners(){
    document.addEventListener('DOMContentLoaded', cargarPresupuesto );
    formulario.addEventListener('submit', agregarGasto);

    if(presupuestoForm){
        presupuestoForm.addEventListener('submit', definirPresupuesto);
    }
    if(btnResetear){
        btnResetear.addEventListener('click', resetearApp);
    }
    // no category filter events

    if(btnResetear){
        btnResetear.addEventListener('click', resetearApp);
    }

};

//clases
class Presupuesto{
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    };

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }
    calcularRestante(){
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante();
    }
};
class UI{
    insertarPresupuesto(cantidad){
        //extrayendo valores
        const { presupuesto, restante } = cantidad;

        //agregar al html
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }
    imprimirAlerta(mensaje, tipo){
        //crear div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');
        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }

        //mensaje de error
        divMensaje.textContent = mensaje;

        //insertar en el html
        document.querySelector('.primario').insertBefore(divMensaje, formulario)

        //quitar del html

        setTimeout(()=>{
            divMensaje.remove();
        }, 3000)
    }

    mostrarGastos(gastos){
        this.limpiarHTML(); //eliminar el html previo

        gastos.forEach( gasto => {
            const { cantidad, nombre, categoria, id} = gasto;

            const fila = document.createElement('tr');
            fila.classList.add('fade-in');
            fila.dataset.id = id;

            const tdNombre = document.createElement('td');
            tdNombre.textContent = nombre;
            fila.appendChild(tdNombre);

            const tdCategoria = document.createElement('td');
            tdCategoria.textContent = categoria;
            fila.appendChild(tdCategoria);

            const tdCantidad = document.createElement('td');
            tdCantidad.classList.add('text-right');
            tdCantidad.textContent = `$ ${cantidad}`;
            fila.appendChild(tdCantidad);

            //crear un LI listado
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            //nuevoGasto.setAttribute('data-id', id);
            nuevoGasto.dataset.id = id;

            //agregar al html
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-info mr-2">${categoria}</span> <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`


            const tdAcciones = document.createElement('td');
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () => eliminarGasto(id);
            tdAcciones.appendChild(btnBorrar);
            fila.appendChild(tdAcciones);

            gastoListado.appendChild(fila);
        });
    }
    limpiarHTML(){
        while( gastoListado.firstChild){
            gastoListado.removeChild( gastoListado.firstChild)
        }
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoOBJ){
        const { presupuesto, restante} = presupuestoOBJ;
        const restanteDiv = document.querySelector('.restante');
        //comprobar 25%
        if(( presupuesto / 4 ) > restante ){
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        //comprobar 50%
        }else if(( presupuesto / 2 ) > restante ){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning'); 
        }else{
            restanteDiv.classList.remove('alert-danger','alert-warning');
            restanteDiv.classList.add('alert-success');
        }
        //si el total es cero o menor
        if(restante <= 0 ){
            ui.imprimirAlerta('Se exede de tu presupuesto', 'error');

            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
};
//instanciar 
const ui = new UI();
let presupuesto;


//funciones
function cargarPresupuesto(){
    const presupuestoLS = localStorage.getItem('presupuesto');
    const gastosLS = localStorage.getItem('gastos');

    if(presupuestoLS){
        presupuesto = new Presupuesto(presupuestoLS);
        presupuesto.gastos = gastosLS ? JSON.parse(gastosLS) : [];
        presupuesto.calcularRestante();

        ui.insertarPresupuesto(presupuesto);

        actualizarCategorias();
        actualizarBarra();
        ui.actualizarRestante(presupuesto.restante);
        ui.comprobarPresupuesto(presupuesto);
        filtrarGastos();
        seccionPresupuesto.classList.add('d-none');

        ui.mostrarGastos(presupuesto.gastos);
        ui.actualizarRestante(presupuesto.restante);
        ui.comprobarPresupuesto(presupuesto);

    }else{
        preguntarPresupuesto();
    }
}

function sincronizarStorage(){
    localStorage.setItem('presupuesto', presupuesto.presupuesto);
    localStorage.setItem('gastos', JSON.stringify(presupuesto.gastos));
}

function resetearApp(){
    localStorage.removeItem('presupuesto');
    localStorage.removeItem('gastos');
    window.location.reload();
}


function actualizarBarra(){
    const gastado = presupuesto.presupuesto - presupuesto.restante;
    const nombre = nombreInput.value;
    const cantidad = Number(cantidadInput.value);
    barraProgreso.textContent = `${porcentaje.toFixed(0)}%`;
    barraProgreso.classList.remove('bg-success','bg-warning','bg-danger');
    if(porcentaje >= 75){
        barraProgreso.classList.add('bg-danger');
    }else if(porcentaje >= 50){
        barraProgreso.classList.add('bg-warning');
    }else{
        barraProgreso.classList.add('bg-success');
    }
}

function actualizarCategorias(){
    const categorias = [...new Set(presupuesto.gastos.map(g => g.categoria).filter(Boolean))];
    if(categoriaDatalist){
        categoriaDatalist.innerHTML = '';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            categoriaDatalist.appendChild(option);
        });
    }
}

function filtrarGastos(){
    ui.mostrarGastos(presupuesto.gastos);
}


function preguntarPresupuesto(){
    seccionPresupuesto.classList.remove('d-none');
}

function definirPresupuesto(e){
    e.preventDefault();
    const presupuestoUsuario = Number(presupuestoInput.value);

    if(presupuestoUsuario <= 0 || isNaN(presupuestoUsuario)){
        ui.imprimirAlerta('Cantidad no valida', 'error');
        return;
    }
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
    sincronizarStorage();

    actualizarBarra();
    seccionPresupuesto.classList.add('d-none');
    presupuestoForm.reset();

}

//añade gastos

function agregarGasto(e){
    e.preventDefault();

    //leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    const categoria = categoriaInput.value;

    //validar
    if(nombre ==='' || cantidad === ''){
        ui.imprimirAlerta('Ambos Campos son obligatorios', 'error');
        return;
    }else if(cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('Cantidad no valida','error');
        return;
    }

    //generar un objeto gasto un object literal
    //esta sintaxis une nombre y cantidad a gasto
    const gasto = { nombre, cantidad, categoria, id: Date.now() };
    //añade gasto
    presupuesto.nuevoGasto( gasto );

    //mensaje de correcto
    ui.imprimirAlerta('Gasto agregado correctamente');


    const { gastos, restante } = presupuesto;
    sincronizarStorage();
    actualizarCategorias();
    actualizarBarra();
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    filtrarGastos();

    sincronizarStorage();

    //reinicia el formulario
    formulario.reset();

};

function eliminarGasto(id){
    //este los elimina del objeto
    presupuesto.eliminarGasto(id);

    const { gastos, restante } = presupuesto;
    sincronizarStorage();
    actualizarCategorias();
    actualizarBarra();
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    filtrarGastos();

    sincronizarStorage();

}
