/* --------- */
/* VARIABLES */
/* --------- */
let menuItems,
    rowEntradas = document.querySelector("#row-entradas"),
    rowPrincipales = document.querySelector("#row-principales"),
    rowPostres = document.querySelector("#row-postres"),
    rowBebidas = document.querySelector("#row-bebidas"),
    settingsList = document.querySelector("#settings-list"),
    orderList = document.querySelector("#order-list"),
    showOrderBtn = document.querySelector("#show-order-btn"),
    orderContainer = document.querySelector("#order-container"),
    counter = document.querySelector("#counter"),
    sendOrderBtn = document.querySelector("#send-order-btn"),
    totalCost = document.querySelector("#total-cost"),
    front = document.querySelector("#front"),
    showMenuBtn = document.querySelector("#show-menu-btn"),
    alertBox = document.querySelector("#alert"),
    settingsBtn = document.querySelector("#settings-btn"),
    logInContainer = document.querySelector("#log-in-container"),
    cancelLogInBtn = document.querySelector("#cancel-log-in-btn"),
    logInBtn = document.querySelector("#log-in-btn"),
    settingsContainer = document.querySelector("#settings-container"),
    saveSettingsBtn = document.querySelector("#save-settings-btn"),
    cancelSettingsBtn = document.querySelector("#cancel-settings-btn"),
    order = [],
    addButtons,
    homeBtn = document.querySelector("#home-btn"),
    userInput = document.querySelector("#user-input"),
    passInput = document.querySelector("#pass-input"),
    rememberCheck = document.querySelector("#remember-check"),
    rejectedMessage = document.querySelector("#rejected-message"),
    validUser = {user: "danilolaura", pass: "danilo123"},
    getUserData = JSON.parse(localStorage.getItem("userData")),
    totalCostContainer = document.querySelector("#total-cost-container"),
    form = document.querySelector("#form")
;
//CLASE PARA CREAR ITEMS DEL PEDIDO
class OrderItem {
    constructor(description,price) {
        this.description = description;
        this.price = price;
    }
}

/* --------- */
/* FUNCIONES */
/* --------- */
//FUNCIONES PARA LEVANTAR LISTA DE PRODUCTOS
async function getData() {
    try {
        const response = await fetch('script/data.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        menuItems = await response.json();
        createMenuAndSettings(menuItems);
    } catch (error) {
        //SUELE PASAR SI SE ABRE index.html CON DOBLE CLIC (file://) EN VEZ DE UN SERVIDOR
        console.error("No se pudo cargar data.json", error);
        rowEntradas.innerHTML = `<p class="text-white">No se pudieron cargar los productos. Abrí la tienda desde un servidor (ver README).</p>`;
    }
}
function takeMenuItems() {
    let cached = null;
    try {
        cached = JSON.parse(localStorage.getItem("menuItems"));
    } catch (e) {
        cached = null;
    }
    //SI EL MENU GUARDADO ES INVALIDO (EJ: CATEGORIAS VACIAS POR EL BUG ANTERIOR) SE DESCARTA
    let isValid = Array.isArray(cached) && cached.length && cached.every(item => CATEGORIES.includes(item.type));
    if (!isValid) {
        localStorage.removeItem("menuItems");
        getData();
    } else {
        //RENOMBRES DE IMAGENES (ESPACIOS Y Ñ EN EL NOMBRE DEL ARCHIVO)
        const renamed = {
            "images/papa negra.jpg": "images/papa-negra.jpg",
            "images/huevosblancospequeños.jpg": "images/huevosblancospequenos.jpg",
            "images/huevosdecampopequeños.jpg": "images/huevosdecampopequenos.jpg"
        };
        menuItems = cached.map(item => ({...item, source: renamed[item.source] || item.source}));
        createMenuAndSettings(menuItems);
    }
}

//FUNCION PARA LEVANTAR PEDIDO DE SESSION STORAGE
function takeOrder() {
    order = JSON.parse(sessionStorage.getItem("order")) || [];
    order.forEach(el => {
        createOrderItem(el.description,el.price);
    });
    if (order.length) {
        showOrderBtn.classList.remove("disabled");
        updateOrder();
    }
}

//FUNCION PARA LEVANTAR DATOS DE USUARIO DE LOCAL STORAGE
function takeUserData() {
    if (getUserData != null) {
        userInput.value = getUserData.user;
        passInput.value = getUserData.pass;
    }
}

//FUNCION PARA ACTUALIZAR PEDIDO
function updateOrder(clean) {
    if (clean === "clean") {orderList.innerHTML = ""};
    order = [];
    let listItems = orderList.querySelectorAll(".list-group-item");
    let prices = [];
    listItems.forEach(el => {
        order.push(new OrderItem(el.description,el.price));
        prices.push(el.price);
    });
    sessionStorage.setItem("order",JSON.stringify(order));
    counter.textContent = order.length;
    totalCost.textContent = prices.reduce(((acc,curr) => acc + curr),0);
    if (!order.length) {
        toggleOrder();
        showOrderBtn.classList.add("disabled");
    }
}

//FUNCION PARA CONSTRUIR ITEMS DEL MENU
function createMenuCard(type, description, price, available, source) {
    //CREAR DIV COL. INSERTAR EN DIV ROW (VER TYPE)
    let divCol = document.createElement("div");
    //MOVIL: 2 POR FILA - TABLET: 3 - ESCRITORIO: 4
    divCol.classList.add("col-6","col-md-4","col-lg-3","d-flex");
    switch (type) {
        case "Frutas":
            rowEntradas.appendChild(divCol);
            break;
        case "Verduras":
            rowPrincipales.appendChild(divCol);
            break;
        case "Productos":
            rowPostres.appendChild(divCol);
            break;
        case "Huevos":
            rowBebidas.appendChild(divCol);
            break;
    }

    //CREAR DIV CARD. INSERTAR EN COL
    let divCard = document.createElement("div");
    divCard.classList.add("card","product-card","mx-auto");
    divCol.appendChild(divCard);

    //CREAR IMG. INSERTAR EN CARD
    let cardImg = document.createElement("img");
    cardImg.classList.add("card-img-top");
    cardImg.src = source;
    cardImg.alt = description;
    cardImg.loading = "lazy";
    divCard.appendChild(cardImg); 

    //CREAR DIV CARD-BODY. INSERTAR EN CARD
    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    divCard.appendChild(cardBody);

    //CREAR H5 CARD-TITLE. INSERTAR EN CARD-BODY
    let cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = description;
    cardBody.appendChild(cardTitle);

    //CREAR P CARD-TEXT. INSERTAR EN CARD-BODY
    let cardText = document.createElement("p");
    cardText.classList.add("card-text");
    cardText.textContent = `$${price}.-`;
    cardBody.appendChild(cardText);

    //CREAR A AGREGAR (VER DISABLE). INSERTAR EN CARD-BODY
    let buttonAdd = document.createElement("a");
    buttonAdd.description = description;
    buttonAdd.price = price;
    if (!available) {
        buttonAdd.classList.add("agregar", "btn", "btn-secondary","disabled");
        buttonAdd.textContent = "No disponible";
    } else {
        buttonAdd.classList.add("agregar", "btn", "btn-primary");
        buttonAdd.textContent = "Agregar al pedido";
    }
    cardBody.appendChild(buttonAdd);
}

//FUNCION PARA CONSTRUIR ITEMS DE LA LISTA DE CONFIGURACION
const CATEGORIES = ["Frutas", "Verduras", "Productos", "Huevos"];

//CREA UNA COLUMNA CON ETIQUETA (VISIBLE SOLO EN MOVIL/TABLET) Y LA INSERTA EN LA FILA
function createSettingsCol(divRow, colClasses, labelText) {
    let divCol = document.createElement("div");
    divCol.classList.add(...colClasses, "p-1");
    if (labelText) {
        let label = document.createElement("div");
        label.classList.add("settings-label");
        label.textContent = labelText;
        divCol.appendChild(label);
    }
    divRow.appendChild(divCol);
    return divCol;
}

function createSettingsRow(type, description, price, available, source) {
    //CREAR DIV ROW. INSERTAR EN DIV SETTINGS-LIST
    let divRow = document.createElement("div");
    divRow.classList.add("row","settings-row","g-0");
    settingsList.appendChild(divRow);

    //TIPO
    let divColType = createSettingsCol(divRow, ["col-6","col-lg-2"], "Tipo");
    let inputType = document.createElement("select");
    inputType.classList.add("form-select","type");
    inputType.disabled = true;
    CATEGORIES.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        inputType.appendChild(option);
    });
    inputType.value = type;
    divColType.appendChild(inputType);

    //DESCRIPCION
    let divColDesc = createSettingsCol(divRow, ["col-6","col-lg-3"], "Descripción");
    let inputDesc = document.createElement("input");
    inputDesc.classList.add("form-control","description");
    inputDesc.type = "text";
    inputDesc.value = description;
    inputDesc.disabled = true;
    divColDesc.appendChild(inputDesc);

    //PRECIO
    let divColPrice = createSettingsCol(divRow, ["col-4","col-lg-1"], "$");
    let inputPrice = document.createElement("input");
    inputPrice.classList.add("form-control","price");
    inputPrice.type = "number";
    inputPrice.min = "0";
    inputPrice.value = price;
    inputPrice.disabled = true;
    divColPrice.appendChild(inputPrice);

    //DISPONIBLE
    let divColAvailable = createSettingsCol(divRow, ["col-4","col-lg-1"], "Disp.");
    let inputAvailable = document.createElement("select");
    inputAvailable.classList.add("form-select","available");
    ["Si","No"].forEach(val => {
        let option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        inputAvailable.appendChild(option);
    });
    inputAvailable.value = available ? "Si" : "No";
    inputAvailable.disabled = true;
    divColAvailable.appendChild(inputAvailable);

    //BOTONES MODIFICAR / ELIMINAR (EN MOVIL QUEDAN AL LADO DE PRECIO Y DISP.)
    let divColModify = createSettingsCol(divRow, ["col-4","col-lg-2","order-lg-last","d-flex","align-items-end","justify-content-end","gap-2"]);
    let btnModify = document.createElement("button");
    btnModify.type = "button";
    btnModify.classList.add("btn","btn-secondary");
    btnModify.innerHTML = `<i class="bi bi-pencil"></i>`;
    divColModify.appendChild(btnModify);
    let btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.classList.add("btn","btn-danger");
    btnRemove.innerHTML = `<i class="bi bi-trash"></i>`;
    btnRemove.addEventListener("click", () => divRow.remove());
    divColModify.appendChild(btnRemove);

    //IMAGEN
    let divColImg = createSettingsCol(divRow, ["col-12","col-lg-3"], "Imagen");
    let inputImg = document.createElement("input");
    inputImg.classList.add("form-control","source");
    inputImg.type = "text";
    inputImg.value = source;
    inputImg.disabled = true;
    divColImg.appendChild(inputImg);

    btnModify.addEventListener("click", () => {
        [inputType, inputDesc, inputPrice, inputAvailable, inputImg].forEach(input => input.toggleAttribute("disabled"));
    });
}

//FUNCION PARA CREAR MENU Y LISTA DE CONFIGURACION
function createMenuAndSettings(products) {
    //LIMPIAR SECCIONES DEL MENU Y LISTA DE CONFIGURACION
    rowEntradas.innerHTML = "";
    rowPrincipales.innerHTML = "";
    rowPostres.innerHTML = "";
    rowBebidas.innerHTML = "";
    settingsList.innerHTML = "";
    //VOLVER A  LLENAR SECCIONES DEL MENU Y LISTA DE CONFIGURACION
    for (const menuItem of products) {
        let {type, description, price, available, source} = menuItem;
        createMenuCard(type, description, price, available, source);
        createSettingsRow(type, description, price, available, source);
    }
    //AGREGAR FUNCIONALIDAD A TODOS LOS BOTONES PARA AGREGAR AL PEDIDO
    addButtons = document.querySelectorAll(".agregar");
    addButtons.forEach(el => {
        el.addEventListener("click", function() {
            let item = this.description,
                precio = this.price
            ;
            createOrderItem (item,precio);
            alertBox.innerHTML = `Agregado: <span class="fw-bold"></span>`;
            alertBox.querySelector("span").textContent = item;
            alertBox.classList.remove("display-none");
            updateOrder();
            setTimeout(() => {
                alertBox.classList.add("display-none");
                showOrderBtn.classList.remove("disabled");
            },1200);
        })
    });
}

//FUNCION PARA CONSTRUIR ITEMS DEL PEDIDO
function createOrderItem(item, precio) {
    //CREAR EL DIV CON LA INFO DEL PRODUCTO
    let itemContent = document.createElement("div");
    let itemName = document.createElement("div");
    itemName.classList.add("fw-bold");
    itemName.textContent = item;
    itemContent.appendChild(itemName);
    itemContent.append(`$${precio}.-`);
    itemContent.classList.add("info-prod","ms-2","me-auto");

    //CREAR EL BOTON PARA REMOVER EL ITEM
    let removeBtn = document.createElement("span");
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-octagon-fill" viewBox="0 0 16 16"><path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/></svg>`;
    removeBtn.classList.add("eliminar","badge","bg-danger");

    //CREAR EL ITEM PARA EL PEDIDO
    let listItem = document.createElement("li");
    listItem.description = item;
    listItem.price = precio;
    listItem.classList.add("list-group-item","d-flex","justify-content-between","align-items-start");
    
    //AGREGAR AL ITEM LA INFO DEL PRODUCTO Y EL BOTON REMOVER
    listItem.appendChild(itemContent);
    listItem.appendChild(removeBtn);
    
    //AGREGAR AL PEDIDO EL ITEM COMPLETO
    orderList.appendChild(listItem);
    
    //AGREGAR FUNCIONALIDAD AL BOTON PARA REMOVER EL ITEM
    removeBtn.addEventListener("click", () => {
        listItem.classList.add("out-item");
        setTimeout(() => {
            listItem.remove();
            updateOrder();
        },800);
    })
}

//FUNCION PARA MOSTRAR-OCULTAR PEDIDO
function toggleOrder() {
    if (showOrderBtn.textContent == "Ver pedido" && order.length != 0) {
        showSection(orderContainer);
        showOrderBtn.classList.add("disabled");
        setTimeout( () => {
            showOrderBtn.classList.remove("disabled");
            showOrderBtn.textContent = "Ocultar pedido";
        },1000);
    } else {
        hideSection(orderContainer);
        showOrderBtn.classList.add("disabled");
        setTimeout( () => {
            if (totalCost.textContent > 0) {
                showOrderBtn.classList.remove("disabled");
            };
            showOrderBtn.textContent = "Ver pedido";
            totalCostContainer.classList.remove("send-item");
        },1000);
    };
}

//FUNCION PARA MOSTRAR SECCION
function showSection(section) {
    section.classList.remove("display-none");
    section.classList.add("from-up");
    section.classList.remove("to-up");
}

//FUNCION PARA OCULTAR SECCION
function hideSection(section) {
    section.classList.add("to-up");
    section.classList.remove("from-up");
    setTimeout( () => {
        section.classList.add("display-none");
    },1000);
}

/* --------- */
/* EJECUCION */
/* --------- */
//LEVANTAR PEDIDO DE SESSION STORAGE
takeOrder();

//LEVANTAR DATOS DE USUARIO DE LOCAL STORAGE
takeUserData();

//CREAR MENU Y LISTA DE CONFIGURACION
takeMenuItems();

//AGREGAR FUNCIONALIDAD AL BOTON DE VER MENÚ
showMenuBtn.addEventListener("click", () => hideSection(front));

//AGREGAR FUNCIONALIDAD A BOTON HOME
homeBtn.addEventListener("click", () => showSection(front));

//AGREGAR FUNCIONALIDAD AL BOTON MOSTRAR PEDIDO
showOrderBtn.addEventListener("click", () => toggleOrder());

//AGREGAR FUNCIONALIDAD AL BOTON ENVIAR PEDIDO
//ENVIA EL PEDIDO A FORMSUBMIT POR AJAX (SIN SALIR DE LA PAGINA)
async function submitOrder() {
    let payload = {_subject: "Nuevo pedido - Quinta Laufer", _captcha: "false"};
    order.forEach((el, index) => {
        payload[`${index+1}. ${el.description}`] = `$${el.price}`;
    });
    payload["Total"] = `$${totalCost.textContent}`;
    //USA EL MISMO MAIL QUE EL ACTION DEL FORM, PERO POR EL ENDPOINT /ajax/
    let url = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Accept": "application/json"},
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

let sendingOrder = false;
sendOrderBtn.addEventListener("click", async () => {
    if (sendingOrder || !order.length) return;
    sendingOrder = true;
    sendOrderBtn.classList.add("disabled");
    try {
        await submitOrder();
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: 'No se pudo enviar el pedido',
            text: 'Revisá tu conexión e intentá nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
        });
        sendingOrder = false;
        sendOrderBtn.classList.remove("disabled");
        return;
    }
    let listItems = orderList.querySelectorAll(".list-group-item");
    let factor = 150;
    listItems.forEach((el, i) => setTimeout(() => el.classList.add("send-item"), i*factor));
    setTimeout(() => {
        totalCostContainer.classList.add("send-item");
        setTimeout(() => {
            Swal.fire({
                title: 'Pedido enviado',
                text: 'En caso de requerirlo puede realizar otro pedido.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });
            updateOrder("clean");
            sendingOrder = false;
            sendOrderBtn.classList.remove("disabled");
        }, 300);
    }, listItems.length*factor);
});

//AGREGAR FUNCIONALIDAD AL BOTON SETTINGS
settingsBtn.addEventListener("click", () => showSection(logInContainer));

//AGREGAR FUNCIONALIDAD AL BOTON CANCELAR LOG IN
cancelLogInBtn.addEventListener("click", () => {
    hideSection(logInContainer);
    rejectedMessage.classList.add("display-none");
});

//AGREGAR FUNCIONALIDAD AL BOTON LOG IN
logInBtn.addEventListener("click", () => {
    let userData = {user: userInput.value, pass: passInput.value};
    if (userData.user == validUser.user && userData.pass == validUser.pass) {
        rejectedMessage.classList.add("display-none");
        rememberCheck.checked ? localStorage.setItem("userData", JSON.stringify(userData)) : localStorage.removeItem("userData");
        hideSection(logInContainer);
        showSection(settingsContainer);
    } else {
        rejectedMessage.classList.remove("display-none");
    }
});

//AGREGAR FUNCIONALIDAD AL BOTON GUARDAR CAMBIOS
saveSettingsBtn.addEventListener("click", (event) => {
    //EVITA QUE EL FORM RECARGUE LA PAGINA
    event.preventDefault();
    let newMenuItems = [];
    let types = document.querySelectorAll(".type");
    let descriptions = document.querySelectorAll(".description");
    let prices = document.querySelectorAll(".price");
    let availables = document.querySelectorAll(".available");
    let sources = document.querySelectorAll(".source");
    for (let i = 0; i < types.length; i++) {
        let obj = {};
        obj.type = types[i].value;
        obj.description = descriptions[i].value;
        obj.price = parseFloat(prices[i].value) || 0;
        availables[i].value === "Si" ? obj.available = true : obj.available = false ;
        obj.source = sources[i].value;
        newMenuItems.push(obj);
    }
    localStorage.setItem("menuItems",JSON.stringify(newMenuItems));
    hideSection(settingsContainer);
    setTimeout(() => {
        createMenuAndSettings(newMenuItems);
        updateOrder("clean");
        
    }, 3500);
    Swal.fire({
        title: 'Cambios guardados',
        text: 'El menú fue actualizado.',
        icon: 'success',
        showConfirmButton: false,
        timer: 3500
    });
});

//AGREGAR FUNCIONALIDAD AL BOTON CANCELAR CAMBIOS
cancelSettingsBtn.addEventListener("click", () => {
    hideSection(settingsContainer);
    Swal.fire({
        title: 'No se han guardado los cambios',
        text: 'En caso de haber hecho cambios, no se verán reflejados en el menú.',
        icon: 'warning',
        showConfirmButton: false,
        timer: 3500
    });
});