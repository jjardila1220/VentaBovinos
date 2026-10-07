import { Bovine, Invoice, User, InventoryMovement } from '../types/database.ts';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Carlos Mendoza (Administrador)',
    email: 'admin@ganadocarnes.com',
    phone: '+57 311 450 8920',
    role: 'Administrador',
    status: 'Activo',
    passwordHash: 'admin123',
    city: 'Montería, Córdoba'
  },
  {
    id: 'USR-002',
    name: 'Valentina Rios (Asesora Comercial)',
    email: 'vendedor@ganadocarnes.com',
    phone: '+57 315 890 2311',
    role: 'Vendedor',
    status: 'Activo',
    passwordHash: 'vendedor123',
    city: 'Medellín, Antioquia'
  },
  {
    id: 'USR-003',
    name: 'Esteban Henao (Comprador)',
    email: 'cliente@ganadocarnes.com',
    phone: '+57 320 671 9044',
    role: 'Cliente',
    status: 'Activo',
    passwordHash: 'cliente123',
    city: 'Villavicencio, Meta'
  }
];

export const INITIAL_BOVINES: Bovine[] = [
  // 1. Vacas lecheras
  {
    id: 'BOV-001',
    name: 'Bella Holstein Supreme',
    category: 'Vacas lecheras',
    breed: 'Holstein',
    sex: 'Hembra',
    birthDay: '2023-01-15',
    age: 44,
    weight: 580,
    color: 'Blanco y negro',
    price: 6800000,
    status: 'Disponible',
    location: 'Sopó, Cundinamarca',
    registerDay: '2025-02-10',
    shortDescription: 'Excelente productora de leche de primer parto, conformación lechera óptima y ubre bien insertada.',
    fullDescription: 'Ejemplar Holstein pura con registro genealógico. Producción promedio de 28 litros diarios en dos ordeños. Ubres simétricas con ligamento suspensorio fuerte, excelente aplomo y docilidad.',
    characteristics: ['28 Lts/día promedio', 'Genética canadiense', 'Segundo parto garantizado', 'Docilidad comprobada'],
    healthHistory: {
      sanitaryRegistry: 'ICA-008492-CUN',
      aftosaVaccine: '2025-11-15',
      brucelosisVaccine: '2023-05-10',
      dewormingDate: '2026-01-20',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-002',
    name: 'Dulce Jersey Dorada',
    category: 'Vacas lecheras',
    breed: 'Jersey',
    sex: 'Hembra',
    birthDay: '2023-05-20',
    age: 40,
    weight: 440,
    color: 'Marrón café claro',
    price: 5900000,
    status: 'Disponible',
    location: 'Santa Rosa de Osos, Antioquia',
    registerDay: '2025-03-01',
    shortDescription: 'Alta concentración de grasa y proteína en leche, ideal para producción quesera artesanal.',
    fullDescription: 'Vaca Jersey pura de segundo parto. Destaca por su alta eficiencia de conversión alimenticia en pastoreo de trébol y ryegrass. Leche con 4.8% de sólidos totales.',
    characteristics: ['Alta grasa 4.8%', 'Resistente a topografía quebrada', 'Ubre glandular compacta', 'Partos sin asistencia'],
    healthHistory: {
      sanitaryRegistry: 'ICA-010488-ANT',
      aftosaVaccine: '2025-11-20',
      brucelosisVaccine: '2023-08-14',
      dewormingDate: '2026-02-12',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1596733430284-f7437764b14d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-003',
    name: 'Baviera Simmental Milk',
    category: 'Vacas lecheras',
    breed: 'Simmental',
    sex: 'Hembra',
    birthDay: '2022-11-10',
    age: 46,
    weight: 620,
    color: 'Rojo manchado blanco',
    price: 7400000,
    status: 'Disponible',
    location: 'Ubaté, Cundinamarca',
    registerDay: '2025-01-18',
    shortDescription: 'Doble propósito con balance lechero insuperable y excelente masa muscular.',
    fullDescription: 'Hembra Simmental fleckvieh de línea lechera europea. Producción de 22 litros con excelente longevidad y pezuñas oscuras resistentes a la humedad.',
    characteristics: ['Doble propósito', '22 Lts/día', 'Gran rusticidad', 'Excelente temperamento'],
    healthHistory: {
      sanitaryRegistry: 'ICA-009941-CUN',
      aftosaVaccine: '2025-11-10',
      brucelosisVaccine: '2023-02-18',
      dewormingDate: '2026-01-15',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 2. Novillos (Ceba y Levante)
  {
    id: 'BOV-004',
    name: 'Relámpago Brahman Blanco',
    category: 'Novillos',
    breed: 'Brahman',
    sex: 'Macho',
    birthDay: '2024-03-05',
    age: 31,
    weight: 480,
    color: 'Blanco perla',
    price: 4900000,
    status: 'Disponible',
    location: 'Montería, Córdoba',
    registerDay: '2025-04-12',
    shortDescription: 'Novillo de levante con giba prominente, gran profundidad corporal y ganancia de 950g/día.',
    fullDescription: 'Novillo Brahman blanco de excelente estructura ósea, dorso ancho y grupa amplia. Criado en pasto estrella y humidícola bajo estrictos parámetros nutricionales.',
    characteristics: ['Ganancia 950 g/día', 'Tolerante a calor extremo', 'Piel pigmentada', 'Hueso fuerte'],
    healthHistory: {
      sanitaryRegistry: 'ICA-005612-COR',
      aftosaVaccine: '2025-11-05',
      brucelosisVaccine: 'N/A (Macho)',
      dewormingDate: '2026-02-28',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-005',
    name: 'Titan Angus Black',
    category: 'Novillos',
    breed: 'Angus',
    sex: 'Macho',
    birthDay: '2024-02-18',
    age: 32,
    weight: 520,
    color: 'Negro azabache',
    price: 6200000,
    status: 'Disponible',
    location: 'La Ceja, Antioquia',
    registerDay: '2025-03-22',
    shortDescription: 'Genética de carne prémium con marmoleo superior y rápida conversión cárnica.',
    fullDescription: 'Novillo Angus puro sin cuernos (mocha natural). Excelente conformación de cuartos traseros, ideal para engorde final o sacrificio en programa de carne selecta.',
    characteristics: ['Mocho natural', 'Alto marmoleo', 'Lomo ancho y musculoso', 'Precoz'],
    healthHistory: {
      sanitaryRegistry: 'ICA-014490-ANT',
      aftosaVaccine: '2025-11-18',
      brucelosisVaccine: 'N/A (Macho)',
      dewormingDate: '2026-01-30',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-006',
    name: 'Cariñoso Brangus Colorado',
    category: 'Novillos',
    breed: 'Brangus',
    sex: 'Macho',
    birthDay: '2024-04-10',
    age: 30,
    weight: 460,
    color: 'Rojo caoba',
    price: 5300000,
    status: 'Disponible',
    location: 'Puerto López, Meta',
    registerDay: '2025-04-05',
    shortDescription: 'Cruce sintético 3/8 Brahman 5/8 Angus adaptado a sabana tropical.',
    fullDescription: 'Novillo con vigor híbrido excepcional. Combina resistencia ectoparásita del cebú con la terneza y canal limpia del Angus británico.',
    characteristics: ['Vigor híbrido', 'Rendimiento canal 59%', 'Rústico en sabana', 'Excelente ganancia'],
    healthHistory: {
      sanitaryRegistry: 'ICA-003310-MET',
      aftosaVaccine: '2025-11-25',
      brucelosisVaccine: 'N/A (Macho)',
      dewormingDate: '2026-02-10',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 3. Terneros
  {
    id: 'BOV-007',
    name: 'Lucero Brahman Rojo',
    category: 'Terneros',
    breed: 'Brahman',
    sex: 'Macho',
    birthDay: '2025-05-12',
    age: 17,
    weight: 230,
    color: 'Rojo cereza',
    price: 2800000,
    status: 'Disponible',
    location: 'Caucasia, Antioquia',
    registerDay: '2025-10-15',
    shortDescription: 'Ternero desteto precoz, hijo de campeones en pista ganadera del Bajo Cauca.',
    fullDescription: 'Excelente prospecto para futuro reproductor o ceba intensiva. Destete con 210 kg a los 7 meses. Madre con abundante leche y padre con IATF internacional.',
    characteristics: ['Destete precoz', 'Madre alta productora', 'Pigmentación impecable', 'Muy dócil'],
    healthHistory: {
      sanitaryRegistry: 'ICA-012903-ANT',
      aftosaVaccine: '2025-11-12',
      brucelosisVaccine: 'N/A',
      dewormingDate: '2026-03-01',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-008',
    name: 'Esperanza Holstein Jr',
    category: 'Terneros',
    breed: 'Holstein',
    sex: 'Hembra',
    birthDay: '2025-06-25',
    age: 15,
    weight: 195,
    color: 'Blanco y negro',
    price: 3200000,
    status: 'Disponible',
    location: 'Facatativá, Cundinamarca',
    registerDay: '2025-11-01',
    shortDescription: 'Ternera lechera con pedigrí cerrado de inseminación artificial de toro probado.',
    fullDescription: 'Ternera criada en cuna individual con leche pasteurizada y concentrado iniciador de alta proteína. Aplomos perfectos y gran apertura de costillas.',
    characteristics: ['Inseminación de toro probado', 'Excelente conformación lechera', 'Plan vacunal completo', 'Crianza en cuna'],
    healthHistory: {
      sanitaryRegistry: 'ICA-007781-CUN',
      aftosaVaccine: '2025-11-20',
      brucelosisVaccine: '2025-10-10 (Cepa 19)',
      dewormingDate: '2026-02-15',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-009',
    name: 'Capitán Simmental Jr',
    category: 'Terneros',
    breed: 'Simmental',
    sex: 'Macho',
    birthDay: '2025-04-18',
    age: 18,
    weight: 260,
    color: 'Bayo manchado',
    price: 3500000,
    status: 'Disponible',
    location: 'Tunja, Boyacá',
    registerDay: '2025-09-20',
    shortDescription: 'Ternero robusto de excelente desarrollo esquelético y rusticidad para clima frío.',
    fullDescription: 'Crecimiento sobresaliente con pastoreo rotacional. Excelente mansedumbre de manejo con bozal.',
    characteristics: ['Desarrollo rápido', 'Hueso ancho', 'Manso al bozal', 'Doble propósito'],
    healthHistory: {
      sanitaryRegistry: 'ICA-004452-BOY',
      aftosaVaccine: '2025-11-15',
      brucelosisVaccine: 'N/A',
      dewormingDate: '2026-02-05',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 4. Toros (Reproductores)
  {
    id: 'BOV-010',
    name: 'El Sultán Brahman Supremo',
    category: 'Toros',
    breed: 'Brahman',
    sex: 'Macho',
    birthDay: '2022-03-10',
    age: 55,
    weight: 940,
    color: 'Blanco plateado',
    price: 14500000,
    status: 'Disponible',
    location: 'Planeta Rica, Córdoba',
    registerDay: '2024-05-10',
    shortDescription: 'Toro reproductor de élite, examen andrológico vigente con 85% de motilidad espermática.',
    fullDescription: 'Semental Brahman con registro Asocebú. Gran circunferencia escrotal (44 cm), excelente líbido y prepucio corto y bien direccionado. Transmite musculatura y gran tamaño.',
    characteristics: ['Circunferencia escrotal 44 cm', 'Andrológico 85% motilidad', 'Registro Asocebú', 'Prepucio óptimo'],
    healthHistory: {
      sanitaryRegistry: 'ICA-001920-COR',
      aftosaVaccine: '2025-11-01',
      brucelosisVaccine: 'N/A (Negativo serológico)',
      dewormingDate: '2026-02-01',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-011',
    name: 'Mariscal Angus Red Semental',
    category: 'Toros',
    breed: 'Angus',
    sex: 'Macho',
    birthDay: '2022-08-14',
    age: 50,
    weight: 890,
    color: 'Rojo cereza oscuro',
    price: 13200000,
    status: 'Disponible',
    location: 'Rionegro, Antioquia',
    registerDay: '2024-08-20',
    shortDescription: 'Toro Red Angus con pruebas de progenie con facilidad de parto y crías de alta calidad cárnica.',
    fullDescription: 'Toro ideal para cruzamiento industrial sobre hembras cebuinas (F1 Angus x Brahman). Crías homogéneas, sin cuernos y con rápido acabado a corral o pasto.',
    characteristics: ['Facilidad de parto comprobada', 'Ideal cruzamiento F1', 'Excelente conformación', 'Andrológico al 100%'],
    healthHistory: {
      sanitaryRegistry: 'ICA-011234-ANT',
      aftosaVaccine: '2025-11-10',
      brucelosisVaccine: 'N/A (Libre)',
      dewormingDate: '2026-01-25',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-012',
    name: 'Conquistador Simmental Fleckvieh',
    category: 'Toros',
    breed: 'Simmental',
    sex: 'Macho',
    birthDay: '2022-06-02',
    age: 52,
    weight: 980,
    color: 'Rojo overo',
    price: 12800000,
    status: 'Vendido',
    location: 'Chiquinquirá, Boyacá',
    registerDay: '2024-06-15',
    shortDescription: 'Impresionante masa muscular y aplomos firmes. Transmite excelente rendimiento en carne y leche.',
    fullDescription: 'Ejemplar Simmental de gran alzada y mansedumbre. Se vendió en subasta ganadera con récord de pujas.',
    characteristics: ['Peso 980 kg', 'Línea alemana pura', 'Docilidad suprema', 'Vendido en remate'],
    healthHistory: {
      sanitaryRegistry: 'ICA-006734-BOY',
      aftosaVaccine: '2025-11-05',
      brucelosisVaccine: 'N/A',
      dewormingDate: '2026-01-18',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'BOV-013',
    name: 'Reina Gyr Lechera Tropical',
    category: 'Vacas lecheras',
    breed: 'Gyr',
    sex: 'Hembra',
    birthDay: '2023-03-12',
    age: 42,
    weight: 510,
    color: 'Moteado rojizo',
    price: 8200000,
    status: 'Disponible',
    location: 'Doradal, Antioquia',
    registerDay: '2025-02-15',
    shortDescription: 'Cebuina lechera resistente a garrapatas y altas temperaturas, ubre espaciosa y pezones correctos.',
    fullDescription: 'Hembra Gyr con control lechero oficial de 18 litros en condiciones de trópico bajo húmedo sin necesidad de estabulación.',
    characteristics: ['18 Lts pastoreo tropical', 'Inmune a calores intensos', 'Genética brasilera', 'Ubre con gran soporte'],
    healthHistory: {
      sanitaryRegistry: 'ICA-008129-ANT',
      aftosaVaccine: '2025-11-20',
      brucelosisVaccine: '2023-06-10',
      dewormingDate: '2026-02-25',
      certified: true
    },
    images: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'FAC-2026-000001',
    date: '2026-02-14T10:30:00.000Z',
    buyer: {
      name: 'Agropecuaria Las Palmas S.A.S',
      document: '900.564.312-8',
      phone: '+57 310 987 6543',
      email: 'gerencia@laspalmas.com.co',
      address: 'Km 12 Vía Aeropuerto',
      city: 'Montería, Córdoba'
    },
    items: [
      {
        bovineId: 'BOV-012',
        name: 'Conquistador Simmental Fleckvieh',
        breed: 'Simmental',
        category: 'Toros',
        price: 12800000
      }
    ],
    subtotal: 12800000,
    shipping: 0,
    total: 12800000,
    paymentMethod: 'Transferencia Bancaria',
    status: 'Completado',
    createdByName: 'Valentina Rios (Asesora Comercial)',
    createdById: 'USR-002'
  },
  {
    id: 'FAC-2026-000002',
    date: '2026-02-20T15:45:00.000Z',
    buyer: {
      name: 'Jorge Eliécer Cárdenas',
      document: '71.294.881',
      phone: '+57 312 443 2190',
      email: 'jorge.cardenas@fincasanrafael.co',
      address: 'Finca San Rafael, Vereda Chupillal',
      city: 'Rionegro, Antioquia'
    },
    items: [
      {
        bovineId: 'BOV-001',
        name: 'Bella Holstein Supreme (Muestra Anterior)',
        breed: 'Holstein',
        category: 'Vacas lecheras',
        price: 6500000
      }
    ],
    subtotal: 6500000,
    shipping: 0,
    total: 6500000,
    paymentMethod: 'Efectivo en Predio',
    status: 'Completado',
    createdByName: 'Carlos Mendoza (Administrador)',
    createdById: 'USR-001'
  },
  {
    id: 'FAC-2026-000003',
    date: '2026-03-01T11:10:00.000Z',
    buyer: {
      name: 'Ganadera Santa María Ltda',
      document: '890.312.445-1',
      phone: '+57 318 776 5432',
      email: 'compras@santamaria.com',
      address: 'Sector El Trapiche',
      city: 'Villavicencio, Meta'
    },
    items: [
      {
        bovineId: 'BOV-005',
        name: 'Titan Angus Black (Lote 1)',
        breed: 'Angus',
        category: 'Novillos',
        price: 5900000
      }
    ],
    subtotal: 5900000,
    shipping: 0,
    total: 5900000,
    paymentMethod: 'Transferencia Bancaria',
    status: 'Completado',
    createdByName: 'Valentina Rios (Asesora Comercial)',
    createdById: 'USR-002'
  },
  {
    id: 'FAC-2026-000004',
    date: '2026-03-12T16:20:00.000Z',
    buyer: {
      name: 'Hacienda El Rocío',
      document: '901.884.221-5',
      phone: '+57 314 556 7890',
      email: 'elrocio@ganado.com',
      address: 'Vereda Las Peñas, Km 4',
      city: 'Yopal, Casanare'
    },
    items: [
      {
        bovineId: 'BOV-007',
        name: 'Lucero Brahman Rojo (Lote Ant)',
        breed: 'Brahman',
        category: 'Terneros',
        price: 2700000
      }
    ],
    subtotal: 2700000,
    shipping: 0,
    total: 2700000,
    paymentMethod: 'Tarjeta de Crédito',
    status: 'Completado',
    createdByName: 'Carlos Mendoza (Administrador)',
    createdById: 'USR-001'
  },
  {
    id: 'FAC-2026-000005',
    date: '2026-03-25T09:15:00.000Z',
    buyer: {
      name: 'Manuel Guillermo Pardo',
      document: '19.456.882',
      phone: '+57 317 334 9012',
      email: 'manuel.pardo@gmail.com',
      address: 'Calle 14 # 8-40, Barrio San Roque',
      city: 'Bucaramanga, Santander'
    },
    items: [
      {
        bovineId: 'BOV-002',
        name: 'Dulce Jersey Dorada (Lote Especial)',
        breed: 'Jersey',
        category: 'Vacas lecheras',
        price: 5700000
      }
    ],
    subtotal: 5700000,
    shipping: 0,
    total: 5700000,
    paymentMethod: 'Transferencia Bancaria',
    status: 'Completado',
    createdByName: 'Valentina Rios (Asesora Comercial)',
    createdById: 'USR-002'
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'MOV-001',
    date: '2026-02-14T10:30:00.000Z',
    type: 'Venta',
    bovineId: 'BOV-012',
    bovineName: 'Conquistador Simmental Fleckvieh',
    reference: 'FAC-2026-000001',
    user: 'Valentina Rios (Vendedor)'
  },
  {
    id: 'MOV-002',
    date: '2026-02-10T08:00:00.000Z',
    type: 'Entrada',
    bovineId: 'BOV-001',
    bovineName: 'Bella Holstein Supreme',
    reference: 'Ingreso Hato Lechero Sopó',
    user: 'Carlos Mendoza (Admin)'
  },
  {
    id: 'MOV-003',
    date: '2026-02-15T09:30:00.000Z',
    type: 'Entrada',
    bovineId: 'BOV-010',
    bovineName: 'El Sultán Brahman Supremo',
    reference: 'Compra en Subasta Planeta Rica',
    user: 'Carlos Mendoza (Admin)'
  },
  {
    id: 'MOV-004',
    date: '2026-02-20T15:45:00.000Z',
    type: 'Venta',
    bovineId: 'BOV-001',
    bovineName: 'Bella Holstein Supreme (Muestra Anterior)',
    reference: 'FAC-2026-000002',
    user: 'Carlos Mendoza (Admin)'
  },
  {
    id: 'MOV-005',
    date: '2026-03-01T11:10:00.000Z',
    type: 'Venta',
    bovineId: 'BOV-005',
    bovineName: 'Titan Angus Black (Lote 1)',
    reference: 'FAC-2026-000003',
    user: 'Valentina Rios (Vendedor)'
  }
];
