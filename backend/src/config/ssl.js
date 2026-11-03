// Conexiones remotas: validar siempre el certificado y la identidad del servidor MySQL.
module.exports = function opcionesSSL(env = process.env) {
  if (env.DB_SSL !== 'true') return undefined;
  const ca = env.DB_SSL_CA_BASE64 ? Buffer.from(env.DB_SSL_CA_BASE64, 'base64').toString('utf8') : env.DB_SSL_CA;
  if (ca && (!ca.includes('-----BEGIN CERTIFICATE-----') || !ca.includes('-----END CERTIFICATE-----'))) throw new Error('El certificado CA de MySQL no tiene un formato válido.');
  return { rejectUnauthorized: true, verifyIdentity: true, ...(ca ? { ca } : {}) };
};
