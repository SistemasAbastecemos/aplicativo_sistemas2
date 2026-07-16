1. Admin / Informes:
   - Backend Defensivo (update_informe.php): Antes de actualizar, consultamos los valores actuales del registro en la base de datos dentro de la misma transacción. Si una propiedad opcional (como orden o color) no viene en el payload, conservamos su valor actual en lugar de sobrescribirla con un valor estático.

   - Asignación Automática en Creación (create_informe.php): Si al crear un informe no se recibe un orden explícito, realizamos una consulta rápida dentro de la transacción para obtener el COALESCE(MAX(orden), 0) + 1 de manera dinámica y segura.

   - Sincronización de Estado en Frontend (useInformeForm.js): Inicializamos y propagamos correctamente tanto orden como color en las acciones de creación y edición.

   - Se añadio el nuevo campo de orden de Visualizacion (InformeFormTab.jsx): al final de la segunda columna. Se configura con un placeholder descriptivo que le indica al usuario que si lo deja vacío, el sistema calculará automáticamente el consecutivo (Último + 1).

   - Modificamos el método handleChange (useInformeForm.js) para procesar el campo orden de manera numérica. Si el usuario borra por completo el número del campo en el modal, el hook asignará un valor null, lo que le indicará al backend de creación que debe disparar la lógica de auto-incrementar MAX(orden) + 1.
