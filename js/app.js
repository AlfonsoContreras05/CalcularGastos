// variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

//eventos
eventListeners();

function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto );

    formulario.addEventListener('submit', agregarGasto)
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

        //iterar sobre gastos
        gastos.forEach( gasto => {
            const { cantidad, nombre, id} = gasto;
            //crear un LI listado
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            //nuevoGasto.setAttribute('data-id', id);
            nuevoGasto.dataset.id = id;

            //agregar al html
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`

            //boton para borrar gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () =>{
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            //agregar al html
            gastoListado.appendChild(nuevoGasto);


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
            restanteDiv.classList.remove('alert-succes', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        //comprobar 50%
        }else if(( presupuesto / 2 ) > restante ){
            restanteDiv.classList.remove('alert-succes');
            restanteDiv.classList.add('alert-warning'); 
        }else{
            restanteDiv.classList.remove('alert-danger','alert-warning');
            restanteDiv.classList.add('alert-succes'); 
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
function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        window.location.reload();
    }
    //presupuesto valido
    presupuesto = new Presupuesto(presupuestoUsuario);

    ui.insertarPresupuesto(presupuesto);
}

//añade gastos

function agregarGasto(e){
    e.preventDefault();

    //leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

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
    const gasto = { nombre, cantidad, id: Date.now() };
    //añade gasto
    presupuesto.nuevoGasto( gasto );

    //mensaje de correcto
    ui.imprimirAlerta('Gasto agregado correctamente');

    //imprimir los gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    //reinicia el formulario
    formulario.reset();

};



function eliminarGasto(id){
    //este los elimina del objeto
    presupuesto.eliminarGasto(id);

    //elimina los gastos del html
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

}