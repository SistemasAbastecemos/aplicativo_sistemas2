/**
 * Empresas del holding — el value es el prefijo interno usado en el
 * backend y el label es la razón social corta.
 */
export const EMPRESAS = [
  { value: "AB", label: "Abastecemos de Occidente" },
  { value: "TH", label: "Tobar Sánchez" },
];

/**
 * Cantidad de filas por página en la preview de resultados.
 */
export const ITEMS_POR_PAGINA = 100;

/**
 * Límite duro de registros que soporta Excel corporativo. Por encima de
 * este valor, se fuerza al usuario a exportar CSV (Excel se corrompería
 * o el archivo sería inusable).
 */
export const LIMITE_REGISTROS_EXCEL = 450000;

/**
 * Encabezados de columnas para exportación CSV y Excel. Se declaran una
 * sola vez para mantener consistencia entre ambos formatos.
 */
export const COLUMNAS_EXPORT = [
  { key: "id_emp", labelCsv: "Empresa", labelExcel: "Empresa" },
  { key: "doc_fc_co", labelCsv: "CO", labelExcel: "C.O." },
  { key: "desc_co", labelCsv: "Desc_CO", labelExcel: "Desc. C.O.", quoteCsv: true },
  { key: "id_cuenta", labelCsv: "Cuenta", labelExcel: "Cuenta" },
  { key: "desc_cuenta", labelCsv: "Desc_Cuenta", labelExcel: "Desc. Cuenta", quoteCsv: true },
  { key: "terc", labelCsv: "Tercero", labelExcel: "Tercero" },
  { key: "desc_proveedor", labelCsv: "Razon_Social", labelExcel: "Razón Social", quoteCsv: true },
  { key: "dia", labelCsv: "Dia", labelExcel: "Día" },
  { key: "mes", labelCsv: "Mes", labelExcel: "Mes" },
  { key: "ano", labelCsv: "Ano", labelExcel: "Año" },
  { key: "doc_fc_tipo", labelCsv: "Tipo_Doc", labelExcel: "Tipo Doc" },
  { key: "documento_fc", labelCsv: "Num_Doc", labelExcel: "Num Doc" },
  { key: "detalle1", labelCsv: "Detalle", labelExcel: "Detalle", quoteCsv: true },
  { key: "id_ccosto", labelCsv: "CCosto", labelExcel: "C.Costo" },
  { key: "desc_ccosto", labelCsv: "Desc_CCosto", labelExcel: "Desc. C.Costo", quoteCsv: true },
  { key: "id_gpo_proyec", labelCsv: "Grupo_Proy", labelExcel: "Grupo Proy" },
  { key: "id_proyecto", labelCsv: "Proyecto", labelExcel: "Proyecto" },
  { key: "desc_proyecto", labelCsv: "Desc_Proyecto", labelExcel: "Desc. Proyecto", quoteCsv: true },
  { key: "pref_prov_doc", labelCsv: "Pref_Prov", labelExcel: "Pref Prov" },
  { key: "nro_prov_doc", labelCsv: "Nro_Prov", labelExcel: "Nro Prov" },
  { key: "naturaleza", labelCsv: "Nat", labelExcel: "Nat" },
  { key: "valor_deb", labelCsv: "Valor_Debito", labelExcel: "Valor Débito", isNumber: true },
];
