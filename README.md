# Quinta Laufer · Tienda online

Tienda web de autoservicio para **Quinta Laufer** (frutas, verduras, productos caseros y huevos).
El cliente arma su pedido desde el celular o la computadora y lo envía por mail con un clic.

Es un proyecto **100 % frontend**: HTML, CSS y JavaScript sin frameworks de build, con Bootstrap 5 desde CDN.

---

## Funcionalidades

- **Portada** con imagen de fondo y botón *Ver tienda*.
- **Catálogo por categorías** (Frutas, Verduras, Productos, Huevos) en acordeón, con menú de navegación fijo.
- **Cards de producto uniformes**: todas las imágenes tienen la misma proporción (4:3) y se recortan sin deformarse (`object-fit: cover`), y todas las cards tienen el mismo alto.
- **Responsive**:
  | Pantalla | Productos por fila |
  |---|---|
  | Móvil (< 768 px) | 2 |
  | Tablet (768–991 px) | 3 |
  | Escritorio (≥ 992 px) | 4 |
- **Pedido**: agregar y quitar productos, contador, total automático. El pedido se guarda en `sessionStorage` (se mantiene si se recarga la página).
- **Envío del pedido** por mail a través de [FormSubmit](https://formsubmit.co) (por AJAX, sin salir de la página). Si falla, se avisa al cliente.
- **Panel de configuración** (ícono ⚙ en la portada, requiere usuario y contraseña): editar tipo, descripción, precio, disponibilidad e imagen de cada producto, o eliminarlo.

## Estructura

```
clientes-nuevos/
├── index.html          # Estructura de la página
├── styles/
│   └── style.css       # Estilos propios, animaciones y responsive
├── script/
│   ├── data.json       # Lista de productos (catálogo)
│   └── script.js       # Lógica: catálogo, pedido, envío, configuración
└── images/             # Fotos de productos y portada (font.jpeg)
```

## Cómo ejecutarlo

El catálogo se carga con `fetch('script/data.json')`, así que **no funciona abriendo `index.html` con doble clic** (`file://`). Hace falta un servidor local:

```powershell
python -m http.server 5500
```

y abrir <http://localhost:5500>. También sirve la extensión **Live Server** de VS Code o publicarlo en **GitHub Pages**.

## Cómo agregar o modificar productos

Editar `script/data.json`. Cada producto tiene esta forma:

```json
{
    "type": "Frutas",
    "description": "Naranja de jugo",
    "price": 1600,
    "available": true,
    "source": "images/naranja.jpg"
}
```

- `type`: una de `Frutas`, `Verduras`, `Productos`, `Huevos`.
- `available: false` muestra el producto con el botón *No disponible*.
- `source`: ruta a la imagen. **Usar nombres sin espacios, tildes ni ñ** (ej. `papa-negra.jpg`). Cualquier tamaño sirve: la web la recorta a 4:3 automáticamente; conviene que el producto esté centrado y que la imagen pese menos de 200 KB.

## Configuración del envío de pedidos

El destino del mail está en el atributo `action` del formulario en `index.html`:

```html
<form id="form" action="https://formsubmit.co/TU-MAIL@ejemplo.com" method="post">
```

La primera vez que se envía un pedido, FormSubmit manda un mail de activación a esa casilla que hay que confirmar.

## Limitaciones conocidas

- **El panel de configuración guarda los cambios solo en el navegador donde se hacen** (`localStorage`). Los clientes siguen viendo lo que dice `data.json`. Para que un cambio llegue a todos, hay que editar `data.json` y volver a publicar.
- **El usuario y la contraseña del panel están escritos en `script.js`**, por lo que cualquiera puede verlos con el inspector del navegador. Sirve para ocultar el panel, no como seguridad real. Además, “Recordar mis datos” guarda la contraseña sin cifrar en `localStorage`.
- El mail de destino de los pedidos queda visible en el código fuente (es normal con FormSubmit; se puede reemplazar por el *alias* aleatorio que da FormSubmit después de activar la casilla).

## Cambios recientes

- Imágenes de producto con tamaño uniforme y layout responsive (móvil, tablet, escritorio).
- Imagen de portada optimizada (de 7,4 MB a ~0,5 MB).
- Corrección: al guardar la configuración se borraban las categorías de todos los productos y la tienda quedaba vacía (las opciones del selector eran *Entradas/Principales/Postres/Bebidas*).
- Corrección: el botón *Guardar* recargaba la página antes de aplicar los cambios.
- Corrección: al vaciar el pedido se insertaba una URL de GitHub como texto en la lista.
- Corrección: el envío del pedido sacaba al usuario de la tienda; ahora es por AJAX con aviso de error.
- Corrección: clases de Bootstrap mal escritas (`col-sm6`), etiquetas `<label>` que no apuntaban a su campo, acordeón con estados inconsistentes, `lang="en"`.
- Imágenes renombradas sin espacios ni ñ y erratas en nombres de productos (“Manazana”, etc.).

## Tecnologías

- HTML5, CSS3, JavaScript (ES6+)
- [Bootstrap 5.1](https://getbootstrap.com/) y Bootstrap Icons
- [SweetAlert2](https://sweetalert2.github.io/)
- [FormSubmit](https://formsubmit.co/)
