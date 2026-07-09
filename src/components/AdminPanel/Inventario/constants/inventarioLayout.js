import {
  faBox,
  faWeightHanging,
  faArchive,
  faBarcode,
  faPrint,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";

export const CONFIG_INVENTARIO = {
  cajas: {
    nombre: "Cajas",
    descripcion:
      "Carga un archivo Excel con la información de las cajas para actualizar o agregar los registros.",
    icono: faBox,
  },
  balanzas: {
    nombre: "Balanzas POS",
    descripcion:
      "Carga un archivo Excel con la información de las balanzas POS para actualizar o agregar los registros.",
    icono: faWeightHanging,
  },
  cajones: {
    nombre: "Cajones POS",
    descripcion:
      "Carga un archivo Excel con la información de los cajones POS para actualizar o agregar los registros.",
    icono: faArchive,
  },
  escaneres: {
    nombre: "Escáneres POS",
    descripcion:
      "Carga un archivo Excel con la información de los escáneres POS para actualizar o agregar los registros.",
    icono: faBarcode,
  },
  impresoras: {
    nombre: "Impresoras POS",
    descripcion:
      "Carga un archivo Excel con la información de las impresoras POS para actualizar o agregar los registros.",
    icono: faPrint,
  },
  pcs: {
    nombre: "PCs POS",
    descripcion:
      "Carga un archivo Excel con la información de los PCs POS para actualizar o agregar los registros.",
    icono: faDesktop,
  },
};
