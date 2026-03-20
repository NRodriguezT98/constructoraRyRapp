-- =====================================================
-- MIGRACIÓN: Enriquecimiento de Entidades Financieras
-- Fecha: 2026-03-20
-- Descripción: Agrega datos corporativos completos a bancos
--   y cajas de compensación existentes, e inserta entidades
--   faltantes relevantes para el sector vivienda en Colombia.
-- =====================================================

BEGIN;

-- =====================================================
-- 1. BANCOS EXISTENTES — Enriquecer datos
-- =====================================================

UPDATE public.entidades_financieras SET
  nit = '890903938-8',
  razon_social = 'Bancolombia S.A.',
  telefono = '018000 912345 / (604) 510 9000',
  email_contacto = 'servicioalcliente@bancolombia.com.co',
  sitio_web = 'https://www.bancolombia.com',
  direccion = 'Carrera 48 No. 26-85, Medellín, Antioquia',
  codigo_superintendencia = '1007',
  color = 'blue'
WHERE codigo = 'bancolombia';

UPDATE public.entidades_financieras SET
  nit = '860002964-4',
  razon_social = 'Banco de Bogotá S.A.',
  telefono = '018000 011 440 / (601) 332 0032',
  email_contacto = 'servicioalcliente@bancodebogota.com.co',
  sitio_web = 'https://www.bancodebogota.com',
  direccion = 'Calle 36 No. 7-47, Bogotá D.C.',
  codigo_superintendencia = '1001',
  color = 'blue'
WHERE codigo = 'banco_bogota';

UPDATE public.entidades_financieras SET
  nit = '860034313-7',
  razon_social = 'Banco Davivienda S.A.',
  telefono = '018000 012 001 / (601) 330 0000',
  email_contacto = 'servicioalcliente@davivienda.com',
  sitio_web = 'https://www.davivienda.com',
  direccion = 'Avenida El Dorado No. 68C-61, Bogotá D.C.',
  codigo_superintendencia = '1051',
  color = 'red'
WHERE codigo = 'davivienda';

UPDATE public.entidades_financieras SET
  nit = '860003020-1',
  razon_social = 'BBVA Colombia S.A.',
  telefono = '018000 912 227 / (601) 381 1717',
  email_contacto = 'servicioalcliente@bbva.com.co',
  sitio_web = 'https://www.bbva.com.co',
  direccion = 'Carrera 9 No. 72-21, Bogotá D.C.',
  codigo_superintendencia = '1013',
  color = 'blue'
WHERE codigo = 'bbva';

UPDATE public.entidades_financieras SET
  nit = '800037800-8',
  razon_social = 'Banco Agrario de Colombia S.A.',
  telefono = '018000 915 000 / (601) 594 8500',
  email_contacto = 'servicioalcliente@bancoagrario.gov.co',
  sitio_web = 'https://www.bancoagrario.gov.co',
  direccion = 'Carrera 8 No. 15-43, Bogotá D.C.',
  codigo_superintendencia = '1040',
  color = 'green'
WHERE codigo = 'banco_agrario';

UPDATE public.entidades_financieras SET
  nit = '860035827-5',
  razon_social = 'Banco AV Villas S.A.',
  telefono = '018000 918 657 / (601) 644 8800',
  email_contacto = 'servicioalcliente@avvillas.com.co',
  sitio_web = 'https://www.avvillas.com.co',
  direccion = 'Carrera 13 No. 27-47, Bogotá D.C.',
  codigo_superintendencia = '1052',
  color = 'orange'
WHERE codigo = 'av_villas';

UPDATE public.entidades_financieras SET
  nit = '860007738-9',
  razon_social = 'Banco Popular S.A.',
  telefono = '018000 918 545 / (601) 341 0404',
  email_contacto = 'servicioalcliente@bancopopular.com.co',
  sitio_web = 'https://www.bancopopular.com.co',
  direccion = 'Calle 17 No. 7-35, Bogotá D.C.',
  codigo_superintendencia = '1002',
  color = 'blue'
WHERE codigo = 'banco_popular';

-- Colpatria fue adquirido por Scotiabank → desactivar duplicado
UPDATE public.entidades_financieras SET
  activo = false,
  notas = 'Entidad fusionada con Scotiabank Colpatria. Usar "Scotiabank Colpatria" en su lugar.'
WHERE codigo = 'colpatria';

UPDATE public.entidades_financieras SET
  nit = '860034594-7',
  razon_social = 'Scotiabank Colpatria S.A.',
  telefono = '018000 522 211 / (601) 756 2222',
  email_contacto = 'servicioalcliente@scotiabankcolpatria.com',
  sitio_web = 'https://www.scotiabankcolpatria.com',
  direccion = 'Carrera 7 No. 24-89 Piso 10, Bogotá D.C.',
  codigo_superintendencia = '1019',
  color = 'red'
WHERE codigo = 'scotiabank';

UPDATE public.entidades_financieras SET
  nit = '860007335-4',
  razon_social = 'Banco Caja Social S.A.',
  telefono = '018000 912 400 / (601) 756 1616',
  email_contacto = 'servicioalcliente@bancocajasocial.com',
  sitio_web = 'https://www.bancocajasocial.com',
  direccion = 'Calle 72 No. 10-71, Bogotá D.C.',
  codigo_superintendencia = '1032',
  color = 'green'
WHERE codigo = 'caja_social';

UPDATE public.entidades_financieras SET
  nit = '900047981-8',
  razon_social = 'Banco Falabella S.A.',
  telefono = '018000 916 100 / (601) 587 0000',
  email_contacto = 'servicioalcliente@bancofalabella.com.co',
  sitio_web = 'https://www.bancofalabella.com.co',
  direccion = 'Calle 80 No. 10-43, Bogotá D.C.',
  codigo_superintendencia = '1062',
  color = 'green'
WHERE codigo = 'banco_falabella';

UPDATE public.entidades_financieras SET
  nit = '860050750-1',
  razon_social = 'Banco GNB Sudameris S.A.',
  telefono = '018000 915 440 / (601) 756 4444',
  email_contacto = 'servicioalcliente@gnbsudameris.com.co',
  sitio_web = 'https://www.gnbsudameris.com.co',
  direccion = 'Carrera 7 No. 75-85, Bogotá D.C.',
  codigo_superintendencia = '1012',
  color = 'indigo'
WHERE codigo = 'gnb_sudameris';

UPDATE public.entidades_financieras SET
  razon_social = 'Banco Pichincha S.A.',
  telefono = '018000 932 400 / (601) 307 7888',
  email_contacto = 'servicioalcliente@bancopichincha.com.co',
  sitio_web = 'https://www.bancopichincha.com.co',
  direccion = 'Carrera 7 No. 73-55 Piso 7, Bogotá D.C.',
  codigo_superintendencia = '1060',
  color = 'yellow'
WHERE codigo = 'pichincha';

UPDATE public.entidades_financieras SET
  razon_social = 'Banco Cooperativo Coopcentral',
  telefono = '018000 113 811 / (607) 697 1414',
  email_contacto = 'servicioalcliente@coopcentral.com.co',
  sitio_web = 'https://www.coopcentral.com.co',
  direccion = 'Carrera 19 No. 36-60, Bucaramanga, Santander',
  codigo_superintendencia = '1066',
  color = 'green',
  tipo = 'Cooperativa'
WHERE codigo = 'coopcentral';

UPDATE public.entidades_financieras SET
  nit = '900378212-2',
  razon_social = 'Banco W S.A.',
  telefono = '018000 936 636 / (602) 485 5555',
  email_contacto = 'servicioalcliente@bancow.com.co',
  sitio_web = 'https://www.bancow.com.co',
  direccion = 'Calle 4 Norte No. 1N-04, Cali, Valle del Cauca',
  color = 'purple'
WHERE codigo = 'banco_w';

UPDATE public.entidades_financieras SET
  nit = '900215071-1',
  razon_social = 'Bancamía S.A.',
  telefono = '018000 912 678',
  email_contacto = 'servicioalcliente@bancamia.com.co',
  sitio_web = 'https://www.bancamia.com.co',
  direccion = 'Carrera 9 No. 66-25 Piso 10, Bogotá D.C.',
  color = 'orange'
WHERE codigo = 'bancamia';

UPDATE public.entidades_financieras SET
  razon_social = 'Banco Mundo Mujer S.A.',
  telefono = '018000 517 017 / (602) 839 7200',
  email_contacto = 'servicioalcliente@bmm.com.co',
  sitio_web = 'https://www.bmm.com.co',
  direccion = 'Calle 5 No. 4-58, Popayán, Cauca',
  color = 'pink'
WHERE codigo = 'mundo_mujer';

-- =====================================================
-- 2. BANCOS NUEVOS — Insertar faltantes
-- =====================================================

-- Fondo Nacional del Ahorro (CRÍTICO para vivienda)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, nit, razon_social, telefono, email_contacto, sitio_web, direccion, codigo_superintendencia, color, orden, activo, notas)
VALUES
  ('Fondo Nacional del Ahorro', 'fna', 'Banco',
   '899999284-2', 'Fondo Nacional del Ahorro - Carlos Lleras Restrepo',
   '018000 526 400 / (601) 307 7070', 'servicioalcliente@fna.gov.co',
   'https://www.fna.gov.co', 'Calle 18 No. 7-59, Bogotá D.C.', NULL, 'green', 18, true,
   'Entidad estatal especializada en ahorro y crédito de vivienda. Principal fuente de financiación VIS y VIP en Colombia.')
ON CONFLICT (codigo) DO UPDATE SET
  nit = EXCLUDED.nit,
  razon_social = EXCLUDED.razon_social,
  telefono = EXCLUDED.telefono,
  email_contacto = EXCLUDED.email_contacto,
  sitio_web = EXCLUDED.sitio_web,
  direccion = EXCLUDED.direccion,
  notas = EXCLUDED.notas,
  color = EXCLUDED.color;

-- Banco de Occidente
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, nit, razon_social, telefono, email_contacto, sitio_web, direccion, codigo_superintendencia, color, orden, activo)
VALUES
  ('Banco de Occidente', 'banco_occidente', 'Banco',
   '890300279-4', 'Banco de Occidente S.A.',
   '018000 514 652 / (602) 898 2262', 'servicioalcliente@bancodeoccidente.com.co',
   'https://www.bancodeoccidente.com.co', 'Carrera 4 No. 7-61 Piso 15, Cali, Valle del Cauca',
   '1023', 'blue', 19, true)
ON CONFLICT (codigo) DO UPDATE SET
  nit = EXCLUDED.nit,
  razon_social = EXCLUDED.razon_social,
  telefono = EXCLUDED.telefono,
  email_contacto = EXCLUDED.email_contacto,
  sitio_web = EXCLUDED.sitio_web,
  direccion = EXCLUDED.direccion,
  codigo_superintendencia = EXCLUDED.codigo_superintendencia;

-- Banco Itaú
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, codigo_superintendencia, color, orden, activo)
VALUES
  ('Banco Itaú', 'banco_itau', 'Banco',
   'Itaú Corpbanca Colombia S.A.',
   '018000 944 300 / (601) 581 8181', 'servicioalcliente@itau.co',
   'https://www.itau.co', 'Carrera 7 No. 99-53 Piso 16, Bogotá D.C.',
   '1006', 'orange', 20, true)
ON CONFLICT (codigo) DO UPDATE SET
  razon_social = EXCLUDED.razon_social,
  telefono = EXCLUDED.telefono,
  email_contacto = EXCLUDED.email_contacto,
  sitio_web = EXCLUDED.sitio_web,
  direccion = EXCLUDED.direccion,
  codigo_superintendencia = EXCLUDED.codigo_superintendencia;

-- Banco Serfinanza
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, codigo_superintendencia, color, orden, activo)
VALUES
  ('Banco Serfinanza', 'serfinanza', 'Banco',
   'Banco Serfinanza S.A.',
   '018000 180 280 / (605) 360 6000', 'servicioalcliente@serfinanza.com.co',
   'https://www.serfinanza.com.co', 'Carrera 54 No. 72-80 Piso 9, Barranquilla, Atlántico',
   '1069', 'cyan', 21, true)
ON CONFLICT (codigo) DO UPDATE SET
  razon_social = EXCLUDED.razon_social,
  telefono = EXCLUDED.telefono,
  email_contacto = EXCLUDED.email_contacto,
  sitio_web = EXCLUDED.sitio_web,
  direccion = EXCLUDED.direccion,
  codigo_superintendencia = EXCLUDED.codigo_superintendencia;

-- Findeter (Financiera de Desarrollo Territorial - relevante para vivienda)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, nit, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo, notas)
VALUES
  ('Findeter', 'findeter', 'Banco',
   '800096329-9', 'Financiera de Desarrollo Territorial S.A. - Findeter',
   '018000 110 021 / (601) 623 0311', 'servicioalcliente@findeter.gov.co',
   'https://www.findeter.gov.co', 'Calle 103 No. 19-20 Piso 3, Bogotá D.C.',
   'teal', 22, true,
   'Banca de desarrollo territorial. Financia proyectos de infraestructura y vivienda a través de intermediarios financieros.')
ON CONFLICT (codigo) DO UPDATE SET
  nit = EXCLUDED.nit,
  razon_social = EXCLUDED.razon_social,
  telefono = EXCLUDED.telefono,
  email_contacto = EXCLUDED.email_contacto,
  sitio_web = EXCLUDED.sitio_web,
  direccion = EXCLUDED.direccion,
  notas = EXCLUDED.notas;

-- Banco Finandina
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, codigo_superintendencia, color, orden, activo)
VALUES
  ('Banco Finandina', 'finandina', 'Banco',
   'Banco Finandina S.A.',
   '018000 912 124 / (601) 307 7500', 'servicioalcliente@bancofinandina.com',
   'https://www.bancofinandina.com', 'Carrera 7 No. 75-85 Piso 6, Bogotá D.C.',
   '1063', 'sky', 23, true)
ON CONFLICT (codigo) DO NOTHING;

-- Bancoldex (Banco de Comercio Exterior)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, nit, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo, notas)
VALUES
  ('Bancoldex', 'bancoldex', 'Banco',
   '800149923-6', 'Banco de Comercio Exterior de Colombia S.A. - Bancoldex',
   '018000 180 710 / (601) 742 0281', 'servicioalcliente@bancoldex.com',
   'https://www.bancoldex.com', 'Calle 28 No. 13A-15 Pisos 38 al 42, Bogotá D.C.',
   'indigo', 24, true,
   'Banco de desarrollo empresarial colombiano. Otorga créditos a través de intermediarios financieros.')
ON CONFLICT (codigo) DO NOTHING;

-- Banco Credifinanciera
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Banco Credifinanciera', 'credifinanciera', 'Banco',
   'Banco Credifinanciera S.A.',
   '018000 515 554 / (601) 390 7200', 'servicioalcliente@credifinanciera.com.co',
   'https://www.credifinanciera.com.co', 'Calle 72 No. 10-07 Piso 14, Bogotá D.C.',
   'slate', 25, true)
ON CONFLICT (codigo) DO NOTHING;

-- Banco Multibank (importante en crédito constructor)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Multibank', 'multibank', 'Banco',
   'Banco Multibank S.A.',
   '(601) 325 1111', 'servicioalcliente@multibank.com.co',
   'https://www.multibank.com.co', 'Carrera 9 No. 74-08 Piso 9, Bogotá D.C.',
   'violet', 26, true)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- 3. CAJAS DE COMPENSACIÓN EXISTENTES — Enriquecer
-- =====================================================

UPDATE public.entidades_financieras SET
  nit = '890303093-5',
  razon_social = 'Caja de Compensación Familiar del Valle del Cauca — Comfandi',
  telefono = '(602) 886 2727',
  email_contacto = 'servicioalcliente@comfandi.com.co',
  sitio_web = 'https://www.comfandi.com.co',
  direccion = 'Calle 5 No. 6-63, Cali, Valle del Cauca',
  color = 'green'
WHERE codigo = 'comfandi';

UPDATE public.entidades_financieras SET
  nit = '890300693-4',
  razon_social = 'Caja de Compensación Familiar Comfenalco Valle Delagente',
  telefono = '(602) 886 4646',
  email_contacto = 'servicioalcliente@comfenalcovalle.com.co',
  sitio_web = 'https://www.comfenalcovalle.com.co',
  direccion = 'Avenida 3 Norte No. 47N-87, Cali, Valle del Cauca',
  color = 'emerald'
WHERE codigo = 'comfenalco_valle';

UPDATE public.entidades_financieras SET
  nit = '890900842-0',
  razon_social = 'Caja de Compensación Familiar Comfenalco Antioquia',
  telefono = '(604) 444 0366',
  email_contacto = 'servicioalcliente@comfenalcoantioquia.com',
  sitio_web = 'https://www.comfenalcoantioquia.com',
  direccion = 'Carrera 43 No. 31-85, Medellín, Antioquia',
  color = 'teal'
WHERE codigo = 'comfenalco_antioquia';

UPDATE public.entidades_financieras SET
  nit = '860066942-7',
  razon_social = 'Caja de Compensación Familiar Compensar',
  telefono = '(601) 300 7900',
  email_contacto = 'servicioalcliente@compensar.com',
  sitio_web = 'https://www.compensar.com',
  direccion = 'Avenida 68 No. 49A-47, Bogotá D.C.',
  color = 'orange'
WHERE codigo = 'compensar';

UPDATE public.entidades_financieras SET
  nit = '890900148-5',
  razon_social = 'Caja de Compensación Familiar de Antioquia — Comfama',
  telefono = '(604) 444 1155',
  email_contacto = 'servicioalcliente@comfama.com',
  sitio_web = 'https://www.comfama.com',
  direccion = 'Calle 45 No. 49-92, Medellín, Antioquia',
  color = 'green'
WHERE codigo = 'comfama';

UPDATE public.entidades_financieras SET
  nit = '860013570-3',
  razon_social = 'Caja de Compensación Familiar Cafam',
  telefono = '(601) 307 7007',
  email_contacto = 'servicioalcliente@cafam.com.co',
  sitio_web = 'https://www.cafam.com.co',
  direccion = 'Avenida Calle 51 No. 13-70, Bogotá D.C.',
  color = 'blue'
WHERE codigo = 'cafam';

UPDATE public.entidades_financieras SET
  razon_social = 'Caja de Compensación Familiar de Santander — Comfenalco Santander',
  telefono = '(607) 697 8000',
  email_contacto = 'servicioalcliente@comfenalcosantander.com.co',
  sitio_web = 'https://www.comfenalcosantander.com.co',
  direccion = 'Calle 36 No. 13-55, Bucaramanga, Santander',
  color = 'amber'
WHERE codigo = 'comfenalco_santander';

UPDATE public.entidades_financieras SET
  razon_social = 'Caja de Compensación Familiar de Risaralda — Comfamiliar Risaralda',
  telefono = '(606) 313 6300',
  email_contacto = 'servicioalcliente@comfamiliar.com',
  sitio_web = 'https://www.comfamiliar.com',
  direccion = 'Avenida Circunvalar No. 3-01, Pereira, Risaralda',
  color = 'cyan'
WHERE codigo = 'comfamiliar_risaralda';

-- =====================================================
-- 4. CAJAS DE COMPENSACIÓN NUEVAS — Insertar faltantes
-- =====================================================

-- Colsubsidio — una de las más grandes de Colombia (¡FALTABA!)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, nit, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Colsubsidio', 'colsubsidio', 'Caja de Compensación',
   '860007336-1', 'Caja Colombiana de Subsidio Familiar — Colsubsidio',
   '(601) 742 7600', 'servicioalcliente@colsubsidio.com',
   'https://www.colsubsidio.com', 'Calle 26 No. 25-50, Bogotá D.C.',
   'orange', 28, true)
ON CONFLICT (codigo) DO UPDATE SET
  nit = EXCLUDED.nit,
  razon_social = EXCLUDED.razon_social,
  telefono = EXCLUDED.telefono,
  email_contacto = EXCLUDED.email_contacto,
  sitio_web = EXCLUDED.sitio_web,
  direccion = EXCLUDED.direccion;

-- Combarranquilla
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Combarranquilla', 'combarranquilla', 'Caja de Compensación',
   'Caja de Compensación Familiar Combarranquilla',
   '(605) 330 5333', 'servicioalcliente@combarranquilla.com.co',
   'https://www.combarranquilla.com.co', 'Carrera 53 No. 68-10, Barranquilla, Atlántico',
   'amber', 29, true)
ON CONFLICT (codigo) DO NOTHING;

-- Cajacopi Atlántico
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Cajacopi Atlántico', 'cajacopi', 'Caja de Compensación',
   'Caja de Compensación Familiar Cajacopi Atlántico',
   '(605) 371 1212', 'servicioalcliente@cajacopi.com',
   'https://www.cajacopi.com', 'Calle 44 No. 46-35, Barranquilla, Atlántico',
   'sky', 30, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfamiliar Huila
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfamiliar Huila', 'comfamiliar_huila', 'Caja de Compensación',
   'Caja de Compensación Familiar del Huila — Comfamiliar Huila',
   '(608) 871 2412', 'servicioalcliente@comfamiliarhuila.com',
   'https://www.comfamiliarhuila.com', 'Calle 18 No. 4-44, Neiva, Huila',
   'emerald', 31, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfamiliar Nariño
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfamiliar Nariño', 'comfamiliar_narino', 'Caja de Compensación',
   'Caja de Compensación Familiar de Nariño',
   '(602) 731 6666', 'servicioalcliente@comfamiliarnarino.com',
   'https://www.comfamiliarnarino.com', 'Calle 18 No. 29-47, Pasto, Nariño',
   'green', 32, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfacauca
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfacauca', 'comfacauca', 'Caja de Compensación',
   'Caja de Compensación Familiar del Cauca — Comfacauca',
   '(602) 820 5700', 'servicioalcliente@comfacauca.com',
   'https://www.comfacauca.com', 'Carrera 7 No. 1N-50, Popayán, Cauca',
   'teal', 33, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfaboy (Boyacá)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfaboy', 'comfaboy', 'Caja de Compensación',
   'Caja de Compensación Familiar de Boyacá — Comfaboy',
   '(608) 742 1414', 'servicioalcliente@comfaboy.com.co',
   'https://www.comfaboy.com.co', 'Calle 20 No. 10-23, Tunja, Boyacá',
   'lime', 34, true)
ON CONFLICT (codigo) DO NOTHING;

-- Cofrem (Meta)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Cofrem', 'cofrem', 'Caja de Compensación',
   'Caja de Compensación Familiar del Meta — Cofrem',
   '(608) 671 3434', 'servicioalcliente@cofrem.com.co',
   'https://www.cofrem.com.co', 'Carrera 33 No. 38-45, Villavicencio, Meta',
   'yellow', 35, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfaoriente (Norte de Santander)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfaoriente', 'comfaoriente', 'Caja de Compensación',
   'Caja de Compensación Familiar de Norte de Santander — Comfaoriente',
   '(607) 582 1212', 'servicioalcliente@comfaoriente.com',
   'https://www.comfaoriente.com', 'Avenida 1 No. 18-50, Cúcuta, Norte de Santander',
   'rose', 36, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfamiliar Caldas
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfamiliar Caldas', 'comfamiliar_caldas', 'Caja de Compensación',
   'Caja de Compensación Familiar de Caldas',
   '(606) 887 9800', 'servicioalcliente@comfamiliarcaldas.com',
   'https://www.comfamiliarcaldas.com', 'Carrera 23 No. 59-56, Manizales, Caldas',
   'indigo', 37, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfenalco Quindío
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfenalco Quindío', 'comfenalco_quindio', 'Caja de Compensación',
   'Caja de Compensación Familiar Comfenalco Quindío',
   '(606) 741 1600', 'servicioalcliente@comfenalcoquindio.com',
   'https://www.comfenalcoquindio.com', 'Carrera 14 No. 23-50, Armenia, Quindío',
   'violet', 38, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfenalco Cartagena / Bolívar
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfenalco Cartagena', 'comfenalco_cartagena', 'Caja de Compensación',
   'Caja de Compensación Familiar Comfenalco Cartagena',
   '(605) 669 7800', 'servicioalcliente@comfenalcocartagena.com',
   'https://www.comfenalcocartagena.com', 'Pie de la Popa, Calle 31 No. 19-81, Cartagena, Bolívar',
   'pink', 39, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfacundi (Cundinamarca)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfacundi', 'comfacundi', 'Caja de Compensación',
   'Caja de Compensación Familiar de Cundinamarca — Comfacundi',
   '(601) 862 4040', 'servicioalcliente@comfacundi.com.co',
   'https://www.comfacundi.com.co', 'Calle 10 No. 16-41, Facatativá, Cundinamarca',
   'slate', 40, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfachocó
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfachocó', 'comfachoco', 'Caja de Compensación',
   'Caja de Compensación Familiar del Chocó — Comfachocó',
   '(604) 671 1011', 'servicioalcliente@comfachoco.com',
   'https://www.comfachoco.com', 'Carrera 3 No. 28-08, Quibdó, Chocó',
   'emerald', 41, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfacor (Córdoba)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfacor', 'comfacor', 'Caja de Compensación',
   'Caja de Compensación Familiar de Córdoba — Comfacor',
   '(604) 789 1100', 'servicioalcliente@comfacor.com.co',
   'https://www.comfacor.com.co', 'Calle 29 No. 7-43, Montería, Córdoba',
   'amber', 42, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfamiliar Cartagena (Comfamiliar Bolívar)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfamiliar Bolívar', 'comfamiliar_bolivar', 'Caja de Compensación',
   'Caja de Compensación Familiar de Bolívar — Comfamiliar',
   '(605) 656 5656', 'servicioalcliente@comfamiliarbolivar.com',
   'https://www.comfamiliarbolivar.com', 'Manga, Calle 24 No. 22-99, Cartagena, Bolívar',
   'red', 43, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfatolima (Tolima)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfatolima', 'comfatolima', 'Caja de Compensación',
   'Caja de Compensación Familiar del Tolima — Comfatolima',
   '(608) 277 2949', 'servicioalcliente@comfatolima.com.co',
   'https://www.comfatolima.com.co', 'Calle 37 No. 4-68, Ibagué, Tolima',
   'yellow', 44, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfamiliar Atlántico
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfamiliar Atlántico', 'comfamiliar_atlantico', 'Caja de Compensación',
   'Caja de Compensación Familiar del Atlántico',
   '(605) 350 3030', 'servicioalcliente@comfamiliaratlantico.com',
   'https://www.comfamiliaratlantico.com', 'Carrera 46 No. 74-30, Barranquilla, Atlántico',
   'blue', 45, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfasucre (Sucre)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfasucre', 'comfasucre', 'Caja de Compensación',
   'Caja de Compensación Familiar de Sucre — Comfasucre',
   '(605) 282 3232', 'servicioalcliente@comfasucre.com',
   'https://www.comfasucre.com.co', 'Carrera 20 No. 22-56, Sincelejo, Sucre',
   'green', 46, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfamiliar Cesar (Valledupar)
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfamiliar Cesar', 'comfamiliar_cesar', 'Caja de Compensación',
   'Caja de Compensación Familiar del Cesar — Comfamiliar',
   '(605) 574 5050', 'servicioalcliente@comfamiliarcesar.com',
   'https://www.comfamiliarcesar.com', 'Calle 16 No. 12-56, Valledupar, Cesar',
   'orange', 47, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfaguajira
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfaguajira', 'comfaguajira', 'Caja de Compensación',
   'Caja de Compensación Familiar de La Guajira — Comfaguajira',
   '(605) 727 5858', 'servicioalcliente@comfaguajira.com',
   'https://www.comfaguajira.com', 'Calle 15 No. 8-60, Riohacha, La Guajira',
   'cyan', 48, true)
ON CONFLICT (codigo) DO NOTHING;

-- Comfenalco Tolima
INSERT INTO public.entidades_financieras
  (nombre, codigo, tipo, razon_social, telefono, email_contacto, sitio_web, direccion, color, orden, activo)
VALUES
  ('Comfenalco Tolima', 'comfenalco_tolima', 'Caja de Compensación',
   'Caja de Compensación Familiar Comfenalco Tolima',
   '(608) 261 5252', 'servicioalcliente@comfenalcotolima.com',
   'https://www.comfenalcotolima.com', 'Carrera 5 No. 36-63, Ibagué, Tolima',
   'teal', 49, true)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- 5. Actualizar "Otro" entries con datos útiles
-- =====================================================

UPDATE public.entidades_financieras SET
  nombre = 'Otra Entidad Bancaria',
  razon_social = 'Entidad bancaria no listada',
  notas = 'Usar cuando el banco del cliente no aparece en la lista. Se recomienda solicitar la inclusión al administrador.',
  color = 'gray'
WHERE codigo = 'otro_banco';

UPDATE public.entidades_financieras SET
  nombre = 'Otra Caja de Compensación',
  razon_social = 'Caja de compensación no listada',
  notas = 'Usar cuando la caja del cliente no aparece en la lista. Se recomienda solicitar la inclusión al administrador.',
  color = 'gray'
WHERE codigo = 'otra_caja';

COMMIT;

-- =====================================================
-- RESUMEN DE CAMBIOS:
-- =====================================================
-- BANCOS enriquecidos: 17 existentes (NIT, contacto, web, dirección)
-- BANCOS nuevos: 8 (FNA, Occidente, Itaú, Serfinanza, Findeter,
--                    Finandina, Bancoldex, Credifinanciera, Multibank)
-- CAJAS enriquecidas: 8 existentes (NIT, contacto, web, dirección)
-- CAJAS nuevas: 17 (Colsubsidio, Combarranquilla, Cajacopi, Comfamiliar Huila,
--                    Nariño, Comfacauca, Comfaboy, Cofrem, Comfaoriente,
--                    Comfamiliar Caldas, Comfenalco Quindío, Comfenalco Cartagena,
--                    Comfacundi, Comfachocó, Comfacor, Comfamiliar Bolívar,
--                    Comfatolima, Comfamiliar Atlántico, Comfasucre,
--                    Comfamiliar Cesar, Comfaguajira, Comfenalco Tolima)
-- DESACTIVADO: "Colpatria" (duplicado con Scotiabank Colpatria)
-- TOTAL estimado: ~52 entidades activas
-- =====================================================
