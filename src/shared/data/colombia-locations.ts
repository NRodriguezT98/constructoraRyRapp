/**
 * Data: Departamentos y Municipios de Colombia
 *
 * Datos estáticos de ubicaciones geográficas de Colombia.
 * Organizados por departamento → municipios.
 *
 * NOTA: En Colombia NO existe distinción legal entre "ciudad" y "municipio".
 * Todos son municipios. Los más grandes se conocen popularmente como "ciudades".
 */

// =====================================================
// TYPES
// =====================================================

export interface Ciudad {
  nombre: string
  codigo?: string // Código DANE (opcional)
}

export interface Departamento {
  nombre: string
  codigo?: string // Código DANE (opcional)
  ciudades: string[] // Técnicamente son "municipios", pero usamos "ciudades" por convención
}

// =====================================================
// DEPARTAMENTOS DE COLOMBIA
// =====================================================

export const DEPARTAMENTOS_COLOMBIA: Departamento[] = [
  {
    nombre: 'Amazonas',
    ciudades: ['Leticia', 'Puerto Nariño'],
  },
  {
    nombre: 'Antioquia',
    ciudades: [
      'Medellín',
      'Bello',
      'Itagüí',
      'Envigado',
      'Apartadó',
      'Turbo',
      'Rionegro',
      'Caucasia',
      'Sabaneta',
      'La Estrella',
      'Caldas',
      'Copacabana',
      'Girardota',
      'Barbosa',
      'Carmen de Viboral',
      'Puerto Berrío',
      'Yarumal',
      'Andes',
      'Sonsón',
      'Santa Rosa de Osos',
    ],
  },
  {
    nombre: 'Arauca',
    ciudades: ['Arauca', 'Arauquita', 'Saravena', 'Tame', 'Fortul'],
  },
  {
    nombre: 'Atlántico',
    ciudades: [
      'Barranquilla',
      'Soledad',
      'Malambo',
      'Sabanalarga',
      'Galapa',
      'Puerto Colombia',
      'Baranoa',
      'Juan de Acosta',
      'Tubará',
      'Usiacurí',
    ],
  },
  {
    nombre: 'Bogotá D.C.',
    ciudades: ['Bogotá'],
  },
  {
    nombre: 'Bolívar',
    ciudades: [
      'Cartagena',
      'Magangué',
      'Turbaco',
      'Arjona',
      'El Carmen de Bolívar',
      'Santa Rosa del Sur',
      'Mompós',
      'San Juan Nepomuceno',
      'Santa Rosa',
    ],
  },
  {
    nombre: 'Boyacá',
    ciudades: [
      'Tunja',
      'Duitama',
      'Sogamoso',
      'Chiquinquirá',
      'Paipa',
      'Villa de Leyva',
      'Nobsa',
      'Puerto Boyacá',
      'Moniquirá',
      'Garagoa',
      'Samacá',
      'Ramiriquí',
    ],
  },
  {
    nombre: 'Caldas',
    ciudades: [
      'Manizales',
      'Villamaría',
      'La Dorada',
      'Chinchiná',
      'Riosucio',
      'Anserma',
      'Palestina',
      'Aguadas',
      'Salamina',
    ],
  },
  {
    nombre: 'Caquetá',
    ciudades: [
      'Florencia',
      'San Vicente del Caguán',
      'Puerto Rico',
      'El Doncello',
      'Belén de los Andaquíes',
    ],
  },
  {
    nombre: 'Casanare',
    ciudades: ['Yopal', 'Aguazul', 'Villanueva', 'Monterrey', 'Tauramena', 'Paz de Ariporo'],
  },
  {
    nombre: 'Cauca',
    ciudades: [
      'Popayán',
      'Santander de Quilichao',
      'Puerto Tejada',
      'Patía',
      'Piendamó',
      'Miranda',
      'Guachené',
      'Corinto',
      'Silvia',
    ],
  },
  {
    nombre: 'Cesar',
    ciudades: [
      'Valledupar',
      'Aguachica',
      'Bosconia',
      'Codazzi',
      'La Jagua de Ibirico',
      'Chiriguaná',
      'Curumaní',
      'El Copey',
      'Becerril',
    ],
  },
  {
    nombre: 'Chocó',
    ciudades: ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Acandí', 'Bahía Solano'],
  },
  {
    nombre: 'Córdoba',
    ciudades: [
      'Montería',
      'Cereté',
      'Lorica',
      'Sahagún',
      'Planeta Rica',
      'Montelíbano',
      'Tierralta',
      'Ayapel',
      'Ciénaga de Oro',
    ],
  },
  {
    nombre: 'Cundinamarca',
    ciudades: [
      'Soacha',
      'Facatativá',
      'Zipaquirá',
      'Fusagasugá',
      'Chía',
      'Mosquera',
      'Madrid',
      'Funza',
      'Cajicá',
      'Sibaté',
      'Tocancipá',
      'Girardot',
      'Sopó',
      'La Calera',
      'Ubaté',
      'Villa de San Diego de Ubaté',
      'Gachancipá',
      'Tabio',
      'Tenjo',
      'Cota',
    ],
  },
  {
    nombre: 'Guainía',
    ciudades: ['Inírida', 'Barranco Minas'],
  },
  {
    nombre: 'Guaviare',
    ciudades: ['San José del Guaviare', 'Calamar', 'El Retorno'],
  },
  {
    nombre: 'Huila',
    ciudades: [
      'Neiva',
      'Pitalito',
      'Garzón',
      'La Plata',
      'Campoalegre',
      'Algeciras',
      'Gigante',
      'San Agustín',
      'Palermo',
    ],
  },
  {
    nombre: 'La Guajira',
    ciudades: [
      'Riohacha',
      'Maicao',
      'Uribia',
      'Albania',
      'Manaure',
      'San Juan del Cesar',
      'Fonseca',
      'Villanueva',
    ],
  },
  {
    nombre: 'Magdalena',
    ciudades: [
      'Santa Marta',
      'Ciénaga',
      'Fundación',
      'Zona Bananera',
      'Plato',
      'El Banco',
      'Aracataca',
      'San Zenón',
    ],
  },
  {
    nombre: 'Meta',
    ciudades: [
      'Villavicencio',
      'Acacías',
      'Granada',
      'Puerto López',
      'San Martín',
      'Cumaral',
      'Puerto Gaitán',
      'Restrepo',
      'La Macarena',
    ],
  },
  {
    nombre: 'Nariño',
    ciudades: [
      'Pasto',
      'Tumaco',
      'Ipiales',
      'Túquerres',
      'Barbacoas',
      'La Unión',
      'Samaniego',
      'Sandona',
    ],
  },
  {
    nombre: 'Norte de Santander',
    ciudades: [
      'Cúcuta',
      'Ocaña',
      'Pamplona',
      'Villa del Rosario',
      'Los Patios',
      'Cáchira',
      'Tibú',
      'El Zulia',
      'Toledo',
    ],
  },
  {
    nombre: 'Putumayo',
    ciudades: [
      'Mocoa',
      'Puerto Asís',
      'Valle del Guamuez',
      'Orito',
      'Puerto Guzmán',
      'Villagarzón',
    ],
  },
  {
    nombre: 'Quindío',
    ciudades: [
      'Armenia',
      'Calarcá',
      'La Tebaida',
      'Montenegro',
      'Quimbaya',
      'Circasia',
      'Salento',
      'Filandia',
    ],
  },
  {
    nombre: 'Risaralda',
    ciudades: [
      'Pereira',
      'Dosquebradas',
      'Santa Rosa de Cabal',
      'La Virginia',
      'Marsella',
      'Belén de Umbría',
      'Santuario',
    ],
  },
  {
    nombre: 'San Andrés y Providencia',
    ciudades: ['San Andrés', 'Providencia'],
  },
  {
    nombre: 'Santander',
    ciudades: [
      'Bucaramanga',
      'Floridablanca',
      'Girón',
      'Piedecuesta',
      'Barrancabermeja',
      'San Gil',
      'Socorro',
      'Barbosa',
      'Málaga',
      'Vélez',
    ],
  },
  {
    nombre: 'Sucre',
    ciudades: [
      'Sincelejo',
      'Corozal',
      'Sampués',
      'San Marcos',
      'Tolú',
      'Coveñas',
      'Sincé',
      'San Onofre',
    ],
  },
  {
    nombre: 'Tolima',
    ciudades: [
      'Ibagué',
      'Espinal',
      'Girardot',
      'Melgar',
      'Honda',
      'Líbano',
      'Chaparral',
      'Mariquita',
      'Flandes',
    ],
  },
  {
    nombre: 'Valle del Cauca',
    ciudades: [
      'Alcalá',
      'Andalucía',
      'Ansermanuevo',
      'Argelia',
      'Bolívar',
      'Buenaventura',
      'Buga',
      'Bugalagrande',
      'Caicedonia',
      'Cali',
      'Calima',
      'Candelaria',
      'Cartago',
      'Dagua',
      'El Águila',
      'El Cairo',
      'El Cerrito',
      'El Dovio',
      'Florida',
      'Ginebra',
      'Guacarí',
      'Jamundí',
      'La Cumbre',
      'La Unión',
      'La Victoria',
      'Obando',
      'Palmira',
      'Pradera',
      'Restrepo',
      'Riofrío',
      'Roldanillo',
      'San Pedro',
      'Sevilla',
      'Toro',
      'Trujillo',
      'Tuluá',
      'Ulloa',
      'Versalles',
      'Vijes',
      'Yotoco',
      'Yumbo',
      'Zarzal',
    ],
  },
  {
    nombre: 'Vaupés',
    ciudades: ['Mitú', 'Carurú'],
  },
  {
    nombre: 'Vichada',
    ciudades: ['Puerto Carreño', 'Cumaribo', 'La Primavera'],
  },
]

// =====================================================
// HELPERS
// =====================================================

/**
 * Obtener lista de nombres de departamentos (ordenados alfabéticamente)
 */
export function getDepartamentos(): string[] {
  return DEPARTAMENTOS_COLOMBIA.map((d) => d.nombre).sort()
}

/**
 * Obtener municipios de un departamento (ordenados alfabéticamente)
 * @param departamento - Nombre del departamento
 * @returns Array de nombres de municipios
 */
export function getCiudadesPorDepartamento(departamento: string): string[] {
  const dept = DEPARTAMENTOS_COLOMBIA.find((d) => d.nombre === departamento)
  return dept ? dept.ciudades.sort() : []
}

/**
 * Validar si un municipio pertenece a un departamento
 * @param ciudad - Nombre del municipio (o "ciudad")
 * @param departamento - Nombre del departamento
 * @returns true si el municipio pertenece al departamento
 */
export function validarCiudadDepartamento(ciudad: string, departamento: string): boolean {
  const ciudades = getCiudadesPorDepartamento(departamento)
  return ciudades.includes(ciudad)
}
