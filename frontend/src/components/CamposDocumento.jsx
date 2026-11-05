export default function CamposDocumento({ datos, cambiar }) {
  return <>
    <label>Tipo de documento
      <select required value={datos.tipoDocumento || ''} onChange={e => cambiar('tipoDocumento', e.target.value)}>
        <option value="">Selecciona el tipo</option>
        <option value="CC">Cédula de ciudadanía</option>
        <option value="TI">Tarjeta de identidad</option>
        <option value="CE">Cédula de extranjería</option>
        <option value="PA">Pasaporte</option>
        <option value="PPT">Permiso por Protección Temporal</option>
      </select>
    </label>
    <label>Número de documento
      <input required minLength={3} maxLength={32} autoComplete="off"
        value={datos.numeroDocumento || ''} onChange={e => cambiar('numeroDocumento', e.target.value)} />
    </label>
  </>;
}
