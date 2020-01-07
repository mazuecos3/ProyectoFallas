// Direccion json web
const fuentesUrl = "http://mapas.valencia.es/lanzadera/opendata/Monumentos_falleros/JSON";
let resultadoJSON;
let principalBoolean = false;
let divTodasFallas = document.createElement("div");
divTodasFallas.classList.add("fallas");

let secciones = [];
let ids = [];
let coordenadas = [];

var misCoordenadas = new Map();

let map;

//Creamos el mapa
function crearMapa() {
    map = L.map("map");

    let tilerMapUrl = 'https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=iKFTul3NW3eysK9xpmVO';
    L.tileLayer(tilerMapUrl, {
        attribution: 'Map data ©Copyright Oscar Mazuecos',
    }).addTo(map);

    L.control.scale().addTo(map);

}
//Funcion que llamamos cada vez que clickamos y va a cambiar la ubicación
//de el mapa dependiendo de la falla pulsada
function cambiarCoordinates(idFalla) {
    let capaProtectora = document.createElement("div");
    capaProtectora.id = "capaProtectora";
    document.body.appendChild(capaProtectora);
    let resultadoMapa = document.getElementById("map");
  
    //hacer el div del mapa visible
    resultadoMapa.style.visibility = "visible";
    //quitamos la funcionalidad a la ruleta para no poder ni bajar mientras el mapa este activo
    document.body.style.overflow = "hidden";
    /*console.log("normales " + misCoordenadas.get(idFalla));
    console.log("buenas " + getCoordinates(misCoordenadas.get(idFalla)));*/
    //establecer las coordenadas modificadas
    map.setView(getCoordinates(misCoordenadas.get(idFalla)), 25);
    //añadir punto de ubicación
    L.marker(getCoordinates(misCoordenadas.get(idFalla)), { draggable: true }).addTo(map);

    clicarFuera();
}


//Rellenamos losa rrays de id y cordenadas para recogerlos enteros 
//y añadimos los dos a un mapa para tener clave Id y valor la coordenda
function crearMapas() {
    for (let i = 0; i < resultadoJSON.length; i++) {

        ids.push(resultadoJSON[i].properties.id);

        coordenadas.push(resultadoJSON[i].geometry.coordinates);

    }
    for (let i = 0; i < resultadoJSON.length; i++) {

        misCoordenadas.set(ids[i], coordenadas[i]);

    }
}

function getCoordinates(coordenadas) {
    console.log(coordenadas);
    // Cambiar la la referencia espacial coordenadas
    let projection1 = '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs';
    let projection2 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
    coordenadas = proj4(projection1, projection2, coordenadas);

    return [coordenadas[1], coordenadas[0]];

}

function clicarFuera() {
    let resultadoMapa = document.getElementById("map");
    document.getElementById("capaProtectora").addEventListener("click", function(e) {
        //si es distinto de el mapa que lo esconda
        resultadoMapa.style.visibility = "hidden";
        document.body.removeChild(capaProtectora);
    });
}

function buscar() {
    // Obtenemos el JSON que esta definido.
    const fetchPromesa = fetch(fuentesUrl);

    // Cuando se resuelva la promesa.
    fetchPromesa.then(response => {
        // la pasamos a JSON.
        return response.json();
        // Y entonces.
    }).then(respuesta => {
        // resultadoJSONs.
        resultadoJSON = respuesta.features;
        principal();
        rellenarSection();
    });

}

function rellenarSection() {
    // Recogemos las secciones  las metemos en un array.
    for (let i = 0; i < resultadoJSON.length; i++) {
        let seccion = resultadoJSON[i].properties.seccion;
        //para que no se repitan dentro de el array.
        if (!secciones.includes(seccion)) {
            secciones.push(resultadoJSON[i].properties.seccion);
        }
    }
    //Ordenamos el array.
    secciones.sort();
    //declaramos la seccion y por cada iteración añadimos una option nueva
    let allSection = document.getElementById("section");

    for (let i = 0; i < secciones.length; i++) {
        let option = document.createElement("option");
        option.innerText = secciones[i];
        option.value = secciones[i];

        allSection.appendChild(option);
    }
    //console.log(secciones);
}

function principal() {


    let principalChecked = document.getElementById("fallaPrincipal").checked;

    divTodasFallas.innerHTML = "";

    let divResultados = document.getElementById("resultados");


    // Por cada uno de ellos
    resultadoJSON.forEach(fallas => {
        //Creamos un div para cada falla y le añadimos la clase.

        let divFalla;

        let secciones = document.getElementById("section");
        let fecha1 = document.getElementById("fecha1");
        let fecha2 = document.getElementById("fecha2");
        let boceto;

        // RANGO FECHAS   
        if (fecha1.value < fecha2.value &&
            fecha1.value <= fallas.properties.anyo_fundacion &&
            fecha2.value >= fallas.properties.anyo_fundacion) {
            //establecemos un boleano y dependiendo si está en true 
            //quitaremos la imagen de fondo
            principalBoolean = true;
            if (secciones.value == "Todas") {
                //Si esta pulsado el radiobutton de la falla pirncipal establecemos las fotos de las fallas principales.
                if (principalChecked) {
                    cargarFalla(fallas.properties.boceto, fallas.properties.nombre, fallas.properties.id, fallas.properties.anyo_fundacion, fallas.properties.sector);

                } //Si esta pulsado el radiobutton de la falla infantil establecemos las fotos de las fallas infantil.
                else {
                    cargarFalla(fallas.properties.boceto_i, fallas.properties.nombre, fallas.properties.id, fallas.properties.anyo_fundacion, fallas.properties.sector);

                }
                //depende de el valor de la seccion se mostrará aquellos que entren en esa seccion.
            } else if (fallas.properties.seccion == secciones.value) {
                //Si esta pulsado el radiobutton de la falla pirncipal establecemos las fotos de las fallas principales.
                if (principalChecked) {
                    cargarFalla(fallas.properties.boceto, fallas.properties.nombre, fallas.properties.id, fallas.properties.anyo_fundacion, fallas.properties.sector);
                }
                //Si esta pulsado el radiobutton de la falla infantil establecemos las fotos de las fallas infantil.
                else {
                    cargarFalla(fallas.properties.boceto_i, fallas.properties.nombre, fallas.properties.id, fallas.properties.anyo_fundacion, fallas.properties.sector);
                }
            }
        }
    });

    // Lo establecemos en blanco cada vez que se haga la funcion para hacer efecto refrescar.
    divResultados.innerHTML = "";
    //Añadimos las falla al div principal de los resultados.
    divResultados.appendChild(divTodasFallas);

}

function cargarFalla(boceto, nombreFalla, id, anyo, sector) {


    let divFalla = document.createElement("div");
    divFalla.classList.add("falla");
    divFalla.dataset.id = id;

    let imagen = document.createElement("img");
    imagen.src = boceto;

    let nombre = document.createElement("p");
    nombre.innerText = "Nombre: " + nombreFalla;

    let zona = document.createElement("p");
    zona.innerText = sector;

    let anyoF = document.createElement("p");
    anyoF.innerText = "Año Fundación: " + anyo;

    let botonUbi = document.createElement("button");
    botonUbi.innerText = "Ubicación";
    botonUbi.addEventListener("click", function(evento) {
        let probando = evento.target.parentElement.dataset.id;
        cambiarCoordinates(probando);
    });



    divFalla.appendChild(imagen);
    divFalla.appendChild(nombre);
    divFalla.appendChild(zona);
    divFalla.appendChild(anyoF);
    divFalla.appendChild(botonUbi);


    divTodasFallas.appendChild(divFalla);
    // Una vez cargadas las fallas creamos mapa
    crearMapas();
    //Quitamos imagen fondo después de cargar las fallas y mapas
    if (principalBoolean == true) {
        //Función para deshabilitar la imagen de fondo
        document.getElementById("imgBackground").style.display = "none";
    } else {
        //Función para habilitar la imagen de fondo
        document.getElementById("imgBackground").style.display = "block";
    }
}
//Funcion inicial
function init() {
    //llamamos a la funcion buscar nada mas empezar porque el radiobuton principal va a estar pulsado por defecto
    //para que al entrar muestre todas las fallas principales directamente.
    buscar();
    crearMapa();
   
    //Añadimos evento click a cada radiobutton.
    document.querySelectorAll(`input[name="fallaPri"]`)[0].addEventListener("click", principal);
    document.querySelectorAll(`input[name="fallaPri"]`)[1].addEventListener("click", principal);
    //Funcion changue para el section
    document.getElementById("section").addEventListener("change", principal);
    //Funcion perdida de foco
    document.getElementById("fecha1").addEventListener("blur", principal);
    document.getElementById("fecha2").addEventListener("blur", principal);


}
//Funcion inicial al cargar la pagina.
window.onload = init;